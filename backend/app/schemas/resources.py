from pydantic import BaseModel
from typing import List


class ResourceLink(BaseModel):
    title: str
    url: str


class TopicRecommendation(BaseModel):
    topic: str
    youtube: List[ResourceLink]
    docs: List[ResourceLink]