from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_token

from app.services.resource_ai_service import (
    generate_personalized_topics
)

from app.services.youtube_service import (
    search_youtube
)

from app.services.web_resource_service import (
    search_web_resources
)


router = APIRouter(
    prefix="/resources",
    tags=["Resources"]
)


@router.get("/recommend")
def recommend_resources(
    email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    topics = generate_personalized_topics(
        email,
        db
    )

    recommendations = []

    for topic in topics:
        recommendations.append({
            "topic": topic,
            "youtube": search_youtube(topic),
            "docs": search_web_resources(topic)
        })

    return recommendations