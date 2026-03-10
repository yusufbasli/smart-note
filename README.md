# Smart Note

AI-powered note and task management app. Works on **mobile (iOS & Android)** and **desktop (web)** from a single codebase.

## Structure

```
smart-note/
├── backend/    # FastAPI REST API (Python 3.13 + PostgreSQL)
└── frontend/   # Expo + React Native (iOS, Android, Web)
```

## Quick Start

### Option 1 — Docker (Recommended)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
git clone https://github.com/yusufbasli/smart-note.git
cd smart-note
cp backend/.env.example backend/.env
# Optional: add your OPENAI_API_KEY to backend/.env
docker compose up --build
```

| Service | URL |
|---|---|
| Web App | http://localhost:3000 |
| API (Swagger UI) | http://localhost:8000/docs |

PostgreSQL is created automatically and migrations run on first start.

### Option 2 — Manual

**Backend:**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # then edit DATABASE_URL and SECRET_KEY
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npx expo start         # opens mobile + web dev server
```

## Tech Stack

| | Technology |
|---|---|
| Backend API | FastAPI, SQLAlchemy 2.x, PostgreSQL |
| Auth | JWT (python-jose) + bcrypt |
| AI | OpenAI GPT-4o-mini |
| Mobile & Web | Expo, React Native, TypeScript |
| Styling | NativeWind (Tailwind CSS for React Native) |
| State management | Zustand + AsyncStorage |
