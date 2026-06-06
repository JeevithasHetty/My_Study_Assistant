from pydantic import BaseModel


class LearningAssistantRequest(
    BaseModel
):
    topic: str