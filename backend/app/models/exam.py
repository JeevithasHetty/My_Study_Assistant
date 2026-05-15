from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    ForeignKey,
    DateTime
)
from sqlalchemy.sql import func
from app.core.database import Base


class Exam(Base):
    __tablename__ = "exams"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    subject = Column(
        String,
        nullable=False
    )

    syllabus_size = Column(Integer)

    exam_date = Column(Date)

    importance = Column(String)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )