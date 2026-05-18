from pydantic import BaseModel


class PlannerResponse(BaseModel):
    ai_plan: str

    class Config:
        from_attributes = True