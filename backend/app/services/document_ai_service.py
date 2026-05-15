from sentence_transformers import SentenceTransformer
import faiss
import numpy as np


embedder = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


def chunk_text(text, chunk_size=300):
    chunks = []

    for i in range(0, len(text), chunk_size):
        chunks.append(
            text[i:i + chunk_size]
        )

    return chunks


def summarize_text(text):
    if len(text) > 1200:
        text = text[:1200]

    sentences = text.split(".")
    summary = ".".join(sentences[:8])

    return summary


def create_vector_index(chunks):
    embeddings = embedder.encode(chunks)

    dimension = embeddings.shape[1]

    index = faiss.IndexFlatL2(dimension)

    index.add(
        np.array(embeddings).astype("float32")
    )

    return index, chunks


def answer_question(question, index, chunks):
    query_embedding = embedder.encode([question])

    distances, indices = index.search(
        np.array(query_embedding).astype("float32"),
        3
    )

    relevant_chunks = [
        chunks[i]
        for i in indices[0]
    ]

    return "\n".join(relevant_chunks)