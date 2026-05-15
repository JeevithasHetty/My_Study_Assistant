from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = None
    estimated_hours: Optional[int] = 1
    due_date: Optional[datetime] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    priority: Optional[str]
    estimated_hours: int
    completed: bool

    class Config:
        from_attributes = True