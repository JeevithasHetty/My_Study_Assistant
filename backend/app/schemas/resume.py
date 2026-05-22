from pydantic import BaseModel
from typing import Optional


class ResumeResponse(BaseModel):
    id: int
    filename: str
    analysis: str | None = None

    class Config:
        from_attributes = True


class ResumeAnalysisRequest(BaseModel):
    job_description: Optional[str] = None