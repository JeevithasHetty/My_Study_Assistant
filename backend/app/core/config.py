from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    GROQ_API_KEY: str
    YOUTUBE_API_KEY: Optional[str] = None

    UPLOAD_DIR: str = "uploads"
    RESUME_UPLOAD_DIR: str = "resume_uploads"
    MAX_FILE_SIZE_MB: int = 10

    # Comma-separated list of allowed frontend origins for CORS.
    # Defaults to local dev servers; set this in production to your real
    # frontend domain(s), e.g. "https://app.studentos.ai,https://studentos.ai"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
