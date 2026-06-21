from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, Task, Exam, StudySession, Resume, UploadedDocument
from app.services.groq_service import get_ai_recommendations

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now = datetime.utcnow()
    week_start = now - timedelta(days=7)

    # Study hours this week + per-day breakdown
    sessions = db.query(StudySession).filter(
        StudySession.user_id == current_user.id,
        StudySession.start_time >= week_start,
        StudySession.duration_hours.isnot(None),
    ).all()
    study_hours = round(sum(s.duration_hours or 0 for s in sessions), 1)

    per_day = {label: 0.0 for label in DAY_LABELS}
    for s in sessions:
        if s.start_time:
            idx = s.start_time.weekday()  # Monday = 0
            per_day[DAY_LABELS[idx]] += s.duration_hours or 0
    weekly_study_hours = [{"day": d, "hours": round(per_day[d], 1)} for d in DAY_LABELS]

    # Tasks
    tasks_total = db.query(Task).filter(Task.user_id == current_user.id).count()
    tasks_done = db.query(Task).filter(
        Task.user_id == current_user.id, Task.status == "done"
    ).count()
    task_completion_rate = round((tasks_done / max(1, tasks_total)) * 100) if tasks_total else 0

    # Upcoming exams
    upcoming_exams = db.query(Exam).filter(
        Exam.user_id == current_user.id,
        Exam.exam_date >= now,
    ).count()

    # Latest resume ATS score
    latest_resume = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id, Resume.is_analyzed == True)
        .order_by(Resume.created_at.desc())
        .first()
    )
    ats_score = latest_resume.ats_score if latest_resume else 0

    # Previous resume for trend
    previous_resume = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id, Resume.is_analyzed == True)
        .order_by(Resume.created_at.desc())
        .offset(1)
        .first()
    )
    ats_score_trend = None
    if latest_resume and previous_resume and previous_resume.ats_score is not None:
        ats_score_trend = (latest_resume.ats_score or 0) - previous_resume.ats_score

    # Documents uploaded
    docs_count = db.query(UploadedDocument).filter(
        UploadedDocument.user_id == current_user.id
    ).count()

    # Placement readiness: derive from tasks + ats + sessions
    placement_readiness = min(100, int(
        (tasks_done / max(1, tasks_total)) * 30 +
        (ats_score or 0) * 0.4 +
        min(study_hours, 20) * 1.5
    ))

    # Skill gaps count (estimated)
    missing = len(latest_resume.missing_skills) if latest_resume and latest_resume.missing_skills else 5

    # Notes count
    from app.models import Note
    notes_count = db.query(Note).filter(Note.user_id == current_user.id).count()

    return {
        "ats_score": ats_score,
        "ats_score_trend": ats_score_trend,
        "placement_readiness": placement_readiness,
        "study_hours_this_week": study_hours,
        "study_hours_week": study_hours,
        "weekly_study_hours": weekly_study_hours,
        "tasks_completed": tasks_done,
        "tasks_total": tasks_total,
        "task_completion_rate": task_completion_rate,
        "upcoming_exams_count": upcoming_exams,
        "documents_uploaded": docs_count,
        "skill_gaps_count": missing,
        "notes_count": notes_count,
    }


@router.get("/recommendations")
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now = datetime.utcnow()

    # Gather context
    upcoming_exam = db.query(Exam).filter(
        Exam.user_id == current_user.id,
        Exam.exam_date >= now,
    ).order_by(Exam.exam_date.asc()).first()

    pending_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.status != "done",
        Task.priority == "high",
    ).limit(3).all()

    latest_resume = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id, Resume.is_analyzed == True)
        .order_by(Resume.created_at.desc())
        .first()
    )

    user_data = {
        "name": current_user.full_name,
        "branch": current_user.branch,
        "year": current_user.year_of_study,
        "target_role": current_user.target_role,
        "upcoming_exam": upcoming_exam.name if upcoming_exam else None,
        "exam_days_left": (upcoming_exam.exam_date.replace(tzinfo=None) - now).days if upcoming_exam else None,
        "pending_high_priority_tasks": [t.title for t in pending_tasks],
        "ats_score": latest_resume.ats_score if latest_resume else None,
        "missing_skills": latest_resume.missing_skills[:3] if latest_resume else [],
    }

    try:
        recs = get_ai_recommendations(user_data)
        if recs:
            return recs
    except Exception:
        pass

    # Fallback static recommendations
    recs = []
    if upcoming_exam:
        days = (upcoming_exam.exam_date.replace(tzinfo=None) - now).days
        recs.append({
            "type": "exam",
            "title": f"📚 {upcoming_exam.name} in {days} days",
            "description": f"Focus 2h/day on {upcoming_exam.name} topics. You have {days} days — stay consistent!",
            "priority": "high",
        })
    if pending_tasks:
        recs.append({
            "type": "study",
            "title": f"🎯 {pending_tasks[0].title}",
            "description": f"You have {len(pending_tasks)} high-priority tasks pending. Start with '{pending_tasks[0].title}'.",
            "priority": "high",
        })
    if latest_resume and latest_resume.missing_skills:
        gap = latest_resume.missing_skills[0]
        recs.append({
            "type": "placement",
            "title": f"⚡ Learn {gap} — critical skill gap",
            "description": f"Your resume is missing {gap}. Adding this skill could boost your ATS score significantly.",
            "priority": "medium",
        })
    if not recs:
        recs.append({
            "type": "ai",
            "title": "🚀 Start Your Placement Journey",
            "description": "Upload your resume for ATS analysis, add your upcoming exams, and complete your profile for personalized AI guidance.",
            "priority": "medium",
        })
    return recs
