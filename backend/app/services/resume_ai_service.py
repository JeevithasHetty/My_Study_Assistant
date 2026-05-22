import os
from dotenv import load_dotenv

from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

from groq import Groq


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
        chunks.append(text[i:i + chunk_size])

    return chunks


def create_vector_index(chunks):
    embeddings = embedder.encode(chunks)

    dimension = embeddings.shape[1]

    index = faiss.IndexFlatL2(dimension)

    index.add(
        np.array(embeddings).astype("float32")
    )

    return index, chunks


def retrieve_relevant_resume_sections(query, index, chunks):
    query_embedding = embedder.encode([query])

    distances, indices = index.search(
        np.array(query_embedding).astype("float32"),
        12
    )

    relevant = [
        chunks[i]
        for i in indices[0]
    ]

    return "\n".join(relevant)


def analyze_resume(
    resume_text: str,
    placement_target: str,
    job_description: str = None
):
    chunks = chunk_text(resume_text)

    index, stored_chunks = create_vector_index(chunks)

    if job_description:
        retrieval_query = (
            job_description +
            " projects internships certifications skills achievements experience education"
        )
    else:
        retrieval_query = (
            f"{placement_target} skills projects certifications internships experience achievements"
        )

    relevant_resume = retrieve_relevant_resume_sections(
        retrieval_query,
        index,
        stored_chunks
    )

    if job_description:
        system_prompt = """
You are an expert ATS evaluator and technical recruiter.

STRICT RULES:

1. Analyze ONLY the student's actual resume content.
2. Compare ONLY against the provided job description.
3. DO NOT invent missing skills.
4. DO NOT assume "advanced knowledge" is required unless explicitly stated.
5. If the job description says "basic understanding", count matching basic skills.
6. If a skill appears in projects, certifications, internships, or experience, count it.
7. Differentiate between REQUIRED skills and NICE-TO-HAVE skills.
8. ATS score must be realistic.

Return EXACTLY in this format:

ATS Score: X/100

Required Skills Matched
- bullets

Required Skills Missing
- bullets

Nice-to-Have Skills Missing
- bullets

Missing Keywords
- bullets

Weak Resume Sections
- bullets

Improvement Suggestions
- bullets
"""
        user_prompt = f"""
JOB DESCRIPTION:
{job_description}

STUDENT RESUME:
{relevant_resume}
"""
    else:
        system_prompt = """
You are an expert placement mentor.

Analyze the student's resume for the target role.

Return:

ATS Score: X/100

Strengths
- bullets

Missing Skills
- bullets

Weak Resume Sections
- bullets

Improvement Suggestions
- bullets

30-Day Skill Roadmap
"""
        user_prompt = f"""
TARGET ROLE:
{placement_target}

STUDENT RESUME:
{relevant_resume}
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ],
            temperature=0.2,
            max_tokens=1400
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"Groq Resume AI failed: {str(e)}"