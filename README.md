# Smart Note

AI-powered note and task management app. Works on **mobile (iOS & Android)** and **desktop (web)** from a single codebase.

## Structure

```
smart-note/
├── backend/    # FastAPI REST API (Python 3.13 + PostgreSQL)
└── frontend/   # Expo + React Native (iOS, Android, Web)
```

## Quick Start

### Backend
See [backend/README.md](backend/README.md)

```bash
cd backend
pip install -r requirements.txt
# configure .env (copy from .env.example)
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npx expo start
```

## Tech Stack

| | Technology |
|---|---|
| Backend API | FastAPI, SQLAlchemy, PostgreSQL |
| Auth | JWT (python-jose) + bcrypt |
| AI | OpenAI GPT-4o-mini |
| Mobile & Web | Expo, React Native |
| State management | TBD |
