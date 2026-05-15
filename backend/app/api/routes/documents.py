import os
import aiofiles

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_token

from app.models.user import User
from app.models.uploaded_document import UploadedDocument
from app.models.document_chunk import DocumentChunk

from app.schemas.document import DocumentResponse

from app.utils.file_parser import extract_text
from app.services.document_ai_service import (
    chunk_text,
    summarize_text,
    create_vector_index,
    answer_question
)

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)

UPLOAD_DIR = "uploads"


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    extension = os.path.splitext(
        file.filename
    )[1].lower()

    if extension not in [".pdf", ".docx", ".pptx"]:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format"
        )

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    file_path = os.path.join(
        UPLOAD_DIR,
        file.filename
    )

    async with aiofiles.open(
        file_path,
        "wb"
    ) as out_file:
        content = await file.read()
        await out_file.write(content)

    text = extract_text(
        file_path,
        extension
    )

    new_doc = UploadedDocument(
        filename=file.filename,
        file_path=file_path,
        document_type=extension,
        file_size=len(content),
        user_id=user.id
    )

    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    chunks = chunk_text(text)

    for chunk in chunks:
        db_chunk = DocumentChunk(
            content=chunk,
            document_id=new_doc.id
        )
        db.add(db_chunk)

    db.commit()

    return new_doc


@router.get("/summarize/{document_id}")
def summarize_document(
    document_id: int,
    email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    chunks = db.query(DocumentChunk).filter(
        DocumentChunk.document_id == document_id
    ).all()

    text = " ".join(
        chunk.content for chunk in chunks
    )

    summary = summarize_text(text)

    return {
        "summary": summary
    }


@router.post("/ask/{document_id}")
def ask_document_question(
    document_id: int,
    question: str,
    email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    chunks = db.query(DocumentChunk).filter(
        DocumentChunk.document_id == document_id
    ).all()

    texts = [
        chunk.content for chunk in chunks
    ]

    index, stored_chunks = create_vector_index(
        texts
    )

    answer = answer_question(
        question,
        index,
        stored_chunks
    )

    return {
        "answer": answer
    }