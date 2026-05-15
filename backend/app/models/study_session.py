from sqlalchemy import (
    Column,
    Integer,
    DateTime,
    ForeignKey
)
from sqlalchemy.sql import func
from app.core.database import Base


class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    hours_studied = Column(
        Integer,
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )