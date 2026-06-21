from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any, Dict
from datetime import datetime


# ─── AUTH ────────────────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: str
    branch: Optional[str] = None
    year_of_study: Optional[str] = None
    college_name: Optional[str] = None
    target_role: Optional[str] = None
    target_companies: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    branch: Optional[str] = None
    year_of_study: Optional[str] = None
    college_name: Optional[str] = None
    target_role: Optional[str] = None
    target_companies: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    notification_preferences: Optional[Dict] = {}
    ai_preferences: Optional[Dict] = {}
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    branch: Optional[str] = None
    year_of_study: Optional[str] = None
    college_name: Optional[str] = None
    target_role: Optional[str] = None
    target_companies: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    notification_preferences: Optional[Dict] = None
    ai_preferences: Optional[Dict] = None


# ─── TASK ────────────────────────────────────────────────────────────────────
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    tag: Optional[str] = None
    due_date: Optional[datetime] = None
    estimated_hours: float = 1.0


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    tag: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None


class TaskStatusUpdate(BaseModel):
    status: str


class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    priority: str
    tag: Optional[str] = None
    status: str
    due_date: Optional[datetime] = None
    estimated_hours: float
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── EXAM ────────────────────────────────────────────────────────────────────
class ExamCreate(BaseModel):
    name: str
    subject_code: Optional[str] = None
    exam_date: datetime
    duration_hours: float = 3.0
    topics: Optional[List[str]] = []


class ExamUpdate(BaseModel):
    name: Optional[str] = None
    subject_code: Optional[str] = None
    exam_date: Optional[datetime] = None
    duration_hours: Optional[float] = None
    topics: Optional[List[str]] = None
    readiness_score: Optional[int] = None
    notes: Optional[str] = None


class ExamOut(BaseModel):
    id: int
    name: str
    subject_code: Optional[str] = None
    exam_date: datetime
    duration_hours: float
    topics: Optional[List[str]] = []
    readiness_score: int
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── STUDY SESSION ───────────────────────────────────────────────────────────
class StudySessionCreate(BaseModel):
    subject: str
    notes: Optional[str] = None


class StudySessionOut(BaseModel):
    id: int
    subject: str
    notes: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_hours: Optional[float] = None
    is_active: bool

    class Config:
        from_attributes = True


# ─── STUDY PLAN ──────────────────────────────────────────────────────────────
class StudyPlanCreate(BaseModel):
    task_description: str
    subject: str
    scheduled_date: datetime
    duration_hours: float = 1.0


class StudyPlanOut(BaseModel):
    id: int
    task_description: str
    subject: str
    scheduled_date: datetime
    duration_hours: float
    is_completed: bool

    class Config:
        from_attributes = True


# ─── DOCUMENT ────────────────────────────────────────────────────────────────
class DocumentOut(BaseModel):
    id: int
    filename: str
    original_filename: str
    pages: Optional[int] = None
    estimated_study_hours: Optional[float] = None
    is_processed: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AskQuestion(BaseModel):
    question: str


# ─── RESUME ──────────────────────────────────────────────────────────────────
class ResumeOut(BaseModel):
    id: int
    filename: str
    ats_score: Optional[int] = None
    is_analyzed: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ResumeAnalysis(BaseModel):
    ats_score: int
    present_skills: List[str]
    missing_skills: List[str]
    suggestions: List[Any]
    job_matches: List[Dict]
    section_scores: Dict


class AnalyzeJD(BaseModel):
    job_description: str


# ─── NOTIFICATION ────────────────────────────────────────────────────────────
class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    type: str
    priority: str
    is_read: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── PLACEMENT CHAT ──────────────────────────────────────────────────────────
class PlacementChat(BaseModel):
    message: str


class PlacementChatResponse(BaseModel):
    response: str


# ─── NOTES ───────────────────────────────────────────────────────────────────
class NoteFolderCreate(BaseModel):
    name: str
    icon: str = "📁"
    color: str = "blue"


class NoteFolderOut(BaseModel):
    id: int
    name: str
    icon: str
    color: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NoteCreate(BaseModel):
    title: str
    content: Optional[str] = None
    folder_id: Optional[int] = None
    tags: Optional[List[str]] = []
    is_starred: bool = False


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    folder_id: Optional[int] = None
    tags: Optional[List[str]] = None
    is_starred: Optional[bool] = None
    word_count: Optional[int] = None


class NoteOut(BaseModel):
    id: int
    title: str
    content: Optional[str] = None
    folder_id: Optional[int] = None
    tags: Optional[List[str]] = []
    is_starred: bool
    word_count: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NoteAIRequest(BaseModel):
    question: str
