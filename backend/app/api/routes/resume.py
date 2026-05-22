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

router = APIRouter(
    prefix="/resume",
    tags=["Resume"]
)

UPLOAD_DIR = "resume_uploads"


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

    if extension not in [".pdf", ".docx"]:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX supported"
        )

    os.makedirs(
        UPLOAD_DIR,
        exist_ok=True
    )

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

    chunks = chunk_text(extracted)

    for chunk in chunks:
        db_chunk = ResumeChunk(
            content=chunk,
            resume_id=resume.id
        )

        db.add(db_chunk)

    db.commit()

    return resume


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

    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == user.id
    ).first()

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found"
        )

    analysis = analyze_resume(
        resume.extracted_text,
        user.placement_target,
        request.job_description
    )

    resume.analysis = analysis

    db.commit()
    db.refresh(resume)

    return resume


@router.get("/latest", response_model=ResumeResponse)
def latest_resume(
    email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == email
    ).first()

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