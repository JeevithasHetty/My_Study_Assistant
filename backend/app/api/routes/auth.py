from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
)
from app.models import User
from app.schemas import UserRegister, Token, UserOut
print("AUTH.PY LOADED")
print("AUTH.PY LOADED SUCCESSFULLY")

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)


# ==========================================================
# REGISTER
# ==========================================================
@router.post("/register", response_model=UserOut, status_code=201)
def register(
    payload: UserRegister,
    db: Session = Depends(get_db)
):
    try:
        print("REGISTER REQUEST RECEIVED")
        print("EMAIL:", payload.email)
        print("USERNAME:", payload.username)

        # Check email
        existing_email = (
            db.query(User)
            .filter(User.email == payload.email)
            .first()
        )

        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        # Check username
        existing_username = (
            db.query(User)
            .filter(User.username == payload.username)
            .first()
        )

        if existing_username:
            raise HTTPException(
                status_code=400,
                detail="Username already taken"
            )

        hashed_password = get_password_hash(payload.password)

       user = User(
    email=payload.email,
    username=payload.username,
    full_name=payload.full_name,
    hashed_password=hashed_password,
    branch=payload.branch,
    year_of_study=payload.year_of_study,
    college_name=payload.college_name,
    target_role=payload.target_role,
    target_companies=payload.target_companies or [],

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

        # Optional welcome notification
        try:
            from app.models import Notification

            notification = Notification(
                user_id=user.id,
                title="Welcome to StudentOS AI! 🎉",
                message=f"Hi {user.full_name}! Your AI-powered academic journey starts now.",
                type="ai",
                priority="high",
            )

            db.add(notification)
            db.commit()

        except Exception as notification_error:
            print("NOTIFICATION ERROR:", str(notification_error))
            db.rollback()

        return user

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        print("REGISTER ERROR:", str(e))

        raise HTTPException(
            status_code=500,
            detail=f"Registration failed: {str(e)}"
        )


# ==========================================================
# LOGIN
# ==========================================================
@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    try:
        print("LOGIN REQUEST RECEIVED")

        user = (
            db.query(User)
            .filter(
                (User.email == form_data.username)
                | (User.username == form_data.username)
            )
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )

        if not verify_password(
            form_data.password,
            user.hashed_password
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )

        access_token = create_access_token(
            data={"sub": str(user.id)}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    except HTTPException:
        raise

    except Exception as e:
        print("LOGIN ERROR:", str(e))

        raise HTTPException(
            status_code=500,
            detail=f"Login failed: {str(e)}"
        )


# ==========================================================
# CURRENT USER
# ==========================================================
@router.get("/me", response_model=UserOut)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user