from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User
from app.services.groq_service import (
    explain_topic, generate_practice_questions,
    generate_interview_questions, get_related_topics,
    get_topic_career_relevance,
)
from pydantic import BaseModel

router = APIRouter(prefix="/learning", tags=["learning"])


class TopicRequest(BaseModel):
    topic: str
    difficulty: str = "medium"  # easy | medium | hard
    context: str = ""


@router.post("/explain")
def explain(
    payload: TopicRequest,
    current_user: User = Depends(get_current_user),
):
    return {
        "explanation": explain_topic(
            payload.topic, payload.difficulty, payload.context
        ),
        "topic": payload.topic,
    }


@router.post("/practice-questions")
def practice_questions(
    payload: TopicRequest,
    current_user: User = Depends(get_current_user),
):
    return {
        "questions": generate_practice_questions(
            payload.topic, payload.difficulty
        ),
        "topic": payload.topic,
    }


@router.post("/interview-questions")
def interview_questions(
    payload: TopicRequest,
    current_user: User = Depends(get_current_user),
):
    return {
        "questions": generate_interview_questions(payload.topic),
        "topic": payload.topic,
    }


@router.post("/related-topics")
def related_topics(
    payload: TopicRequest,
    current_user: User = Depends(get_current_user),
):
    return {
        "topics": get_related_topics(payload.topic),
        "topic": payload.topic,
    }


@router.post("/career-relevance")
def career_relevance(
    payload: TopicRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_topic_career_relevance(
        payload.topic,
        current_user.target_role or "Software Engineer",
        current_user.branch or "Computer Science",
    )
