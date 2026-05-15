from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime
)
from sqlalchemy.sql import func
from app.core.database import Base


class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    filename = Column(
        String,
        nullable=False
    )

    file_path = Column(
        String,
        nullable=False
    )

    document_type = Column(String)

    file_size = Column(Integer)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )