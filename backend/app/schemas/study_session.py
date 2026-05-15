from pydantic import BaseModel


class StudySessionCreate(BaseModel):
    hours_studied: int


class StudySessionResponse(BaseModel):
    id: int
    hours_studied: int

    class Config:
        from_attributes = True