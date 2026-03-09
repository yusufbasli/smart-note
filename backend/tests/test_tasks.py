"""Tests for /notes/{id}/tasks/ CRUD."""

import pytest

_NOTE = {"title": "Task Test Note", "content": "Content for tasks."}


@pytest.fixture
def note(client, auth_headers, mocker):
    mocker.patch("app.api.routes.notes.analyze_note", return_value=None)
    resp = client.post("/api/v1/notes/", json=_NOTE, headers=auth_headers)
    assert resp.status_code == 201
    return resp.json()


@pytest.fixture
def task(client, auth_headers, note):
    resp = client.post(
        f"/api/v1/notes/{note['id']}/tasks/",
        json={"task_text": "Buy groceries"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    return resp.json()


# ── Create ────────────────────────────────────────────────────────────────────

def test_create_task(client, auth_headers, note):
    resp = client.post(
        f"/api/v1/notes/{note['id']}/tasks/",
        json={"task_text": "Buy groceries"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["task_text"] == "Buy groceries"
    assert data["is_completed"] is False
    assert data["note_id"] == note["id"]
    assert data["due_date"] is None


def test_create_task_with_due_date(client, auth_headers, note):
    resp = client.post(
        f"/api/v1/notes/{note['id']}/tasks/",
        json={"task_text": "Submit report", "due_date": "2026-03-09T12:00:00Z"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    assert resp.json()["due_date"] is not None


def test_create_task_on_nonexistent_note(client, auth_headers):
    resp = client.post(
        "/api/v1/notes/00000000-0000-0000-0000-000000000001/tasks/",
        json={"task_text": "Orphan task"},
        headers=auth_headers,
    )
    assert resp.status_code == 404


def test_create_task_empty_text_rejected(client, auth_headers, note):
    resp = client.post(
        f"/api/v1/notes/{note['id']}/tasks/",
        json={"task_text": ""},
        headers=auth_headers,
    )
    assert resp.status_code == 422


def test_create_task_requires_auth(client, note):
    resp = client.post(f"/api/v1/notes/{note['id']}/tasks/", json={"task_text": "x"})
    assert resp.status_code == 401


# ── List ──────────────────────────────────────────────────────────────────────

def test_list_tasks(client, auth_headers, note, task):
    resp = client.get(f"/api/v1/notes/{note['id']}/tasks/", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json()
    assert len(items) == 1
    assert items[0]["task_text"] == "Buy groceries"


def test_list_tasks_empty(client, auth_headers, note):
    resp = client.get(f"/api/v1/notes/{note['id']}/tasks/", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json() == []


# ── Update ────────────────────────────────────────────────────────────────────

def test_mark_task_completed(client, auth_headers, note, task):
    resp = client.patch(
        f"/api/v1/notes/{note['id']}/tasks/{task['id']}",
        json={"is_completed": True},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["is_completed"] is True


def test_update_task_text(client, auth_headers, note, task):
    resp = client.patch(
        f"/api/v1/notes/{note['id']}/tasks/{task['id']}",
        json={"task_text": "Buy organic groceries"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["task_text"] == "Buy organic groceries"
    assert resp.json()["is_completed"] is False  # unchanged


def test_update_task_not_found(client, auth_headers, note):
    resp = client.patch(
        f"/api/v1/notes/{note['id']}/tasks/00000000-0000-0000-0000-000000000001",
        json={"is_completed": True},
        headers=auth_headers,
    )
    assert resp.status_code == 404


# ── Delete ────────────────────────────────────────────────────────────────────

def test_delete_task(client, auth_headers, note, task):
    resp = client.delete(
        f"/api/v1/notes/{note['id']}/tasks/{task['id']}",
        headers=auth_headers,
    )
    assert resp.status_code == 204
    remaining = client.get(f"/api/v1/notes/{note['id']}/tasks/", headers=auth_headers).json()
    assert remaining == []


def test_delete_task_not_found(client, auth_headers, note):
    resp = client.delete(
        f"/api/v1/notes/{note['id']}/tasks/00000000-0000-0000-0000-000000000001",
        headers=auth_headers,
    )
    assert resp.status_code == 404


# ── Cascade ───────────────────────────────────────────────────────────────────

def test_tasks_deleted_with_note(client, auth_headers, note, task, mocker):
    """Deleting a note must cascade-delete its tasks."""
    mocker.patch("app.api.routes.notes.analyze_note", return_value=None)
    # Add a second note to confirm isolation
    other_note = client.post("/api/v1/notes/", json={"title": "Other", "content": "x"}, headers=auth_headers).json()

    client.delete(f"/api/v1/notes/{note['id']}", headers=auth_headers)

    # Other note is unaffected
    assert client.get(f"/api/v1/notes/{other_note['id']}", headers=auth_headers).status_code == 200
