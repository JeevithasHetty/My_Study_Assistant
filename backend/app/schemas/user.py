from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    cgpa: Optional[float] = None
    branch: Optional[str] = None
    semester: Optional[int] = None
    college: Optional[str] = None
    placement_target: Optional[str] = None
    weak_subjects: Optional[str] = None
    available_study_hours: Optional[int] = None


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str

    class Config:
        from_attributes = True