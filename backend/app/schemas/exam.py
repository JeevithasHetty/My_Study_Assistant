from pydantic import BaseModel
from typing import Optional
from datetime import date


class ExamCreate(BaseModel):
    subject: str
    syllabus_size: Optional[int] = None
    exam_date: Optional[date] = None
    importance: Optional[str] = None


class ExamResponse(BaseModel):
    id: int
    subject: str
    syllabus_size: Optional[int]
    exam_date: Optional[date]
    importance: Optional[str]

    class Config:
        from_attributes = True