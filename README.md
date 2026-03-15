# Smart Note

An AI-powered note and task management application with a FastAPI backend, PostgreSQL database, and a responsive Expo React Native frontend that runs on web, Android, and iOS.

| Service | URL |
|---------|-----|
| Web client | http://localhost:8081 (dev) / http://localhost:3000 (Docker) |
| API | http://localhost:8000/api/v1 |
| Swagger UI | http://localhost:8000/docs |

---

## Features

- **Authentication** — JWT register/login with bcrypt password hashing and rate-limited endpoints
- **Notes** — full CRUD with full-text search, category filter, and pagination
- **AI analysis** — GPT-4o-mini categorises a note, generates a summary, and extracts tasks with inferred due dates
- **Task management** — tasks nested under notes or created as standalone; recurring task support with daily reset logic
- **Dashboard** — tasks filtered by period (`today`, `tomorrow`, `week`, `all`) and a note count breakdown by AI category
- **Responsive UI** — persistent top navigation bar on desktop (≥768 px), bottom tab bar on mobile

---

## Repository Structure

```
smart-note/
├── backend/     # FastAPI · SQLAlchemy 2.x · PostgreSQL · Alembic
├── frontend/    # Expo · React Native · TypeScript
├── docs/        # Screenshots and assets
└── docker-compose.yml
```

---

## Quick Start — Docker (Recommended)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
git clone https://github.com/yusufbasli/smart-note.git
cd smart-note
cp backend/.env.example backend/.env
```

Set your OpenAI key in `backend/.env` (optional — app works without it):

```env
OPENAI_API_KEY=sk-...
```

Start all services:

```bash
docker compose up --build
```

PostgreSQL, the backend API, migrations, and the frontend web app all start automatically.

---

## Manual Setup

### Backend

```bash
cd backend
python -m venv .venv

# Windows
.\.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# edit .env — set DATABASE_URL, SECRET_KEY, OPENAI_API_KEY

alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# .env: set EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

npx expo start --web   # web
npx expo start         # interactive (web / iOS / Android)
```

---

## Validation

Backend tests (SQLite, no PostgreSQL required):

```bash
cd backend
pip install -r requirements-dev.txt
pytest tests/ -v
```

Frontend type check:

```bash
cd frontend
npm run typecheck
```

---

## Usage Walkthrough

1. Open http://localhost:8081 and create an account.
2. Tap **+** to create a note; AI analysis runs automatically on save.
3. Open the note and add tasks in the **Tasks** section.
4. Navigate to **Dashboard** and switch period tabs to view tasks by date.
5. Mark tasks done, edit, or delete them directly from the dashboard.
6. Tap **✨ Analyse** on a note detail page to re-run AI analysis at any time.

> If AI returns `503`, the most common cause is an exhausted OpenAI quota (`429`). The note is saved normally regardless.

---

## Screenshots

### Register

![Register](docs/screenshots/register.png)

### Notes List

![Notes list](docs/screenshots/notes-list.png)

### Note Detail

![Note detail](docs/screenshots/note-detail.png)

### Dashboard — Pending Tasks

![Dashboard pending](docs/screenshots/dashboard-pending.png)

### Dashboard — Completed Tasks

![Dashboard completed](docs/screenshots/dashboard-completed.png)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend API | FastAPI 0.115, Python 3.13 |
| ORM & DB | SQLAlchemy 2.x, PostgreSQL 16, Alembic |
| Auth | JWT (python-jose), bcrypt, SlowAPI rate limiting |
| AI | OpenAI GPT-4o-mini |
| Frontend | Expo 55, React Native 0.83, TypeScript |
| Navigation | React Navigation 7 |
| State | Zustand 5, AsyncStorage |
| HTTP | Axios |
| Container | Docker, Docker Compose |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| AI button returns `503` | Check backend logs; likely OpenAI `429 insufficient_quota` |
| `docker compose` not found | Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and restart the terminal |
| Dashboard task not visible | Switch the period tab and verify the task's due date |
| Username validation error | Usernames must match `^[a-zA-Z0-9_]+$` |
| Mobile app can't reach API | Use your LAN IP instead of `localhost` in `EXPO_PUBLIC_API_BASE_URL` |

---

## Docs

- [Backend README](backend/README.md) — API reference, environment variables, test guide
- [Frontend README](frontend/README.md) — UI architecture, environment setup, run commands
