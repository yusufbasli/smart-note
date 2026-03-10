from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import Base, engine
from app.limiter import limiter
from app.api.routes import auth, notes, tasks
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.standalone_tasks import router as standalone_tasks_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # On startup: create tables (use Alembic migrations in production)
    Base.metadata.create_all(bind=engine)
    yield
    # Add shutdown logic here if needed


app = FastAPI(
    title=settings.APP_TITLE,
    version=settings.APP_VERSION,
    description=(
        "Smart-Note & Task Orchestrator API — "
        "AI-powered note and task management service."
    ),
    lifespan=lifespan,
)

# ── Rate limiting ────────────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS (open for frontend/mobile; restrict origins in production) ──────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.APP_ENV == "development" else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ────────────────────────────────────────────────────────
API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(notes.router, prefix=API_PREFIX)
app.include_router(tasks.router, prefix=API_PREFIX)
app.include_router(standalone_tasks_router, prefix=API_PREFIX)
app.include_router(dashboard_router, prefix=API_PREFIX)


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "version": settings.APP_VERSION}
