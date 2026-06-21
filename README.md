# StudentOS AI

An AI-powered academic and career operating system for students — built on a FastAPI backend with a PostgreSQL database and a dark, futuristic React frontend. A seven-agent AI system (powered by Groq's `llama-3.3-70b-versatile`) coordinates resume analysis, placement readiness, study planning, learning assistance, and resource curation into one coherent Career Coach.

## What's in this build

This is a full upgrade of the original StudentOS AI scaffold. The existing, working backend (auth, tasks, exams, study sessions, planner, resume, documents, placement, dashboard) was kept and reused as-is wherever it already worked. On top of that:

**New backend features**
- `/notes` — full notes system: folders, CRUD, and six AI operations (summarize, flashcards, MCQs, interview questions, explain, ask) per note. Backed by new `Note` and `NoteFolder` database tables.
- `/learning` — standalone Learning Assistant endpoints (explain, practice questions, interview questions, related topics, career relevance) usable for any topic, independent of uploaded documents.
- `/career-coach` — the seven-agent system: Resume Analyst, Placement Mentor, Study Planner, Learning Assistant, Resource Agent, Document Tutor, and the manager agent, Career Coach. Includes weekly goals, a skill roadmap, per-agent chat, and a smart exam planner.
- Saved resources moved from an in-memory dictionary (lost on every server restart) to a real `SavedResource` table.
- Dashboard stats extended with a real per-day weekly study hours breakdown, task completion rate, and ATS score trend (vs. the previous resume upload).

**New frontend**
A complete dark, glassmorphic UI (Cursor/Linear/Perplexity-style) covering every page: landing page, auth, dashboard, AI Career Coach, Resume Analyzer, Document Tutor, Learning Assistant, Study Planner, Tasks (kanban), Exams, Notes (with AI sidebar), Placement Readiness, Resources, Analytics, Notifications, and Settings.

**Bugs found and fixed in the original codebase**
- `core/security.py` imported `from app.models.user import User`, but models live in a flat `app/models/__init__.py` with no `user` submodule — this would have crashed on every authenticated request. Fixed to `from app.models import User`.
- The frontend's Tailwind v4 setup was missing its PostCSS plugin wiring (`@tailwindcss/postcss` and `postcss.config.js` didn't exist), so no Tailwind classes would have compiled at all. Added the plugin, config, and switched `index.css` to the v4 `@import "tailwindcss"` + `@config` syntax so the existing `tailwind.config.js` theme still works.
- `lucide-react` was pinned to `^1.16.0`, which resolves to a version that removed all brand/logo icons (`Youtube`, `Github`, `Twitter`, `Linkedin`). Replaced these with generic equivalents (`Video`, `Code2`, `MessageCircle`, `Link2`) so the build doesn't fail.

## Project structure

```
.
├── backend/                 FastAPI app (Python 3.12)
│   ├── app/
│   │   ├── api/routes/      One file per resource (auth, tasks, notes, career_coach, ...)
│   │   ├── models/          SQLAlchemy models (single __init__.py)
│   │   ├── schemas/         Pydantic schemas (single __init__.py)
│   │   ├── services/        groq_service.py, pdf_service.py, youtube_service.py
│   │   └── core/            config, database, security
│   ├── requirements.txt
│   ├── setup_db.sql         Run once to create the Postgres role + database
│   └── Dockerfile
├── frontend/                 React 19 + Vite + Tailwind v4
│   ├── src/
│   │   ├── pages/            One folder per feature area
│   │   ├── components/       layout/ and common/ shared UI
│   │   ├── services/api.js   All backend API calls
│   │   └── context/          Auth context
│   └── Dockerfile
└── docker-compose.yml        Postgres + backend + frontend, one command
```

## Running locally without Docker

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # fill in DATABASE_URL, SECRET_KEY, GROQ_API_KEY
psql -U postgres -f setup_db.sql   # one-time: creates the studentos_user role + database
uvicorn app.main:app --reload
```
The API comes up on `http://localhost:8000`; interactive docs at `/docs`.

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env         # VITE_API_URL=http://localhost:8000
npm run dev
```
The app comes up on `http://localhost:5173`.

## Running with Docker

```bash
cp .env.example .env          # fill in GROQ_API_KEY at minimum
docker compose up --build
```
This starts Postgres, the backend (port 8000), and the frontend served via nginx (port 5173). Tables are created automatically on backend startup.

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | backend | PostgreSQL connection string |
| `SECRET_KEY` | backend | JWT signing secret — use a long random value in production |
| `GROQ_API_KEY` | backend | Required — powers every AI feature via Groq |
| `YOUTUBE_API_KEY` | backend | Optional — powers video recommendations in Document Tutor |
| `VITE_API_URL` | frontend | Base URL the frontend uses to reach the backend |

The `.env` files copied into this build carry over the credentials from your original upload so local development keeps working immediately. Rotate `SECRET_KEY` and the API keys before deploying anywhere public or committing to a shared repository.

## The seven agents

Resume Analyst, Placement Mentor, Study Planner, Learning Assistant, Resource Agent, and Document Tutor each focus on one job; the Career Coach sits above them as the manager agent, synthesizing their outputs into weekly goals and a long-term roadmap. All eight call into `groq_service.py`, which wraps Groq's `llama-3.3-70b-versatile` with both freeform chat and JSON-mode helpers.
