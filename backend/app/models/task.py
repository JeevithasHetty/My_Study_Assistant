from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
    DateTime
)
from sqlalchemy.sql import func
from app.core.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String,
        nullable=False
    )

    description = Column(String)

    priority = Column(String)

    estimated_hours = Column(
        Integer,
        default=1
    )

    completed = Column(
        Boolean,
        default=False
    )

    due_date = Column(DateTime)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )