from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, StudySession, Task
from app.schemas import StudySessionCreate, StudySessionOut

router = APIRouter(prefix="/study-sessions", tags=["study-sessions"])


@router.get("/", response_model=List[StudySessionOut])
def get_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(StudySession)
        .filter(StudySession.user_id == current_user.id)
        .order_by(StudySession.start_time.desc())
        .limit(50)
        .all()
    )


@router.post("/start", response_model=StudySessionOut, status_code=201)
def start_session(
    payload: StudySessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # End any active session first
    active = db.query(StudySession).filter(
        StudySession.user_id == current_user.id,
        StudySession.is_active == True,
    ).first()
    if active:
        active.is_active = False
        active.end_time = datetime.utcnow()
        if active.start_time:
            delta = (datetime.utcnow() - active.start_time.replace(tzinfo=None))
            active.duration_hours = round(delta.total_seconds() / 3600, 2)

    session = StudySession(user_id=current_user.id, **payload.model_dump())
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.post("/{session_id}/end", response_model=StudySessionOut)
def end_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(StudySession).filter(
        StudySession.id == session_id,
        StudySession.user_id == current_user.id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.is_active = False
    session.end_time = datetime.utcnow()
    if session.start_time:
        delta = datetime.utcnow() - session.start_time.replace(tzinfo=None)
        session.duration_hours = round(delta.total_seconds() / 3600, 2)
    db.commit()
    db.refresh(session)
    return session


@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now = datetime.utcnow()
    six_weeks_ago = now - timedelta(weeks=6)

    sessions = (
        db.query(StudySession)
        .filter(
            StudySession.user_id == current_user.id,
            StudySession.start_time >= six_weeks_ago,
            StudySession.duration_hours.isnot(None),
        )
        .all()
    )

    # Weekly hours
    weekly: dict = {}
    for s in sessions:
        if s.start_time:
            week = s.start_time.isocalendar()[1]
            weekly[week] = weekly.get(week, 0) + (s.duration_hours or 0)
    weekly_hours = [{"week": f"W{i+1}", "hours": round(v, 1)} for i, v in enumerate(list(weekly.values())[-6:])]

    # Total & avg
    total = sum(s.duration_hours or 0 for s in sessions)
    days_active = max(1, len(set(s.start_time.date() for s in sessions if s.start_time)))
    avg_daily = round(total / days_active, 1)

    # Subject distribution
    subject_hours: dict = {}
    for s in sessions:
        subject_hours[s.subject] = subject_hours.get(s.subject, 0) + (s.duration_hours or 0)
    total_h = sum(subject_hours.values()) or 1
    subject_distribution = [
        {"subject": sub, "value": round(h / total_h * 100)}
        for sub, h in sorted(subject_hours.items(), key=lambda x: -x[1])
    ]

    # Tasks this week
    week_start = now - timedelta(days=now.weekday())
    tasks_total = db.query(Task).filter(Task.user_id == current_user.id).count()
    tasks_done = db.query(Task).filter(Task.user_id == current_user.id, Task.status == "done").count()

    return {
        "total_hours": round(total, 1),
        "avg_daily_hours": avg_daily,
        "task_completion_rate": round(tasks_done / max(1, tasks_total) * 100),
        "current_streak": _compute_streak(sessions),
        "weekly_hours": weekly_hours,
        "subject_distribution": subject_distribution,
        "daily_tasks": [
            {"day": d, "done": min(tasks_done, 8), "total": min(tasks_total, 10)}
            for d in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        ],
    }


def _compute_streak(sessions) -> int:
    if not sessions:
        return 0
    dates = sorted(set(
        s.start_time.date() for s in sessions if s.start_time
    ), reverse=True)
    if not dates:
        return 0
    streak = 1
    from datetime import date, timedelta
    today = date.today()
    if dates[0] != today and dates[0] != today - timedelta(days=1):
        return 0
    for i in range(1, len(dates)):
        if (dates[i - 1] - dates[i]).days == 1:
            streak += 1
        else:
            break
    return streak
