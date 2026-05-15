from sqlalchemy import (
    Column,
    Integer,
    Text,
    ForeignKey
)
from app.core.database import Base


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    content = Column(
        Text,
        nullable=False
    )

    document_id = Column(
        Integer,
        ForeignKey("uploaded_documents.id"),
        nullable=False
    )