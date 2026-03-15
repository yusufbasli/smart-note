# Smart Note — Backend API

A production-style REST API for note and task management with optional AI enrichment. Built with **FastAPI**, **PostgreSQL**, and **SQLAlchemy 2.x**.

---

## Features

| Feature | Details |
|---------|---------|
| **Authentication** | JWT bearer token via `/auth/login`; bcrypt password hashing; rate-limited register (10 req/min) and login (20 req/min) |
| **Notes CRUD** | Create, read, update, delete; full-text search, category filter, pagination |
| **AI analysis** | GPT-4o-mini auto-categorises, summarises, and extracts tasks from note content; re-triggerable at any time |
| **Note tasks** | Tasks nested under notes — due dates, completion status, recurring flag |
| **Standalone tasks** | `/tasks/` endpoint for tasks not linked to any note; period filters (`today`, `tomorrow`, `week`, `all`) |
| **Recurring tasks** | Daily-reset logic via `last_completed_date`; treated as pending again at midnight |
| **Dashboard** | Today's tasks + note breakdown by AI category |
| **Migrations** | Alembic — schema changes are versioned and reproducible |
| **Test suite** | 66 automated tests; in-memory SQLite (no PostgreSQL required to run tests) |
| **CORS** | All origins in `development`; explicit allow-list via `ALLOWED_ORIGINS` in production |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | FastAPI 0.115 |
| ORM | SQLAlchemy 2.x |
| Database | PostgreSQL 16 (SQLite for tests) |
| Migrations | Alembic |
| Auth | python-jose (JWT HS256), passlib + bcrypt |
| Rate limiting | SlowAPI |
| AI | OpenAI Python SDK, GPT-4o-mini |
| Validation | Pydantic v2 |
| Testing | pytest, httpx |
| Runtime | Python 3.13, uvicorn |

---

## Project Structure

```
backend/
├── app/
│   ├── config.py              # Pydantic-settings — reads .env
│   ├── database.py            # Engine, SessionLocal, get_db() dependency
│   ├── models.py              # User, Note, Task (UUID primary keys)
│   ├── schemas.py             # Pydantic v2 request / response schemas
│   ├── auth.py                # bcrypt helpers, JWT create/decode, get_current_user
│   ├── limiter.py             # SlowAPI limiter instance
│   ├── main.py                # App factory, CORS middleware, router registration
│   └── api/routes/
│       ├── auth.py            # POST /register  POST /login  GET /me
│       ├── notes.py           # Notes CRUD + POST /notes/{id}/analyze
│       ├── tasks.py           # Note-scoped task CRUD
│       ├── standalone_tasks.py # Standalone task CRUD with period filtering
│       └── dashboard.py       # GET /tasks/today  GET /summary
│   └── services/
│       └── ai_service.py      # OpenAI integration (lazy singleton client)
├── migrations/                # Alembic environment and revision scripts
├── tests/
│   ├── conftest.py            # SQLite engine, shared fixtures
│   ├── test_auth.py
│   ├── test_notes.py
│   ├── test_tasks.py
│   └── test_dashboard.py
├── .env.example
├── requirements.txt
└── requirements-dev.txt
```

---

## Getting Started

### 1. Clone and create a virtual environment

```bash
git clone https://github.com/yusufbasli/smart-note.git
cd smart-note/backend

python -m venv .venv

# Windows
.\.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/smartnote_db
SECRET_KEY=<generate with: python -c "import secrets; print(secrets.token_hex(32))">
OPENAI_API_KEY=sk-...        # leave blank to disable AI (app still works)
APP_ENV=development
ALLOWED_ORIGINS=http://localhost:8081
```

### 4. Create the database

```sql
CREATE DATABASE smartnote_db;
```

### 5. Run migrations

```bash
alembic upgrade head
```

### 6. Start the server

```bash
uvicorn app.main:app --reload
```

| URL | Description |
|-----|-------------|
| http://localhost:8000/docs | Swagger UI |
| http://localhost:8000/redoc | ReDoc |
| http://localhost:8000/health | Health check |

---

## API Reference

All endpoints are prefixed with `/api/v1`.

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Create a new user |
| `POST` | `/auth/login` | Get a JWT token (`username` + `password` form fields) |
| `GET`  | `/auth/me` | Current user profile (requires bearer token) |

### Notes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST`   | `/notes/` | Create note — AI analysis runs automatically |
| `GET`    | `/notes/` | List notes (`skip`, `limit`, `category`, `search`) |
| `GET`    | `/notes/{id}` | Get a note with its full task list |
| `PATCH`  | `/notes/{id}` | Update title, content, or category |
| `DELETE` | `/notes/{id}` | Delete note and all its tasks |
| `POST`   | `/notes/{id}/analyze` | Re-run AI analysis on an existing note |

### Note Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST`   | `/notes/{id}/tasks/` | Add a task to a note |
| `GET`    | `/notes/{id}/tasks/` | List tasks for a note |
| `PATCH`  | `/notes/{id}/tasks/{tid}` | Update text, completion, due date, or recurring flag |
| `DELETE` | `/notes/{id}/tasks/{tid}` | Delete a task |

### Standalone Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`    | `/tasks/` | List tasks (`period=today\|tomorrow\|week\|all`, `include_completed`) |
| `POST`   | `/tasks/` | Create a standalone task |
| `PATCH`  | `/tasks/{id}` | Update text, completion, due date, or recurring flag |
| `DELETE` | `/tasks/{id}` | Delete a task |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/dashboard/tasks/today` | Tasks for today (`?target_date=YYYY-MM-DD` optional) |
| `GET` | `/dashboard/summary` | Note counts grouped by AI category |

---

## Running Tests

No PostgreSQL or OpenAI key needed. Tests use an in-memory SQLite database and mock the AI service.

```bash
pip install -r requirements-dev.txt
pytest tests/ -v
# 66 passed
```

---

## AI Behaviour

When a note is created (or `/notes/{id}/analyze` is called), GPT-4o-mini returns:

| Field | Description |
|-------|-------------|
| `category` | One of `#work`, `#school`, `#personal`, `#health`, `#finance`, `#other` |
| `summary` | 1–2 sentence plain-language summary |
| `short_title` | 2–4 word suggested title |
| `tasks` | Detected to-do items with `when` hints (`today`, `tomorrow`, `this week`, or `null`) |

Task `when` hints are mapped to `due_date` values at noon UTC. A user-set category is never overridden by AI. If the OpenAI key is absent or the API call fails, the note is saved normally — AI errors are non-fatal.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5432/smartnote_db` | PostgreSQL connection string |
| `SECRET_KEY` | `change-me` | JWT signing secret — **always change in production** |
| `ALGORITHM` | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Token lifetime in minutes |
| `OPENAI_API_KEY` | _(empty)_ | OpenAI key — leave blank to disable AI |
| `APP_ENV` | `development` | `development` disables CORS origin restriction |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated allowed origins (production only) |
| `APP_VERSION` | `0.1.0` | Displayed in Swagger UI |

---

## Troubleshooting

| Error | Cause / Fix |
|-------|-------------|
| `503` on `/analyze` | OpenAI key missing, invalid, or quota exhausted |
| `401 Unauthorized` | Send `Authorization: Bearer <token>` header from `/auth/login` |
| DB connection error | Verify PostgreSQL is running and `DATABASE_URL` credentials are correct |
| Rate limit `429` | Exceeded 10 req/min on register or 20 req/min on login |

---

## License

MIT
