from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    verify_password, get_password_hash,
    create_access_token, get_current_user
)
from app.models import User
from app.schemas import UserRegister, Token, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=201)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        email=payload.email,
        username=payload.username,
        full_name=payload.full_name,
        hashed_password=get_password_hash(payload.password),
        branch=payload.branch,
        year_of_study=payload.year_of_study,
        college_name=payload.college_name,
        target_role=payload.target_role,
        target_companies=payload.target_companies,
        notification_preferences={
            "exam_alerts": True,
            "study_reminders": True,
            "ai_recommendations": True,
            "placement_updates": False,
            "weekly_report": True,
            "email_notifications": False,
        },
        ai_preferences={
            "auto_suggest": True,
            "learning_style": "visual",
            "difficulty": "medium",
            "daily_goal_hours": 5,
        },
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Seed welcome notification
    from app.models import Notification
    notif = Notification(
        user_id=user.id,
        title="Welcome to StudentOS AI! 🎉",
        message=f"Hi {user.full_name}! Your AI-powered academic journey starts now. Complete your profile to get personalized recommendations.",
        type="ai",
        priority="high",
    )
    db.add(notif)
    db.commit()

    return user


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(
        (User.email == form_data.username) | (User.username == form_data.username)
    ).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
