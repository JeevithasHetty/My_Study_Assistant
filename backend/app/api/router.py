from fastapi import APIRouter
from app.api.routes import auth, users, tasks, exams, study_sessions, planner
from app.api.routes import resume, documents, dashboard, placement, resources
from app.api.routes import notes, learning, career_coach

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(tasks.router)
api_router.include_router(exams.router)
api_router.include_router(study_sessions.router)
api_router.include_router(planner.router)
api_router.include_router(resume.router)
api_router.include_router(documents.router)
api_router.include_router(dashboard.router)
api_router.include_router(placement.router)
api_router.include_router(resources.router)
api_router.include_router(notes.router)
api_router.include_router(learning.router)
api_router.include_router(career_coach.router)
