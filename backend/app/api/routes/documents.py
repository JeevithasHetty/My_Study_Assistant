import os
import uuid
import logging
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
from app.core.settings import settings

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

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


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

    if extension not in settings.ALLOWED_DOCUMENT_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Allowed: {', '.join(settings.ALLOWED_DOCUMENT_EXTENSIONS)}"
        )

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Sanitize filename to prevent path traversal attacks
    safe_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(
        settings.UPLOAD_DIR,
        safe_filename
    )

    try:
        content = await file.read()

        # Validate file size
        if len(content) > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE / (1024*1024):.0f}MB"
            )

        async with aiofiles.open(
            file_path,
            "wb"
        ) as out_file:
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

        chunks = chunk_text(text, settings.CHUNK_SIZE)

        for chunk in chunks:
            db_chunk = DocumentChunk(
                content=chunk,
                document_id=new_doc.id
            )
            db.add(db_chunk)

        db.commit()
        logger.info(f"Document uploaded successfully: {new_doc.id}")

        return new_doc

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to upload document"
        )


@router.get("/summarize/{document_id}")
def summarize_document(
    document_id: int,
    email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    chunks = db.query(DocumentChunk).filter(
        DocumentChunk.document_id == document_id
    ).all()

    if not chunks:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    text = " ".join(
        chunk.content for chunk in chunks
    )

    try:
        summary = summarize_text(text)
        return {"summary": summary}
    except Exception as e:
        logger.error(f"Error summarizing document: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to summarize document"
        )


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

    if not chunks:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    texts = [
        chunk.content for chunk in chunks
    ]

    try:
        index, stored_chunks = create_vector_index(
            texts
        )

        answer = answer_question(
            question,
            index,
            stored_chunks
        )

        return {"answer": answer}
    except Exception as e:
        logger.error(f"Error answering question: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to answer question"
        )
