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

# =========================
# CORS CONFIG (FIXED)
# =========================

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://my-study-assistant-e1hzkfl2s-jeevitha3shetty-9221s-projects.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# ROUTES
# =========================

app.include_router(api_router)


# =========================
# STATIC FILES
# =========================

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.RESUME_UPLOAD_DIR, exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=settings.UPLOAD_DIR),
    name="uploads",
)

app.mount(
    "/resume-uploads",
    StaticFiles(directory=settings.RESUME_UPLOAD_DIR),
    name="resume-uploads",
)


# =========================
# STARTUP EVENT
# =========================

@app.on_event("startup")
def startup_event():
    """Initialize DB on startup"""
    create_tables()
    print("✅ StudentOS AI backend started successfully")


# =========================
# ROOT ROUTES
# =========================

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