import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user
from app.models import User, UploadedDocument, DocumentChunk
from app.schemas import DocumentOut, AskQuestion
from app.services.pdf_service import extract_text_from_pdf, estimate_study_hours, chunk_text
from app.services.groq_service import (
    generate_summary, generate_concepts, generate_flashcards,
    generate_mcqs, answer_question
)
from app.services.youtube_service import search_youtube_videos

router = APIRouter(prefix="/documents", tags=["documents"])

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


@router.get("/", response_model=List[DocumentOut])
def get_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(UploadedDocument)
        .filter(UploadedDocument.user_id == current_user.id)
        .order_by(UploadedDocument.created_at.desc())
        .all()
    )


@router.post("/upload", status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    safe_name = f"doc_{current_user.id}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_name)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    raw_text, pages = extract_text_from_pdf(file_path)
    study_hours = estimate_study_hours(pages, len(raw_text))

    doc = UploadedDocument(
        user_id=current_user.id,
        filename=safe_name,
        original_filename=file.filename,
        file_path=file_path,
        pages=pages,
        raw_text=raw_text,
        estimated_study_hours=study_hours,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Store text chunks for Q&A
    if raw_text:
        for i, chunk in enumerate(chunk_text(raw_text)):
            db.add(DocumentChunk(document_id=doc.id, chunk_text=chunk, chunk_index=i))
        db.commit()

    return {
        "id": doc.id,
        "doc_id": doc.id,
        "filename": safe_name,
        "original_filename": file.filename,
        "pages": pages,
        "estimated_study_hours": study_hours,
    }


def _get_doc(doc_id: int, user_id: int, db: Session) -> UploadedDocument:
    doc = db.query(UploadedDocument).filter(
        UploadedDocument.id == doc_id,
        UploadedDocument.user_id == user_id,
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.get("/{doc_id}/summary")
def get_summary(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = _get_doc(doc_id, current_user.id, db)
    if not doc.summary:
        doc.summary = generate_summary(doc.raw_text or "No content available")
        db.commit()
    return {"summary": doc.summary}


@router.get("/{doc_id}/concepts")
def get_concepts(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = _get_doc(doc_id, current_user.id, db)
    if not doc.concepts:
        doc.concepts = generate_concepts(doc.raw_text or "")
        db.commit()
    return {"concepts": doc.concepts}


@router.get("/{doc_id}/flashcards")
def get_flashcards(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = _get_doc(doc_id, current_user.id, db)
    if not doc.flashcards:
        doc.flashcards = generate_flashcards(doc.raw_text or "")
        db.commit()
    return {"flashcards": doc.flashcards}


@router.get("/{doc_id}/mcqs")
def get_mcqs(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = _get_doc(doc_id, current_user.id, db)
    if not doc.mcqs:
        doc.mcqs = generate_mcqs(doc.raw_text or "")
        db.commit()
    return {"questions": doc.mcqs}


@router.post("/{doc_id}/ask")
def ask_question(
    doc_id: int,
    payload: AskQuestion,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = _get_doc(doc_id, current_user.id, db)
    answer = answer_question(doc.raw_text or "", payload.question)
    return {"answer": answer, "question": payload.question}


@router.get("/{doc_id}/youtube")
def get_youtube(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = _get_doc(doc_id, current_user.id, db)
    if not doc.youtube_videos:
        topic = doc.original_filename.replace(".pdf", "").replace("_", " ").replace("-", " ")
        doc.youtube_videos = search_youtube_videos(topic)
        db.commit()
    return {"videos": doc.youtube_videos}
