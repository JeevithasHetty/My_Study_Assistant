from sqlalchemy.orm import Session
from datetime import date

from app.models.user import User
from app.models.task import Task
from app.models.exam import Exam
from app.models.study_session import StudySession
from app.services.ai_recommendation_service import generate_ai_recommendations
from app.services.ai_recommendation_service import (
    generate_ai_recommendations
)


def get_dashboard_overview(user_email: str, db: Session):
    user = db.query(User).filter(
        User.email == user_email
    ).first()

    if not user:
        return None

    total_tasks = db.query(Task).filter(
        Task.user_id == user.id
    ).count()

    completed_tasks = db.query(Task).filter(
        Task.user_id == user.id,
        Task.completed == False
    ).count()

    study_sessions = db.query(StudySession).filter(
        StudySession.user_id == user.id
    ).all()

    total_study_hours = sum(
        session.hours_studied
        for session in study_sessions
    )

    upcoming_exams = db.query(Exam).filter(
        Exam.user_id == user.id,
        Exam.exam_date >= date.today()
    ).count()

    context = f"""
    Name: {user.full_name}
    CGPA: {user.cgpa}
    Branch: {user.branch}
    Semester: {user.semester}
    Placement Target: {user.placement_target}
    Weak Subjects: {user.weak_subjects}
    Available Study Hours: {user.available_study_hours}
    Total Tasks: {total_tasks}
    Completed Tasks: {completed_tasks}
    Study Hours Logged: {total_study_hours}
    Upcoming Exams: {upcoming_exams}
    """

    ai_recommendations = generate_ai_recommendations(
        context
    )

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "total_study_hours": total_study_hours,
        "upcoming_exams": upcoming_exams,
        "placement_readiness": 0,
        "recommendations": [ai_recommendations]
    }