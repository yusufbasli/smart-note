# Smart-Note & Task Orchestrator — Backend API

An AI-powered note and task management REST API built with **FastAPI** and **PostgreSQL**. Users write notes; the AI automatically categorises them, writes a summary, and extracts to-do items. All notes and tasks can also be managed manually.

## Features

- **JWT Authentication** — register, login (username or e-mail), bearer token
- **Notes CRUD** — create, read, update, delete with full-text search, category filter, and pagination
- **Tasks CRUD** — tasks are nested under notes; support due dates and completion status
- **AI Analysis** — GPT-4o-mini categorises a note, writes a summary, and extracts tasks automatically on creation; can be re-triggered at any time
- **Dashboard** — today's incomplete tasks, note counts per AI category
- **Alembic migrations** — schema-safe database upgrades without data loss
- **57 automated tests** — full API coverage with an in-memory SQLite test database (no PostgreSQL required to run tests)

## Tech Stack

| Layer | Technology |
|---|---|
| API framework | FastAPI 0.115 |
| Database | PostgreSQL + SQLAlchemy 2.x ORM |
| Auth | JWT (python-jose) + bcrypt |
| AI | OpenAI GPT-4o-mini |
| Migrations | Alembic |
| Testing | pytest + httpx TestClient |
| Runtime | Python 3.13, uvicorn |

## Project Structure

```
smart-note-backend/
├── app/
│   ├── config.py          # pydantic-settings → reads .env
│   ├── database.py        # SQLAlchemy engine, SessionLocal, get_db()
│   ├── models.py          # User, Note, Task (UUID PKs, SQLAlchemy 2.x)
│   ├── schemas.py         # Pydantic v2 request / response schemas
│   ├── auth.py            # bcrypt hashing, JWT create/decode, get_current_user
│   ├── main.py            # FastAPI app, CORS, lifespan, router registration
│   ├── api/routes/
│   │   ├── auth.py        # POST /register  POST /login  GET /me
│   │   ├── notes.py       # Full CRUD + AI analysis trigger
│   │   ├── tasks.py       # Full CRUD (nested under notes)
│   │   └── dashboard.py   # GET /tasks/today  GET /summary
│   └── services/
│       └── ai_service.py  # GPT-4o-mini → {category, summary, tasks}
├── migrations/            # Alembic migration environment
├── tests/
│   ├── conftest.py        # SQLite test engine, shared fixtures
│   ├── test_auth.py
│   ├── test_notes.py
│   ├── test_tasks.py
│   └── test_dashboard.py
├── .env.example
├── requirements.txt
└── requirements-dev.txt
```

## Getting Started

### 1. Clone and create a virtual environment

```bash
git clone https://github.com/<your-username>/smart-note-backend.git
cd smart-note-backend
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
SECRET_KEY=<generate a long random string>
OPENAI_API_KEY=sk-...        # leave blank to disable AI (app still works)
APP_ENV=development
```

Generate a secure `SECRET_KEY`:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### 4. Create the database

```sql
CREATE DATABASE smartnote_db;
```

### 5. Run migrations

```bash
# First time: generate the initial migration from the models
.\.venv\Scripts\alembic revision --autogenerate -m "initial"

# Apply to the database
.\.venv\Scripts\alembic upgrade head
```

### 6. Start the server

```bash
.\.venv\Scripts\uvicorn app.main:app --reload
```

**Swagger UI** → http://localhost:8000/docs  
**ReDoc** → http://localhost:8000/redoc  
**Health check** → http://localhost:8000/health

## API Reference

All endpoints are prefixed with `/api/v1`.

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Create a new user |
| `POST` | `/auth/login` | Get a JWT token (form data: `username`, `password`) |
| `GET` | `/auth/me` | Current user info (requires token) |

### Notes

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/notes/` | Create note → triggers AI analysis |
| `GET` | `/notes/` | List notes (query: `skip`, `limit`, `category`, `search`) |
| `GET` | `/notes/{id}` | Get a note with its task list |
| `PATCH` | `/notes/{id}` | Update title / content |
| `DELETE` | `/notes/{id}` | Delete note (cascade deletes tasks) |
| `POST` | `/notes/{id}/analyze` | Re-run AI analysis on existing note |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/notes/{id}/tasks/` | Add a task to a note |
| `GET` | `/notes/{id}/tasks/` | List tasks for a note |
| `PATCH` | `/notes/{id}/tasks/{tid}` | Update text, completion, or due date |
| `DELETE` | `/notes/{id}/tasks/{tid}` | Delete a task |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard/tasks/today` | Incomplete tasks due today (optional: `?target_date=YYYY-MM-DD`) |
| `GET` | `/dashboard/summary` | Note counts grouped by AI category |

## Running Tests

No PostgreSQL or OpenAI key needed — tests use an in-memory SQLite database and mock the AI service.

```bash
pip install -r requirements-dev.txt
pytest tests/ -v
```

```
57 passed in 19s
```

## AI Behaviour

- When a note is created, GPT-4o-mini analyses the content and returns:
  - `category` — one of `#work | #school | #personal | #health | #finance | #other`
  - `summary` — 1–2 sentence summary
  - `tasks` — detected to-do items (automatically saved as Task rows)
- If the OpenAI API key is not set, AI analysis is silently skipped — the note is saved normally.
- AI errors are **non-fatal**: a network timeout or API error will never prevent a note from being saved.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5432/smartnote_db` | PostgreSQL connection string |
| `SECRET_KEY` | `change-me` | JWT signing secret — **always change in production** |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Token lifetime |
| `OPENAI_API_KEY` | _(empty)_ | OpenAI key — leave blank to disable AI |
| `APP_ENV` | `development` | `development` opens CORS for all origins |
| `APP_VERSION` | `0.1.0` | Shown in Swagger UI |

## License

MIT
