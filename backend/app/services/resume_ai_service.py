import requests
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np


OLLAMA_URL = "http://localhost:11434/api/generate"

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
        5
    )

    relevant = [
        chunks[i]
        for i in indices[0]
    ]

    return "\n".join(relevant)


def analyze_resume(
    resume_text: str,
    placement_target: str
):
    chunks = chunk_text(resume_text)

    index, stored_chunks = create_vector_index(chunks)

    relevant_resume = retrieve_relevant_resume_sections(
        f"skills projects internships experience for {placement_target}",
        index,
        stored_chunks
    )

    prompt = f"""
You are an expert ATS and placement coach.

Target role:
{placement_target}

Resume relevant content:
{relevant_resume}

Provide:
1. ATS score out of 100
2. Missing technical skills
3. Missing keywords
4. Weak project areas
5. Resume improvement suggestions
6. 30-day placement roadmap
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": "tinyllama",
                "prompt": prompt,
                "stream": False
            },
            timeout=180
        )

        data = response.json()

        if "response" in data:
            return data["response"]

        elif "error" in data:
            return f"Ollama Error: {data['error']}"

        return str(data)

    except Exception as e:
        return f"Resume AI failed: {str(e)}"