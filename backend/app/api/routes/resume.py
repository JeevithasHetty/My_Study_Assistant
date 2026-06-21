import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user
from app.models import User, Resume, ResumeChunk, Notification
from app.schemas import ResumeOut, ResumeAnalysis, AnalyzeJD
from app.services.pdf_service import extract_text_from_pdf, chunk_text
from app.services.groq_service import analyze_resume, compare_resume_jd, generate_career_roadmap

router = APIRouter(prefix="/resume", tags=["resume"])

os.makedirs(settings.RESUME_UPLOAD_DIR, exist_ok=True)


@router.get("/", response_model=List[ResumeOut])
def get_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.created_at.desc())
        .all()
    )


@router.post("/upload", status_code=201)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename.lower().endswith((".pdf", ".doc", ".docx")):
        raise HTTPException(status_code=400, detail="Only PDF, DOC, DOCX files allowed")

    # Save file
    safe_name = f"resume_{current_user.id}_{file.filename}"
    file_path = os.path.join(settings.RESUME_UPLOAD_DIR, safe_name)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Extract text
    raw_text, _ = extract_text_from_pdf(file_path) if file.filename.endswith(".pdf") else ("", 0)

    resume = Resume(
        user_id=current_user.id,
        filename=safe_name,
        file_path=file_path,
        raw_text=raw_text,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    # Store chunks for AI querying
    if raw_text:
        chunks = chunk_text(raw_text)
        for i, chunk in enumerate(chunks):
            db.add(ResumeChunk(resume_id=resume.id, chunk_text=chunk, chunk_index=i))
        db.commit()

    return {"resume_id": resume.id, "filename": safe_name, "message": "Uploaded successfully"}


@router.get("/{resume_id}/analysis")
def get_analysis(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Return cached analysis if available
    if resume.is_analyzed and resume.ats_score is not None:
        return {
            "ats_score": resume.ats_score,
            "present_skills": resume.present_skills,
            "missing_skills": resume.missing_skills,
            "suggestions": resume.suggestions,
            "job_matches": resume.job_matches,
            "section_scores": resume.section_scores,
        }

    if not resume.raw_text:
        raise HTTPException(status_code=400, detail="No text extracted from resume")

    # Analyze with Groq AI
    result = analyze_resume(resume.raw_text)

    # Cache results
    resume.ats_score = result.get("ats_score", 0)
    resume.present_skills = result.get("present_skills", [])
    resume.missing_skills = result.get("missing_skills", [])
    resume.suggestions = result.get("suggestions", [])
    resume.job_matches = result.get("job_matches", [])
    resume.section_scores = result.get("section_scores", {})
    resume.is_analyzed = True
    db.commit()

    # Notify
    notif = Notification(
        user_id=current_user.id,
        title=f"Resume Analyzed — ATS Score: {resume.ats_score}%",
        message=f"Your resume scored {resume.ats_score}/100. Found {len(resume.missing_skills)} missing skills. Check recommendations!",
        type="ai",
        priority="high" if resume.ats_score < 60 else "medium",
    )
    db.add(notif)
    db.commit()

    return {
        "ats_score": resume.ats_score,
        "present_skills": resume.present_skills,
        "missing_skills": resume.missing_skills,
        "suggestions": resume.suggestions,
        "job_matches": resume.job_matches,
        "section_scores": resume.section_scores,
    }


@router.post("/{resume_id}/analyze-jd")
def analyze_jd(
    resume_id: int,
    payload: AnalyzeJD,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume or not resume.raw_text:
        raise HTTPException(status_code=404, detail="Resume not found or not processed")
    return compare_resume_jd(resume.raw_text, payload.job_description)


@router.get("/{resume_id}/roadmap")
def get_roadmap(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume or not resume.raw_text:
        raise HTTPException(status_code=404, detail="Resume not found")
    return generate_career_roadmap(resume.raw_text, current_user.target_role or "Software Engineer")
