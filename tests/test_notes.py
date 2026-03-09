"""Tests for /notes/ CRUD, pagination, search, category filter, and AI analysis."""

import pytest

_NOTE = {"title": "Test Note", "content": "This is the test content."}


@pytest.fixture
def note(client, auth_headers, mocker):
    """A persisted note with AI disabled."""
    mocker.patch("app.api.routes.notes.analyze_note", return_value=None)
    resp = client.post("/api/v1/notes/", json=_NOTE, headers=auth_headers)
    assert resp.status_code == 201
    return resp.json()


# ── Create ────────────────────────────────────────────────────────────────────

def test_create_note_no_ai(client, auth_headers, mocker):
    mocker.patch("app.api.routes.notes.analyze_note", return_value=None)
    resp = client.post("/api/v1/notes/", json=_NOTE, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == _NOTE["title"]
    assert data["content"] == _NOTE["content"]
    assert data["ai_category"] is None
    assert data["ai_summary"] is None


def test_create_note_with_ai_enrichment(client, auth_headers, mocker):
    mocker.patch("app.api.routes.notes.analyze_note", return_value={
        "category": "#work",
        "summary": "A work-related note.",
        "tasks": [],
    })
    resp = client.post("/api/v1/notes/", json=_NOTE, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["ai_category"] == "#work"
    assert data["ai_summary"] == "A work-related note."


def test_create_note_ai_tasks_auto_created(client, auth_headers, mocker):
    """AI-detected tasks must be saved to the DB automatically."""
    mocker.patch("app.api.routes.notes.analyze_note", return_value={
        "category": "#work",
        "summary": "Summary",
        "tasks": ["Buy milk", "Write report"],
    })
    note_resp = client.post("/api/v1/notes/", json=_NOTE, headers=auth_headers)
    note_id = note_resp.json()["id"]

    tasks_resp = client.get(f"/api/v1/notes/{note_id}/tasks/", headers=auth_headers)
    assert tasks_resp.status_code == 200
    task_texts = {t["task_text"] for t in tasks_resp.json()}
    assert task_texts == {"Buy milk", "Write report"}


def test_create_note_requires_auth(client):
    assert client.post("/api/v1/notes/", json=_NOTE).status_code == 401


def test_create_note_empty_title_rejected(client, auth_headers):
    resp = client.post("/api/v1/notes/", json={"title": "", "content": "x"}, headers=auth_headers)
    assert resp.status_code == 422


# ── List ──────────────────────────────────────────────────────────────────────

def test_list_notes(client, auth_headers, note):
    resp = client.get("/api/v1/notes/", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_list_notes_pagination(client, auth_headers, mocker):
    mocker.patch("app.api.routes.notes.analyze_note", return_value=None)
    for i in range(5):
        client.post("/api/v1/notes/", json={"title": f"Note {i}", "content": "x"}, headers=auth_headers)

    page1 = client.get("/api/v1/notes/?skip=0&limit=3", headers=auth_headers)
    assert page1.status_code == 200
    assert len(page1.json()) == 3

    page2 = client.get("/api/v1/notes/?skip=3&limit=3", headers=auth_headers)
    assert len(page2.json()) == 2


def test_list_notes_category_filter(client, auth_headers, mocker):
    mocker.patch("app.api.routes.notes.analyze_note", side_effect=[
        {"category": "#work",     "summary": "s", "tasks": []},
        {"category": "#personal", "summary": "s", "tasks": []},
    ])
    client.post("/api/v1/notes/", json={"title": "Work", "content": "w"}, headers=auth_headers)
    client.post("/api/v1/notes/", json={"title": "Personal", "content": "p"}, headers=auth_headers)

    resp = client.get("/api/v1/notes/?category=%23work", headers=auth_headers)
    assert resp.status_code == 200
    notes = resp.json()
    assert len(notes) == 1
    assert notes[0]["ai_category"] == "#work"


def test_list_notes_search_by_title(client, auth_headers, mocker):
    mocker.patch("app.api.routes.notes.analyze_note", return_value=None)
    client.post("/api/v1/notes/", json={"title": "Meeting agenda", "content": "Q1"}, headers=auth_headers)
    client.post("/api/v1/notes/", json={"title": "Shopping list", "content": "milk"}, headers=auth_headers)

    resp = client.get("/api/v1/notes/?search=meeting", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1
    assert resp.json()[0]["title"] == "Meeting agenda"


def test_list_notes_search_by_content(client, auth_headers, mocker):
    mocker.patch("app.api.routes.notes.analyze_note", return_value=None)
    client.post("/api/v1/notes/", json={"title": "Note A", "content": "quarterly review"}, headers=auth_headers)
    client.post("/api/v1/notes/", json={"title": "Note B", "content": "nothing special"}, headers=auth_headers)

    resp = client.get("/api/v1/notes/?search=quarterly", headers=auth_headers)
    assert len(resp.json()) == 1
    assert resp.json()[0]["title"] == "Note A"


# ── Get ───────────────────────────────────────────────────────────────────────

def test_get_note_with_tasks(client, auth_headers, note):
    resp = client.get(f"/api/v1/notes/{note['id']}", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == note["id"]
    assert "tasks" in data


def test_get_note_not_found(client, auth_headers):
    resp = client.get("/api/v1/notes/00000000-0000-0000-0000-000000000001", headers=auth_headers)
    assert resp.status_code == 404


# ── Update ────────────────────────────────────────────────────────────────────

def test_update_note_title(client, auth_headers, note):
    resp = client.patch(
        f"/api/v1/notes/{note['id']}",
        json={"title": "Updated title"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["title"] == "Updated title"
    assert resp.json()["content"] == _NOTE["content"]  # content unchanged


def test_update_note_not_found(client, auth_headers):
    resp = client.patch(
        "/api/v1/notes/00000000-0000-0000-0000-000000000001",
        json={"title": "x"},
        headers=auth_headers,
    )
    assert resp.status_code == 404


# ── Delete ────────────────────────────────────────────────────────────────────

def test_delete_note(client, auth_headers, note):
    resp = client.delete(f"/api/v1/notes/{note['id']}", headers=auth_headers)
    assert resp.status_code == 204
    assert client.get(f"/api/v1/notes/{note['id']}", headers=auth_headers).status_code == 404


def test_delete_note_not_found(client, auth_headers):
    resp = client.delete("/api/v1/notes/00000000-0000-0000-0000-000000000001", headers=auth_headers)
    assert resp.status_code == 404


# ── Re-analyze ────────────────────────────────────────────────────────────────

def test_analyze_returns_503_when_ai_unavailable(client, auth_headers, note, mocker):
    mocker.patch("app.api.routes.notes.analyze_note", return_value=None)
    resp = client.post(f"/api/v1/notes/{note['id']}/analyze", headers=auth_headers)
    assert resp.status_code == 503


def test_analyze_updates_category_and_appends_tasks(client, auth_headers, note, mocker):
    mocker.patch("app.api.routes.notes.analyze_note", return_value={
        "category": "#personal",
        "summary": "A personal reminder.",
        "tasks": ["Call mom"],
    })
    resp = client.post(f"/api/v1/notes/{note['id']}/analyze", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["ai_category"] == "#personal"
    assert data["ai_summary"] == "A personal reminder."
    assert any(t["task_text"] == "Call mom" for t in data["tasks"])


def test_analyze_deduplicates_tasks(client, auth_headers, note, mocker):
    """Re-analyzing should not create duplicate tasks."""
    mocker.patch("app.api.routes.notes.analyze_note", return_value={
        "category": "#work", "summary": "s", "tasks": ["Call mom"],
    })
    client.post(f"/api/v1/notes/{note['id']}/analyze", headers=auth_headers)
    # Run again with the same task
    mocker.patch("app.api.routes.notes.analyze_note", return_value={
        "category": "#work", "summary": "s", "tasks": ["Call mom"],
    })
    client.post(f"/api/v1/notes/{note['id']}/analyze", headers=auth_headers)

    tasks = client.get(f"/api/v1/notes/{note['id']}/tasks/", headers=auth_headers).json()
    assert len([t for t in tasks if t["task_text"] == "Call mom"]) == 1


# ── Isolation ─────────────────────────────────────────────────────────────────

def test_users_cannot_access_each_others_notes(client, mocker):
    """User B must receive 404 when accessing User A's note."""
    mocker.patch("app.api.routes.notes.analyze_note", return_value=None)

    client.post("/api/v1/auth/register", json={"username": "alice", "email": "a@a.com", "password": "pass12345"})
    client.post("/api/v1/auth/register", json={"username": "bob",   "email": "b@b.com", "password": "pass12345"})

    def _login(username):
        tok = client.post("/api/v1/auth/login", data={"username": username, "password": "pass12345"}).json()["access_token"]
        return {"Authorization": f"Bearer {tok}"}

    alice = _login("alice")
    bob   = _login("bob")

    note_id = client.post("/api/v1/notes/", json=_NOTE, headers=alice).json()["id"]
    assert client.get(f"/api/v1/notes/{note_id}", headers=bob).status_code == 404
    assert client.delete(f"/api/v1/notes/{note_id}", headers=bob).status_code == 404
