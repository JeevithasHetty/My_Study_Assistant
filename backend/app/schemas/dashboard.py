from pydantic import BaseModel
from typing import List


class DashboardOverviewResponse(BaseModel):
    total_tasks: int
    completed_tasks: int
    total_study_hours: int
    upcoming_exams: int
    placement_readiness: int
    recommendations: List[str]