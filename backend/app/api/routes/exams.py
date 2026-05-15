from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_token
from app.models.user import User
from app.models.exam import Exam
from app.schemas.exam import ExamCreate, ExamResponse

router = APIRouter(
    prefix="/exams",
    tags=["Exams"]
)


@router.post("/", response_model=ExamResponse)
def create_exam(
    exam: ExamCreate,
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

    new_exam = Exam(
        subject=exam.subject,
        syllabus_size=exam.syllabus_size,
        exam_date=exam.exam_date,
        importance=exam.importance,
        user_id=user.id
    )

    db.add(new_exam)
    db.commit()
    db.refresh(new_exam)

    return new_exam


@router.get("/", response_model=list[ExamResponse])
def get_exams(
    email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == email
    ).first()

    return db.query(Exam).filter(
        Exam.user_id == user.id
    ).all()