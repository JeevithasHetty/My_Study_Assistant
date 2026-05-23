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

    studied_topics = " ".join(
        [
            session.subject.lower()
            for session in study_sessions
        ]
    )

    for skill in missing_skills:
        if skill.lower() in studied_topics:
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
        logger.warning(f"User not found: {user_email}")
        return {"error": "User not found"}

    latest_resume = db.query(Resume).filter(
        Resume.user_id == user.id
    ).order_by(
        Resume.id.desc()
    ).first()

    study_sessions = db.query(StudySession).filter(
        StudySession.user_id == user.id
    ).all()

    missing_skills = []

    if latest_resume:
        missing_skills = extract_missing_skills(
            latest_resume.analysis
        )

    completed_skills, remaining_skills = calculate_completed_skills(
        missing_skills,
        study_sessions
    )

    prompt = f"""
You are a placement readiness evaluator.

Student profile:

Placement Target:
{user.placement_target}

CGPA:
{user.cgpa}

Weak Subjects:
{user.weak_subjects}

Completed Skills:
{completed_skills}

Remaining Skills:
{remaining_skills}

Study Session Count:
{len(study_sessions)}

TASK:

Generate JSON ONLY:

{{
  "readiness_score": number between 0 and 100,
  "status": "Beginner / Moderately Ready / Placement Ready",
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
                    "content": "Generate placement readiness evaluation. Return only valid JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=settings.AI_TEMPERATURE,
            max_tokens=settings.MAX_AI_TOKENS_PLACEMENT
        )

        ai_result = json.loads(
            response.choices[0].message.content
        )

        ai_result["completed_skills"] = completed_skills
        ai_result["remaining_skills"] = remaining_skills

        logger.info("Placement readiness report generated successfully")
        return ai_result

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI response as JSON: {e}")
        return {"error": f"Invalid AI response format: {str(e)}"}
    except Exception as e:
        logger.error(f"Placement readiness report generation failed: {str(e)}")
        return {"error": str(e)}
