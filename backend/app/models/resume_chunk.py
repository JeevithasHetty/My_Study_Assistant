from sqlalchemy import (
    Column,
    Integer,
    Text,
    ForeignKey
)

from app.core.database import Base


class ResumeChunk(Base):
    __tablename__ = "resume_chunks"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    content = Column(
        Text,
        nullable=False
    )

    resume_id = Column(
        Integer,
        ForeignKey("resumes.id"),
        nullable=False
    )