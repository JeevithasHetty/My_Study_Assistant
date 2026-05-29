import json
import re
from datetime import date
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.task import Task
from app.models.exam import Exam
from app.models.study_session import StudySession
from app.models.resume import Resume


def extract_ats_score(analysis_text):
    if not analysis_text:
        return 0

    try:
        data = json.loads(analysis_text)

        if "ats_score" in data:
            return data["ats_score"]

    except:
        pass

    match = re.search(
        r'ATS Score[:\s]*(\d+)',
        analysis_text,
        re.IGNORECASE
    )

    if match:
        return int(match.group(1))

    return 0


def calculate_consistency(study_sessions):
    if not study_sessions:
        return 0

    count = len(study_sessions)

    if count >= 20:
        return 95

    if count >= 15:
        return 85

    if count >= 10:
        return 75

    if count >= 5:
        return 60

    return 40


def generate_dashboard(
    user_email,
    db: Session
):
    user = db.query(User).filter(
        User.email == user_email
    ).first()

    if not user:
        return {"error": "User not found"}

    tasks = db.query(Task).filter(
        Task.user_id == user.id
    ).all()

    exams = db.query(Exam).filter(
        Exam.user_id == user.id
    ).all()

    study_sessions = db.query(
        StudySession
    ).filter(
        StudySession.user_id == user.id
    ).all()

    latest_resume = db.query(
        Resume
    ).filter(
        Resume.user_id == user.id
    ).order_by(
        Resume.id.desc()
    ).first()

    total_study_minutes = sum(
        [
            s.duration_minutes
            for s in study_sessions
        ]
    )

    total_study_hours = round(
        total_study_minutes / 60,
        2
    )

    upcoming_exams = len(
        [
            exam
            for exam in exams
            if exam.exam_date >= date.today()
        ]
    )

    ats_score = 0

    if latest_resume:
        ats_score = extract_ats_score(
            latest_resume.analysis
        )

    consistency_score = calculate_consistency(
        study_sessions
    )

    focus_areas = []

    if user.weak_subjects:
        focus_areas.extend(
            [
                subject.strip()
                for subject in user.weak_subjects.split(",")
            ]
        )

    return {
        "student": user.full_name,
        "branch": user.branch,
        "semester": user.semester,
        "cgpa": user.cgpa,

        "total_tasks": len(tasks),

        "total_study_sessions":
            len(study_sessions),

        "total_study_hours":
            total_study_hours,

        "upcoming_exams":
            upcoming_exams,

        "resume_ats_score":
            ats_score,

        "study_consistency_score":
            consistency_score,

        "focus_areas":
            focus_areas
    }