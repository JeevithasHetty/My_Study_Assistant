import fitz  # PyMuPDF
from pathlib import Path


def extract_text_from_pdf(file_path: str) -> tuple[str, int]:
    """
    Extract text from a PDF file.
    Returns (text, page_count)
    """
    try:
        doc = fitz.open(file_path)
        page_count = len(doc)
        text_parts = []
        for page in doc:
            text = page.get_text("text")
            if text.strip():
                text_parts.append(text)
        doc.close()
        full_text = "\n\n".join(text_parts)
        return full_text, page_count
    except Exception as e:
        return f"Could not extract text: {str(e)}", 0


def estimate_study_hours(page_count: int, text_length: int) -> float:
    """Estimate how long it takes to study a document."""
    # ~250 words per minute reading, ~180 words per page
    words = text_length / 5  # avg 5 chars per word
    reading_hours = words / (250 * 60)
    # Add 50% for note-taking and understanding
    study_hours = reading_hours * 1.5
    return round(max(0.5, min(study_hours, 20)), 1)


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 100) -> list[str]:
    """Split text into overlapping chunks for AI processing."""
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks
