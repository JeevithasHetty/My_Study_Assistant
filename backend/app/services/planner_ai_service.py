import os
from dotenv import load_dotenv
from groq import Groq
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.task import Task
from app.models.exam import Exam
from app.models.study_session import StudySession


load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def fetch_user_context(user_email: str, db: Session):
    user = db.query(User).filter(
        User.email == user_email
    ).first()

    if not user:
        return None

    tasks = db.query(Task).filter(
        Task.user_id == user.id
    ).all()

    exams = db.query(Exam).filter(
        Exam.user_id == user.id
    ).all()

    study_sessions = db.query(StudySession).filter(
        StudySession.user_id == user.id
    ).all()

    tasks_text = "\n".join(
        [
            f"{task.title} | priority: {task.priority}"
            for task in tasks
        ]
    )

    exams_text = "\n".join(
        [
            f"{exam.subject} | exam date: {exam.exam_date}"
            for exam in exams
        ]
    )

    sessions_text = "\n".join(
        [
            f"{session.subject} | studied for {session.duration_minutes} minutes"
            for session in study_sessions
        ]
    )

    return {
        "user": user,
        "tasks": tasks_text,
        "exams": exams_text,
        "sessions": sessions_text
    }


def generate_study_plan(
    user_email: str,
    db: Session
):
    context = fetch_user_context(user_email, db)

    if not context:
        return "User not found"

    user = context["user"]

    prompt = f"""
You are an expert AI academic planner.

Student Profile:
Name: {user.name}
Branch: {user.branch}
Semester: {user.semester}
CGPA: {user.cgpa}
Weak Subjects: {user.weak_subjects}
Placement Goal: {user.placement_target}
Available Study Time Per Day: {user.available_study_hours}

Pending Tasks:
{context['tasks']}

Upcoming Exams:
{context['exams']}

Previous Study Sessions:
{context['sessions']}

Generate a highly personalized DAILY study plan.

STRICT RULES:
1. Prioritize weak subjects.
2. Prioritize near exams.
3. Balance revision + new concepts.
4. Respect available study hours.
5. Include short breaks.
6. Give exact study order.
7. Add motivational recommendation.
8. Suggest placement preparation.
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert academic planner."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.4,
            max_tokens=1200
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"Planner AI failed: {str(e)}"


def generate_week_plan(
    user_email: str,
    db: Session
):
    context = fetch_user_context(user_email, db)

    if not context:
        return "User not found"

    user = context["user"]

    prompt = f"""
You are an expert academic planner.

Student Profile:
Name: {user.name}
Branch: {user.branch}
Semester: {user.semester}
CGPA: {user.cgpa}
Weak Subjects: {user.weak_subjects}
Placement Goal: {user.placement_target}
Available Study Time Per Day: {user.available_study_hours}

Pending Tasks:
{context['tasks']}

Upcoming Exams:
{context['exams']}

Previous Study Sessions:
{context['sessions']}

Generate a FULL 7-DAY personalized weekly study plan.

STRICT RULES:
1. Prioritize weak subjects.
2. Prioritize upcoming exams.
3. Balance academics + placement prep.
4. Respect daily study hour limits.
5. Include revision blocks.
6. Include breaks.
7. Distribute workload intelligently.
8. Make plan realistic.
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert academic planner."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.4,
            max_tokens=1500
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"Weekly Planner AI failed: {str(e)}"