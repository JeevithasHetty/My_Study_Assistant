import os
import json
import re
import logging
from dotenv import load_dotenv
from groq import Groq
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.exam import Exam
from app.models.task import Task
from app.models.study_session import StudySession
from app.models.resume import Resume
from app.core.settings import settings

load_dotenv()
logger = logging.getLogger(__name__)

client = Groq(
    api_key=settings.GROQ_API_KEY
)


def extract_json_array(text):
    try:
        match = re.search(r"\[.*\]", text, re.DOTALL)

        if match:
            return json.loads(match.group())
    except json.JSONDecodeError as e:
        logger.warning(f"Failed to parse JSON array from text: {e}")

    return []


def generate_personalized_topics(
    user_email: str,
    db: Session
):
    user = db.query(User).filter(
        User.email == user_email
    ).first()

    if not user:
        logger.warning(f"User not found for topic generation: {user_email}")
        return []

    exams = db.query(Exam).filter(
        Exam.user_id == user.id
    ).all()

    tasks = db.query(Task).filter(
        Task.user_id == user.id
    ).all()

    study_sessions = db.query(StudySession).filter(
        StudySession.user_id == user.id
    ).all()

    latest_resume = db.query(Resume).filter(
        Resume.user_id == user.id
    ).order_by(
        Resume.id.desc()
    ).first()

    exam_context = "\n".join(
        [
            f"{exam.subject} exam on {exam.exam_date}"
            for exam in exams
        ]
    )

    task_context = "\n".join(
        [
            f"{task.title} priority {task.priority}"
            for task in tasks
        ]
    )

    study_context = "\n".join(
        [
            f"{session.subject} studied for {session.duration_minutes} minutes"
            for session in study_sessions
        ]
    )

    resume_context = ""

    if latest_resume:
        resume_context = latest_resume.analysis

    prompt = f"""
Analyze this student and generate 5 personalized learning topics.

Student:
Branch: {user.branch}
Semester: {user.semester}
CGPA: {user.cgpa}
Weak Subjects: {user.weak_subjects}
Placement Target: {user.placement_target}

Upcoming Exams:
{exam_context}

Pending Tasks:
{task_context}

Study History:
{study_context}

Resume Analysis:
{resume_context}

Return ONLY a JSON array.

Example:
[
  "Docker container fundamentals",
  "Spring Boot REST API development",
  "SQL joins and indexing",
  "Operating system deadlock prevention",
  "Cybersecurity phishing detection"
]
"""

    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "Return only valid JSON arrays."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=settings.AI_TEMPERATURE,
            max_tokens=settings.MAX_AI_TOKENS_RESOURCES
        )

        content = response.choices[0].message.content
        logger.info(f"Generated personalized topics for user: {user_email}")

        return extract_json_array(content)

    except Exception as e:
        logger.error(f"Resource AI topic generation error: {str(e)}")
        return []
