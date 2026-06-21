"""
AI Career Coach — 7-agent orchestration via Groq.
Each agent has a focused role; the Career Coach (manager) synthesises
all outputs into a cohesive response.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, Resume, Task, Exam, StudySession
from app.services.groq_service import run_career_coach_agents, career_coach_chat
from datetime import datetime, timedelta

router = APIRouter(prefix="/career-coach", tags=["career-coach"])


class CoachChatRequest(BaseModel):
    message: str
    agent: str = "career_coach"  # which agent to invoke


def _build_full_context(user: User, db: Session) -> dict:
    resume = (
        db.query(Resume)
        .filter(Resume.user_id == user.id, Resume.is_analyzed == True)
        .order_by(Resume.created_at.desc())
        .first()
    )
    tasks_done = db.query(Task).filter(Task.user_id == user.id, Task.status == "done").count()
    tasks_total = db.query(Task).filter(Task.user_id == user.id).count()
    now = datetime.utcnow()
    upcoming_exam = (
        db.query(Exam)
        .filter(Exam.user_id == user.id, Exam.exam_date >= now)
        .order_by(Exam.exam_date.asc())
        .first()
    )
    week_sessions = db.query(StudySession).filter(
        StudySession.user_id == user.id,
        StudySession.start_time >= now - timedelta(days=7),
        StudySession.duration_hours.isnot(None),
    ).all()
    study_hours_week = round(sum(s.duration_hours or 0 for s in week_sessions), 1)

    return {
        "name": user.full_name,
        "email": user.email,
        "branch": user.branch or "Computer Science",
        "year": user.year_of_study or "3rd Year",
        "college": user.college_name or "",
        "target_role": user.target_role or "Software Engineer",
        "target_companies": user.target_companies or "Product-based companies",
        "linkedin_url": user.linkedin_url or "",
        "github_url": user.github_url or "",
        "ats_score": resume.ats_score if resume else None,
        "present_skills": resume.present_skills if resume else [],
        "missing_skills": resume.missing_skills if resume else [],
        "resume_suggestions": resume.suggestions if resume else [],
        "tasks_completed": tasks_done,
        "tasks_total": tasks_total,
        "task_completion_rate": round(tasks_done / max(1, tasks_total) * 100),
        "study_hours_this_week": study_hours_week,
        "upcoming_exam": upcoming_exam.name if upcoming_exam else None,
        "exam_date": str(upcoming_exam.exam_date.date()) if upcoming_exam else None,
        "ai_preferences": user.ai_preferences or {},
    }


@router.get("/insights")
def get_coach_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Run all 7 agents and return aggregated insights."""
    context = _build_full_context(current_user, db)
    return run_career_coach_agents(context)


@router.get("/weekly-goals")
def get_weekly_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    context = _build_full_context(current_user, db)
    from app.services.groq_service import generate_weekly_goals
    return generate_weekly_goals(context)


@router.get("/skill-roadmap")
def get_skill_roadmap(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    context = _build_full_context(current_user, db)
    from app.services.groq_service import generate_skill_roadmap
    return generate_skill_roadmap(context)


@router.post("/chat")
def agent_chat(
    payload: CoachChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    context = _build_full_context(current_user, db)
    response = career_coach_chat(payload.message, payload.agent, context)
    return {"response": response, "agent": payload.agent}


@router.get("/exam-planner")
def smart_exam_planner(
    exam_date: str,
    syllabus_size: int = 10,  # number of topics
    available_hours_per_day: float = 4.0,
    importance: str = "high",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Smart exam planner agent — generates personalised study schedule."""
    from app.services.groq_service import plan_exam_schedule
    return plan_exam_schedule(
        exam_date=exam_date,
        syllabus_size=syllabus_size,
        available_hours=available_hours_per_day,
        importance=importance,
        user_context={
            "name": current_user.full_name,
            "branch": current_user.branch,
            "study_style": (current_user.ai_preferences or {}).get("learning_style", "mixed"),
        },
    )
