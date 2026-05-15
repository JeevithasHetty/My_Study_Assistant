from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_token

from app.models.user import User
from app.models.study_session import StudySession

from app.schemas.study_session import (
    StudySessionCreate,
    StudySessionResponse
)

router = APIRouter(
    prefix="/study-sessions",
    tags=["Study Sessions"]
)


@router.post("/", response_model=StudySessionResponse)
def create_study_session(
    session_data: StudySessionCreate,
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

    new_session = StudySession(
        hours_studied=session_data.hours_studied,
        user_id=user.id
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return new_session


@router.get("/", response_model=list[StudySessionResponse])
def get_study_sessions(
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

    sessions = db.query(StudySession).filter(
        StudySession.user_id == user.id
    ).all()

    return sessions