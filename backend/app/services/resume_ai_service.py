import os
import json
from dotenv import load_dotenv
from groq import Groq
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np


load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

embedder = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


def chunk_text(text, chunk_size=500):
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
        10
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
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are an ATS evaluator."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2,
            max_tokens=1500
        )

        content = response.choices[0].message.content

        try:
            parsed = json.loads(content)
            return json.dumps(parsed, indent=2)
        except:
            return content

    except Exception as e:
        return f"Resume analysis failed: {str(e)}"