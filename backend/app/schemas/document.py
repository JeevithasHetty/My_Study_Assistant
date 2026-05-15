from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: int
    filename: str
    document_type: str
    file_size: int

    class Config:
        from_attributes = True