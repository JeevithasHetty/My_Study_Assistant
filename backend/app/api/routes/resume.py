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
from app.models.resume import Resume
from app.models.resume_chunk import ResumeChunk

from app.schemas.resume import (
    ResumeResponse,
    ResumeAnalysisRequest
)

from app.utils.file_parser import (
    extract_pdf_text,
    extract_docx_text
)

from app.services.resume_ai_service import (
    analyze_resume,
    chunk_text
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/resume",
    tags=["Resume"]
)


@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
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

    if extension not in settings.ALLOWED_RESUME_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Only {', '.join(settings.ALLOWED_RESUME_EXTENSIONS)} supported"
        )

    os.makedirs(
        settings.RESUME_UPLOAD_DIR,
        exist_ok=True
    )

    # Sanitize filename to prevent path traversal attacks
    safe_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(
        settings.RESUME_UPLOAD_DIR,
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

        if extension == ".pdf":
            extracted = extract_pdf_text(file_path)
        else:
            extracted = extract_docx_text(file_path)

        resume = Resume(
            filename=file.filename,
            file_path=file_path,
            extracted_text=extracted,
            user_id=user.id
        )

        db.add(resume)
        db.commit()
        db.refresh(resume)

        chunks = chunk_text(extracted, settings.CHUNK_SIZE)

        for chunk in chunks:
            db_chunk = ResumeChunk(
                content=chunk,
                resume_id=resume.id
            )

            db.add(db_chunk)

        db.commit()
        logger.info(f"Resume uploaded successfully: {resume.id}")

        return resume

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading resume: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to upload resume"
        )


@router.post("/analyze/{resume_id}", response_model=ResumeResponse)
def analyze_uploaded_resume(
    resume_id: int,
    request: ResumeAnalysisRequest,
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

    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == user.id
    ).first()

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found"
        )

    try:
        analysis = analyze_resume(
            resume.extracted_text,
            user.placement_target,
            request.job_description
        )

        resume.analysis = analysis

        db.commit()
        db.refresh(resume)
        logger.info(f"Resume analyzed: {resume.id}")

        return resume
    except Exception as e:
        logger.error(f"Error analyzing resume: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to analyze resume"
        )


@router.get("/latest", response_model=ResumeResponse)
def latest_resume(
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

    resume = db.query(Resume).filter(
        Resume.user_id == user.id
    ).order_by(
        Resume.created_at.desc()
    ).first()

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="No resume found"
        )

    return resume
