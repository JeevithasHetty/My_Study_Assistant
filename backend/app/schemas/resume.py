from pydantic import BaseModel


class ResumeResponse(BaseModel):
    id: int
    filename: str
    analysis: str | None = None

    class Config:
        from_attributes = True