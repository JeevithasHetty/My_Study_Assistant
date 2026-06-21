from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.api.router import api_router
from app.core.database import create_tables
from app.core.config import settings

app = FastAPI(
    title="StudentOS AI API",
    description="AI-powered Academic & Career Success Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow frontend dev server + production (configured via ALLOWED_ORIGINS env var)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API routes
app.include_router(api_router)

# Serve uploaded files statically
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.RESUME_UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
app.mount("/resume-uploads", StaticFiles(directory=settings.RESUME_UPLOAD_DIR), name="resume-uploads")


@app.on_event("startup")
def startup_event():
    """Create PostgreSQL tables on startup."""
    create_tables()
    print("✅ StudentOS AI backend started — PostgreSQL connected")


@app.get("/")
def root():
    return {
        "name": "StudentOS AI API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
