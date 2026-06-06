from fastapi import (
    APIRouter,
    Depends
)

from app.core.security import (
    verify_token
)

from app.schemas.learning_assistant import (
    LearningAssistantRequest
)

from app.services.learning_assistant_service import (
    get_topic_help
)

router = APIRouter(
    prefix="/learning-assistant",
    tags=["Learning Assistant"]
)


@router.post("/help")
def topic_help(
    request: LearningAssistantRequest,
    email: str = Depends(
        verify_token
    )
):
    return get_topic_help(
        request.topic
    )