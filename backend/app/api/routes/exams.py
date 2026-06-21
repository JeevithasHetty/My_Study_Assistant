from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, Exam, Notification
from app.schemas import ExamCreate, ExamUpdate, ExamOut
from datetime import datetime, timezone

router = APIRouter(prefix="/exams", tags=["exams"])


@router.get("/", response_model=List[ExamOut])
def get_exams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Exam)
        .filter(Exam.user_id == current_user.id)
        .order_by(Exam.exam_date.asc())
        .all()
    )


@router.post("/", response_model=ExamOut, status_code=201)
def create_exam(
    payload: ExamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exam = Exam(user_id=current_user.id, **payload.model_dump())
    db.add(exam)
    db.commit()
    db.refresh(exam)

    # Auto-create reminder notification
    days_left = (exam.exam_date.replace(tzinfo=None) - datetime.utcnow()).days
    notif = Notification(
        user_id=current_user.id,
        title=f"Exam Added: {exam.name}",
        message=f"{exam.name} is scheduled in {days_left} days on {exam.exam_date.strftime('%B %d')}. Start your preparation now!",
        type="exam",
        priority="high" if days_left <= 14 else "medium",
    )
    db.add(notif)
    db.commit()

    return exam


@router.put("/{exam_id}", response_model=ExamOut)
def update_exam(
    exam_id: int,
    payload: ExamUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.user_id == current_user.id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(exam, key, value)
    db.commit()
    db.refresh(exam)
    return exam


@router.delete("/{exam_id}")
def delete_exam(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.user_id == current_user.id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    db.delete(exam)
    db.commit()
    return {"success": True}


@router.get("/{exam_id}/readiness")
def get_exam_readiness(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.user_id == current_user.id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    days_left = max(0, (exam.exam_date.replace(tzinfo=None) - datetime.utcnow()).days)
    recommendations = [
        f"Focus 2h/day on {exam.topics[0] if exam.topics else 'core topics'} — highest weightage",
        "Complete past papers for pattern analysis",
        "Create quick-revision notes 2 days before exam",
        f"You have {days_left} days left — {'start immediately!' if days_left < 7 else 'stay consistent!'}",
    ]
    return {
        "exam_id": exam_id,
        "readiness_score": exam.readiness_score,
        "days_left": days_left,
        "recommendations": recommendations,
    }
