"""
Shared pytest fixtures for the Smart-Note & Task Orchestrator test suite.

Strategy
--------
* A single SQLite :memory: engine (StaticPool) replaces PostgreSQL for all
  tests — no real database is needed.
* The module-level `engine` name in `app.main` is patched to the SQLite engine
  so the lifespan `Base.metadata.create_all(bind=engine)` call succeeds.
* The `get_db` FastAPI dependency is overridden to provide sessions bound to
  the same SQLite engine.
* All tables are created before each test and dropped afterwards (`reset_db`
  autouse fixture), so every test starts with a clean slate.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.main as _main_module
import app.database as _db_module
from app.database import Base, get_db
from app.main import app

# ── Single in-memory SQLite engine shared by all test sessions ─────────────
_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
_Session = sessionmaker(autocommit=False, autoflush=False, bind=_engine)

# ── Patch module-level engine references before any test runs ───────────────
# This makes the lifespan `create_all(bind=engine)` in main.py use SQLite.
_main_module.engine = _engine
_db_module.engine = _engine
_db_module.SessionLocal = _Session


# ── Override the get_db dependency ──────────────────────────────────────────
def _override_get_db():
    db = _Session()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = _override_get_db


# ── Fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture(autouse=True)
def reset_db():
    """Create all tables before each test; drop them after."""
    Base.metadata.create_all(bind=_engine)
    yield
    Base.metadata.drop_all(bind=_engine)


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def registered_user(client):
    resp = client.post("/api/v1/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123",
    })
    assert resp.status_code == 201
    return resp.json()


@pytest.fixture
def auth_headers(client, registered_user):
    resp = client.post("/api/v1/auth/login", data={
        "username": "testuser",
        "password": "testpass123",
    })
    assert resp.status_code == 200
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}
