"""Tests for GET /dashboard/tasks/today and GET /dashboard/summary."""

from datetime import datetime, timezone

import pytest

_NOTE = {"title": "Dashboard Note", "content": "Content."}


@pytest.fixture
def note(client, auth_headers, mocker):
    mocker.patch("app.api.routes.notes.analyze_note", return_value=None)
    resp = client.post("/api/v1/notes/", json=_NOTE, headers=auth_headers)
    assert resp.status_code == 201
    return resp.json()


def _today_noon() -> str:
    """ISO-8601 string for noon UTC today."""
    dt = datetime.now(timezone.utc).replace(hour=12, minute=0, second=0, microsecond=0)
    return dt.isoformat()


# ── /dashboard/tasks/today ────────────────────────────────────────────────────

def test_tasks_today_empty(client, auth_headers):
    resp = client.get("/api/v1/dashboard/tasks/today", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json() == []


def test_tasks_today_returns_due_today(client, auth_headers, note):
    client.post(
        f"/api/v1/notes/{note['id']}/tasks/",
        json={"task_text": "Today task", "due_date": _today_noon()},
        headers=auth_headers,
    )
    resp = client.get("/api/v1/dashboard/tasks/today", headers=auth_headers)
    assert resp.status_code == 200
    tasks = resp.json()
    assert len(tasks) == 1
    assert tasks[0]["task_text"] == "Today task"


def test_tasks_today_excludes_completed(client, auth_headers, note):
    task_resp = client.post(
        f"/api/v1/notes/{note['id']}/tasks/",
        json={"task_text": "Done task", "due_date": _today_noon()},
        headers=auth_headers,
    )
    task_id = task_resp.json()["id"]
    client.patch(
        f"/api/v1/notes/{note['id']}/tasks/{task_id}",
        json={"is_completed": True},
        headers=auth_headers,
    )
    resp = client.get("/api/v1/dashboard/tasks/today", headers=auth_headers)
    assert resp.json() == []


def test_tasks_today_excludes_no_due_date(client, auth_headers, note):
    client.post(
        f"/api/v1/notes/{note['id']}/tasks/",
        json={"task_text": "No date task"},
        headers=auth_headers,
    )
    resp = client.get("/api/v1/dashboard/tasks/today", headers=auth_headers)
    assert resp.json() == []


def test_tasks_today_custom_target_date(client, auth_headers, note):
    client.post(
        f"/api/v1/notes/{note['id']}/tasks/",
        json={"task_text": "Future task", "due_date": "2030-06-15T10:00:00Z"},
        headers=auth_headers,
    )
    resp = client.get("/api/v1/dashboard/tasks/today?target_date=2030-06-15", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1
    assert resp.json()[0]["task_text"] == "Future task"


def test_tasks_today_user_isolation(client, mocker):
    """Tasks of another user must not appear in the current user's today list."""
    mocker.patch("app.api.routes.notes.analyze_note", return_value=None)

    client.post("/api/v1/auth/register", json={"username": "alice", "email": "a@a.com", "password": "pass12345"})
    client.post("/api/v1/auth/register", json={"username": "bob",   "email": "b@b.com", "password": "pass12345"})

    def _headers(username):
        tok = client.post("/api/v1/auth/login", data={"username": username, "password": "pass12345"}).json()["access_token"]
        return {"Authorization": f"Bearer {tok}"}

    alice = _headers("alice")
    bob   = _headers("bob")

    alice_note = client.post("/api/v1/notes/", json=_NOTE, headers=alice).json()
    client.post(
        f"/api/v1/notes/{alice_note['id']}/tasks/",
        json={"task_text": "Alice's task", "due_date": _today_noon()},
        headers=alice,
    )

    bob_tasks = client.get("/api/v1/dashboard/tasks/today", headers=bob).json()
    assert bob_tasks == []


def test_tasks_today_requires_auth(client):
    assert client.get("/api/v1/dashboard/tasks/today").status_code == 401


# ── /dashboard/summary ────────────────────────────────────────────────────────

def test_summary_empty(client, auth_headers):
    resp = client.get("/api/v1/dashboard/summary", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json() == {}


def test_summary_counts_by_category(client, auth_headers, mocker):
    mocker.patch("app.api.routes.notes.analyze_note", side_effect=[
        {"category": "#work",     "summary": "s", "tasks": []},
        {"category": "#work",     "summary": "s", "tasks": []},
        {"category": "#personal", "summary": "s", "tasks": []},
    ])
    for i in range(3):
        client.post("/api/v1/notes/", json={"title": f"Note {i}", "content": "x"}, headers=auth_headers)

    resp = client.get("/api/v1/dashboard/summary", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["#work"] == 2
    assert data["#personal"] == 1


def test_summary_groups_uncategorised(client, auth_headers, mocker):
    mocker.patch("app.api.routes.notes.analyze_note", return_value=None)
    client.post("/api/v1/notes/", json=_NOTE, headers=auth_headers)

    resp = client.get("/api/v1/dashboard/summary", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["uncategorised"] == 1


def test_summary_requires_auth(client):
    assert client.get("/api/v1/dashboard/summary").status_code == 401
