import os
import json
import re
import logging
from dotenv import load_dotenv
from groq import Groq
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.resume import Resume
from app.models.study_session import StudySession
from app.core.settings import settings

load_dotenv()
logger = logging.getLogger(__name__)

client = Groq(
    api_key=settings.GROQ_API_KEY
)


def extract_missing_skills(analysis_text):
    if not analysis_text:
        return []

    try:
        data = json.loads(analysis_text)

        if "missing_skills" in data:
            return data["missing_skills"]

    except json.JSONDecodeError as e:
        logger.warning(f"Could not parse analysis JSON: {e}")

    try:
        match = re.search(
            r"missing_skills.*?\[(.*?)\]",
            analysis_text,
            re.DOTALL | re.IGNORECASE
        )

        if match:
            skills = match.group(1).split(",")

            return [
                skill.strip().replace('"', "")
                for skill in skills
            ]
    except Exception as e:
        logger.warning(f"Failed to extract skills from text: {e}")

    return []

def calculate_completed_skills(
    missing_skills,
    study_sessions
):
    completed = []
    remaining = []

    studied_topics = []

    for session in study_sessions:

        if session.subject:
            studied_topics.append(
                session.subject.lower()
            )

    for skill in missing_skills:

        skill_lower = skill.lower()

        found = False

        for topic in studied_topics:

            if (
                skill_lower in topic
                or
                topic in skill_lower
            ):
                found = True
                break

        if found:
            completed.append(skill)

        else:
            remaining.append(skill)

    return completed, remaining


def generate_readiness_report(
    user_email,
    db: Session
):
    user = db.query(User).filter(
        User.email == user_email
    ).first()

    if not user:
        return {
            "error": "User not found"
        }

    latest_resume = (
        db.query(Resume)
        .filter(
            Resume.user_id == user.id,
            Resume.analysis.isnot(None),
            Resume.analysis != ""
        )
        .order_by(
            Resume.id.desc()
        )
        .first()
    )

    study_sessions = (
        db.query(StudySession)
        .filter(
            StudySession.user_id == user.id
        )
        .all()
    )

    missing_skills = []

    if latest_resume:
        missing_skills = extract_missing_skills(
            latest_resume.analysis
        )

    completed_skills, remaining_skills = (
        calculate_completed_skills(
            missing_skills,
            study_sessions
        )
    )

    total_skills = (
        len(completed_skills)
        +
        len(remaining_skills)
    )

    if total_skills == 0:
        readiness_score = 60
    else:
        readiness_score = int(
            (
                len(completed_skills)
                /
                total_skills
            ) * 100
        )

    if readiness_score >= 80:
        status = "Placement Ready"

    elif readiness_score >= 50:
        status = "Moderately Ready"

    else:
        status = "Needs Improvement"

    prompt = f"""
You are a placement mentor.

Student Target:
{user.placement_target}

CGPA:
{user.cgpa}

Weak Subjects:
{user.weak_subjects}

Remaining Skills:
{remaining_skills}

Generate ONLY JSON:

{{
    "improvement_plan": [
        "step1",
        "step2",
        "step3"
    ]
}}
"""

    try:

        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "Return only valid JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2,
            max_tokens=300
        )

        ai_result = json.loads(
            response.choices[0].message.content
        )

        return {
            "readiness_score":
                readiness_score,

            "status":
                status,

            "completed_skills":
                completed_skills,

            "remaining_skills":
                remaining_skills,

            "improvement_plan":
                ai_result.get(
                    "improvement_plan",
                    []
                )
        }

    except Exception:

        return {
            "readiness_score":
                readiness_score,

            "status":
                status,

            "completed_skills":
                completed_skills,

            "remaining_skills":
                remaining_skills,

            "improvement_plan": [
                "Study weak subjects",
                "Complete missing skills",
                "Practice projects"
            ]
        }