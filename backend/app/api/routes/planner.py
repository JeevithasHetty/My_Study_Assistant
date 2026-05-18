from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from app.core.database import get_db
from app.core.security import verify_token

from app.models.user import User
from app.models.study_plan import StudyPlan

from app.schemas.planner import PlannerResponse
from app.services.planner_ai_service import (
    generate_study_plan,
    generate_week_plan
)

router = APIRouter(
    prefix="/planner",
    tags=["Planner"]
)


@router.post("/generate", response_model=PlannerResponse)
def create_plan(
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

    ai_plan = generate_study_plan(
        email,
        db
    )

    new_plan = StudyPlan(
        plan_date=str(date.today()),
        ai_plan=ai_plan,
        user_id=user.id
    )

    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)

    return new_plan


@router.post("/week", response_model=PlannerResponse)
def create_week_plan(
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

    ai_plan = generate_week_plan(
        email,
        db
    )

    plan = StudyPlan(
        plan_date="weekly",
        ai_plan=ai_plan,
        status="active",
        user_id=user.id
    )

    db.add(plan)
    db.commit()
    db.refresh(plan)

    return plan


@router.post("/regenerate", response_model=PlannerResponse)
def regenerate_plan(
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

    ai_plan = generate_study_plan(
        email,
        db
    )

    plan = StudyPlan(
        plan_date=str(date.today()),
        ai_plan=ai_plan,
        status="regenerated",
        user_id=user.id
    )

    db.add(plan)
    db.commit()
    db.refresh(plan)

    return plan


@router.patch("/{plan_id}/complete")
def complete_plan(
    plan_id: int,
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

    plan = db.query(StudyPlan).filter(
        StudyPlan.id == plan_id,
        StudyPlan.user_id == user.id
    ).first()

    if not plan:
        raise HTTPException(
            status_code=404,
            detail="Plan not found"
        )

    plan.status = "completed"

    db.commit()

    return {
        "message": "Plan completed"
    }


@router.get("/today", response_model=PlannerResponse)
def get_today_plan(
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

    plan = db.query(StudyPlan).filter(
        StudyPlan.user_id == user.id,
        StudyPlan.plan_date == str(date.today())
    ).first()

    if not plan:
        raise HTTPException(
            status_code=404,
            detail="No plan generated"
        )

    return plan