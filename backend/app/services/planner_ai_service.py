import requests
from sqlalchemy.orm import Session
from datetime import date

from app.models.user import User
from app.models.task import Task
from app.models.exam import Exam
from app.models.study_session import StudySession
from app.models.uploaded_document import UploadedDocument


OLLAMA_URL = "http://localhost:11434/api/generate"


def generate_study_plan(user_email: str, db: Session):
    user = db.query(User).filter(
        User.email == user_email
    ).first()

    tasks = db.query(Task).filter(
        Task.user_id == user.id,
        Task.completed == False
    ).all()

    exams = db.query(Exam).filter(
        Exam.user_id == user.id
    ).all()

    sessions = db.query(StudySession).filter(
        StudySession.user_id == user.id
    ).all()

    docs = db.query(UploadedDocument).filter(
        UploadedDocument.user_id == user.id
    ).all()

    task_text = "\n".join(
        [task.title for task in tasks]
    )

    exam_text = "\n".join(
        [
            f"{exam.subject} on {exam.exam_date}"
            for exam in exams
        ]
    )

    total_hours = sum(
        session.hours_studied
        for session in sessions
    )

    doc_text = "\n".join(
        [doc.filename for doc in docs]
    )

    prompt = f"""
You are an intelligent AI academic planner.

Student profile:
Name: {user.full_name}
CGPA: {user.cgpa}
Branch: {user.branch}
Semester: {user.semester}
Weak subjects: {user.weak_subjects}
Placement target: {user.placement_target}
Available study hours daily: {user.available_study_hours}

Pending tasks:
{task_text}

Upcoming exams:
{exam_text}

Study history:
Total study hours logged: {total_hours}

Available study materials:
{doc_text}

Decide:
1. What the student should study TODAY
2. Priority order
3. Time allocation
4. Balance academics and placements
5. Avoid overload

Return a clear day plan.
"""

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": "llama3.2:3b",
            "prompt": prompt,
            "stream": False
        }
    )

    return response.json()["response"]