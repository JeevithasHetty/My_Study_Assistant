from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, Resume, Task, Exam
from app.schemas import PlacementChat, PlacementChatResponse
from app.services.groq_service import (
    get_placement_readiness, get_skill_gaps,
    get_placement_roadmap, placement_ai_chat
)

router = APIRouter(prefix="/placement", tags=["placement"])


def _build_user_context(user: User, db: Session) -> dict:
    """Collect all relevant user data for AI context."""
    resume = (
        db.query(Resume)
        .filter(Resume.user_id == user.id, Resume.is_analyzed == True)
        .order_by(Resume.created_at.desc())
        .first()
    )
    tasks_done = db.query(Task).filter(Task.user_id == user.id, Task.status == "done").count()
    tasks_total = db.query(Task).filter(Task.user_id == user.id).count()

    return {
        "name": user.full_name,
        "branch": user.branch or "Computer Science",
        "year": user.year_of_study or "3rd Year",
        "college": user.college_name,
        "target_role": user.target_role or "Software Engineer",
        "target_companies": user.target_companies,
        "ats_score": resume.ats_score if resume else None,
        "present_skills": resume.present_skills if resume else [],
        "missing_skills": resume.missing_skills if resume else [],
        "tasks_done": tasks_done,
        "tasks_total": tasks_total,
        "ai_preferences": user.ai_preferences or {},
    }


@router.get("/readiness")
def get_readiness(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    context = _build_user_context(current_user, db)
    resume = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id, Resume.is_analyzed == True)
        .order_by(Resume.created_at.desc())
        .first()
    )

    # Quick fallback if no resume yet
    if not resume:
        return {
            "overall_score": 20,
            "completed_skills": [],
            "missing_skills": [
                {"skill": "Resume Upload", "current_level": 0, "required_level": 100, "priority": "critical"},
                {"skill": "DSA Practice", "current_level": 30, "required_level": 80, "priority": "high"},
                {"skill": "System Design", "current_level": 10, "required_level": 70, "priority": "high"},
            ],
            "company_readiness": [],
        }

    try:
        result = get_placement_readiness(context)
        if result and "overall_score" in result:
            return result
    except Exception:
        pass

    # Calculated fallback
    score = min(100, int((resume.ats_score or 0) * 0.5 + len(resume.present_skills or []) * 3))
    return {
        "overall_score": score,
        "completed_skills": [{"name": s, "level": 75} for s in (resume.present_skills or [])],
        "missing_skills": [
            {"skill": s, "current_level": 20, "required_level": 80, "priority": "high"}
            for s in (resume.missing_skills or [])[:5]
        ],
        "company_readiness": [
            {"company": "Flipkart", "role": "SDE-1", "match": min(95, score + 20), "tier": "Target"},
            {"company": "Atlassian", "role": "SDE-1", "match": min(90, score + 15), "tier": "Target"},
            {"company": "Microsoft", "role": "SDE", "match": min(85, score + 10), "tier": "Reach"},
            {"company": "Google", "role": "SDE", "match": max(30, score - 10), "tier": "Dream"},
        ],
    }


@router.get("/skill-gaps")
def get_gaps(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    context = _build_user_context(current_user, db)
    resume = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id, Resume.is_analyzed == True)
        .order_by(Resume.created_at.desc())
        .first()
    )

    if resume and resume.missing_skills:
        # Convert missing skills to structured gap objects
        priorities = ["critical", "high", "medium", "low"]
        return [
            {
                "skill": skill,
                "current_level": 20 + (i * 5),
                "required_level": 80,
                "priority": priorities[min(i, 3)],
            }
            for i, skill in enumerate(resume.missing_skills[:6])
        ]

    try:
        return get_skill_gaps(context)
    except Exception:
        return []


@router.get("/roadmap")
def get_roadmap(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    context = _build_user_context(current_user, db)
    try:
        result = get_placement_roadmap(context)
        if result:
            return result
    except Exception:
        pass

    # Static fallback roadmap
    return {
        "phases": [
            {"phase": "Phase 1 — Now", "duration": "2 weeks", "focus": "DSA & Core CS Fundamentals",
             "tasks": ["Complete 30 Graph problems", "OS: Scheduling & Memory", "DBMS: SQL Advanced"], "status": "active"},
            {"phase": "Phase 2", "duration": "2 weeks", "focus": "System Design Basics",
             "tasks": ["Design URL Shortener", "Design Instagram", "Study HLD concepts"], "status": "upcoming"},
            {"phase": "Phase 3", "duration": "2 weeks", "focus": "Resume & Projects Polish",
             "tasks": ["Add 2 strong projects", "Resume reviewed by mentor", "LinkedIn updated"], "status": "upcoming"},
            {"phase": "Phase 4", "duration": "2 weeks", "focus": "Mock Interviews",
             "tasks": ["10 mock interviews on Pramp", "Behavioral questions prep", "Company-specific prep"], "status": "upcoming"},
        ]
    }


@router.post("/ai-coach", response_model=PlacementChatResponse)
def ai_coach_chat(
    payload: PlacementChat,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    context = _build_user_context(current_user, db)
    response = placement_ai_chat(payload.message, context)
    return {"response": response}
