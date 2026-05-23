from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_token
from app.models.user import User

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/me")
def get_current_user(
    email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        return {
            "message": "User not found"
        }

    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "branch": user.branch,
        "college": user.college,
        "semester": user.semester,
        "cgpa": user.cgpa,
        "weak_subjects": user.weak_subjects,
        "placement_target": user.placement_target,
        "available_study_hours": user.available_study_hours
    }