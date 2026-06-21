from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class TaskStatus(str, enum.Enum):
    todo = "todo"
    inprogress = "inprogress"
    done = "done"


class TaskPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


# ─── USER ────────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)

    branch = Column(String(100), nullable=True)
    year_of_study = Column(String(50), nullable=True)
    college_name = Column(String(255), nullable=True)
    target_role = Column(String(255), nullable=True)
    target_companies = Column(String(500), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)

    notification_preferences = Column(JSON, default={})
    ai_preferences = Column(JSON, default={})

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    exams = relationship("Exam", back_populates="user", cascade="all, delete-orphan")
    study_sessions = relationship("StudySession", back_populates="user", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("UploadedDocument", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    note_folders = relationship("NoteFolder", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="user", cascade="all, delete-orphan")
    saved_resources = relationship("SavedResource", back_populates="user", cascade="all, delete-orphan")


# ─── TASK ────────────────────────────────────────────────────────────────────
class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String(20), default="medium")
    tag = Column(String(100), nullable=True)
    status = Column(String(20), default="todo")
    due_date = Column(DateTime(timezone=True), nullable=True)
    estimated_hours = Column(Float, default=1.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="tasks")


# ─── EXAM ────────────────────────────────────────────────────────────────────
class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    subject_code = Column(String(50), nullable=True)
    exam_date = Column(DateTime(timezone=True), nullable=False)
    duration_hours = Column(Float, default=3.0)
    topics = Column(JSON, default=[])
    readiness_score = Column(Integer, default=50)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="exams")


# ─── STUDY SESSION ───────────────────────────────────────────────────────────
class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    duration_hours = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="study_sessions")


# ─── STUDY PLAN (planner) ────────────────────────────────────────────────────
class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    task_description = Column(String(500), nullable=False)
    subject = Column(String(255), nullable=False)
    scheduled_date = Column(DateTime(timezone=True), nullable=False)
    duration_hours = Column(Float, default=1.0)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ─── RESUME ──────────────────────────────────────────────────────────────────
class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String(500), nullable=False)
    file_path = Column(String(1000), nullable=False)
    ats_score = Column(Integer, nullable=True)
    present_skills = Column(JSON, default=[])
    missing_skills = Column(JSON, default=[])
    suggestions = Column(JSON, default=[])
    job_matches = Column(JSON, default=[])
    section_scores = Column(JSON, default={})
    raw_text = Column(Text, nullable=True)
    is_analyzed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="resumes")
    chunks = relationship("ResumeChunk", back_populates="resume", cascade="all, delete-orphan")


class ResumeChunk(Base):
    __tablename__ = "resume_chunks"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    chunk_text = Column(Text, nullable=False)
    chunk_index = Column(Integer, default=0)

    resume = relationship("Resume", back_populates="chunks")


# ─── UPLOADED DOCUMENT ───────────────────────────────────────────────────────
class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String(500), nullable=False)
    original_filename = Column(String(500), nullable=False)
    file_path = Column(String(1000), nullable=False)
    pages = Column(Integer, nullable=True)
    raw_text = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    concepts = Column(JSON, default=[])
    flashcards = Column(JSON, default=[])
    mcqs = Column(JSON, default=[])
    youtube_videos = Column(JSON, default=[])
    estimated_study_hours = Column(Float, nullable=True)
    is_processed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("uploaded_documents.id"), nullable=False)
    chunk_text = Column(Text, nullable=False)
    chunk_index = Column(Integer, default=0)

    document = relationship("UploadedDocument", back_populates="chunks")


# ─── NOTIFICATION ────────────────────────────────────────────────────────────
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="general")
    priority = Column(String(20), default="medium")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")


# ─── NOTES ───────────────────────────────────────────────────────────────────
class NoteFolder(Base):
    __tablename__ = "note_folders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    icon = Column(String(10), default="📁")
    color = Column(String(20), default="blue")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="note_folders")
    notes = relationship("Note", back_populates="folder")


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    folder_id = Column(Integer, ForeignKey("note_folders.id"), nullable=True)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=True)
    tags = Column(JSON, default=[])
    is_starred = Column(Boolean, default=False)
    word_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="notes")
    folder = relationship("NoteFolder", back_populates="notes")


# ─── SAVED RESOURCES (DB-backed) ─────────────────────────────────────────────
class SavedResource(Base):
    __tablename__ = "saved_resources"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resource_id = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="saved_resources")
