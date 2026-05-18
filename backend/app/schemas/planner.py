from pydantic import BaseModel


class PlannerResponse(BaseModel):
    id: int
    ai_plan: str
    plan_date: str
    status: str

    class Config:
        from_attributes = True