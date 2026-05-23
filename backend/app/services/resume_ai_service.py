import os
import json
import logging
from dotenv import load_dotenv
from groq import Groq
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

from app.core.settings import settings

load_dotenv()
logger = logging.getLogger(__name__)

client = Groq(
    api_key=settings.GROQ_API_KEY
)

embedder = SentenceTransformer(
    settings.EMBEDDER_MODEL
)


def chunk_text(text, chunk_size=None):
    if chunk_size is None:
        chunk_size = settings.CHUNK_SIZE

    chunks = []

    for i in range(0, len(text), chunk_size):
        chunks.append(
            text[i:i + chunk_size]
        )

    return chunks


def create_vector_index(chunks):
    embeddings = embedder.encode(chunks)

    dimension = embeddings.shape[1]

    index = faiss.IndexFlatL2(dimension)

    index.add(
        np.array(embeddings).astype("float32")
    )

    return index, chunks


def retrieve_relevant_resume_sections(
    query,
    index,
    chunks
):
    query_embedding = embedder.encode([query])

    distances, indices = index.search(
        np.array(query_embedding).astype("float32"),
        settings.FAISS_SEARCH_RESULTS
    )

    relevant_chunks = [
        chunks[i]
        for i in indices[0]
    ]

    return "\n".join(relevant_chunks)


def analyze_resume(
    resume_text: str,
    placement_target: str,
    job_description: str = None
):
    chunks = chunk_text(resume_text)

    index, stored_chunks = create_vector_index(chunks)

    search_query = f"""
placement target: {placement_target}
job description: {job_description}
skills
projects
internships
certifications
technical skills
experience
"""

    relevant_resume = retrieve_relevant_resume_sections(
        search_query,
        index,
        stored_chunks
    )

    prompt = f"""
You are an expert ATS evaluator and placement mentor.

Student Placement Target:
{placement_target}

Job Description:
{job_description}

Relevant Resume Content:
{relevant_resume}

TASK:
Analyze this resume dynamically.

Rules:
1. Use ONLY actual resume content.
2. If job description exists, compare against it.
3. Infer missing skills dynamically.
4. Infer missing keywords dynamically.
5. Give realistic ATS score.
6. No assumptions.

Return ONLY JSON:

{{
  "ats_score": number,
  "matched_skills": [],
  "missing_skills": [],
  "missing_keywords": [],
  "weak_resume_sections": [],
  "improvement_suggestions": []
}}
"""

    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are an ATS evaluator. Return only valid JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=settings.AI_TEMPERATURE,
            max_tokens=settings.MAX_AI_TOKENS_RESUME
        )

        content = response.choices[0].message.content

        try:
            parsed = json.loads(content)
            logger.info("Resume analysis completed successfully")
            return json.dumps(parsed, indent=2)
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse AI response as JSON: {e}")
            return content

    except Exception as e:
        logger.error(f"Resume analysis failed: {str(e)}")
        return f"Resume analysis failed: {str(e)}"
