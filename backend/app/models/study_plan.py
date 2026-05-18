from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    Text
)
from sqlalchemy.sql import func
from app.core.database import Base


class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    plan_date = Column(
        String,
        nullable=False
    )

    ai_plan = Column(
        Text,
        nullable=False
    )

    status = Column(
        String,
        default="active"
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