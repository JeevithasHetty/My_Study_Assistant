from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, StudyPlan, Exam
from app.schemas import StudyPlanCreate, StudyPlanOut
from app.services.groq_service import generate_weekly_plan

router = APIRouter(prefix="/planner", tags=["planner"])


@router.get("/sessions", response_model=List[StudyPlanOut])
def get_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(StudyPlan)
        .filter(StudyPlan.user_id == current_user.id)
        .order_by(StudyPlan.scheduled_date.asc())
        .all()
    )


@router.post("/sessions", response_model=StudyPlanOut, status_code=201)
def create_session(
    payload: StudyPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = StudyPlan(user_id=current_user.id, **payload.model_dump())
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


@router.put("/sessions/{plan_id}", response_model=StudyPlanOut)
def update_session(
    plan_id: int,
    payload: StudyPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = db.query(StudyPlan).filter(StudyPlan.id == plan_id, StudyPlan.user_id == current_user.id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    for key, value in payload.model_dump().items():
        setattr(plan, key, value)
    db.commit()
    db.refresh(plan)
    return plan


@router.patch("/sessions/{plan_id}/complete", response_model=StudyPlanOut)
def complete_session(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = db.query(StudyPlan).filter(StudyPlan.id == plan_id, StudyPlan.user_id == current_user.id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    plan.is_completed = True
    db.commit()
    db.refresh(plan)
    return plan


@router.get("/ai-plan")
def get_ai_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from datetime import datetime
    exams = db.query(Exam).filter(
        Exam.user_id == current_user.id,
        Exam.exam_date >= datetime.utcnow(),
    ).order_by(Exam.exam_date.asc()).limit(5).all()

    user_data = {
        "name": current_user.full_name,
        "branch": current_user.branch,
        "year": current_user.year_of_study,
        "target_role": current_user.target_role,
        "ai_preferences": current_user.ai_preferences or {},
    }
    exams_data = [{"name": e.name, "date": str(e.exam_date.date()), "topics": e.topics} for e in exams]

    return generate_weekly_plan(user_data, exams_data)
