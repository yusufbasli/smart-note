"""Tests for POST /auth/register, POST /auth/login, GET /auth/me."""


def test_register_success(client):
    resp = client.post("/api/v1/auth/register", json={
        "username": "alice",
        "email": "alice@example.com",
        "password": "securepass1",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["username"] == "alice"
    assert data["email"] == "alice@example.com"
    assert "id" in data
    assert "hashed_password" not in data   # must never be exposed


def test_register_duplicate_username(client):
    payload = {"username": "alice", "email": "alice@example.com", "password": "pass12345"}
    client.post("/api/v1/auth/register", json=payload)
    resp = client.post("/api/v1/auth/register", json={**payload, "email": "other@example.com"})
    assert resp.status_code == 409


def test_register_duplicate_email(client):
    payload = {"username": "alice", "email": "alice@example.com", "password": "pass12345"}
    client.post("/api/v1/auth/register", json=payload)
    resp = client.post("/api/v1/auth/register", json={**payload, "username": "alice2"})
    assert resp.status_code == 409


def test_register_invalid_username_space(client):
    resp = client.post("/api/v1/auth/register", json={
        "username": "a b",        # spaces not allowed
        "email": "x@x.com",
        "password": "pass12345",
    })
    assert resp.status_code == 422


def test_register_short_password(client):
    resp = client.post("/api/v1/auth/register", json={
        "username": "alice",
        "email": "a@a.com",
        "password": "short",      # < 8 chars
    })
    assert resp.status_code == 422


def test_register_invalid_email(client):
    resp = client.post("/api/v1/auth/register", json={
        "username": "alice",
        "email": "not-an-email",
        "password": "pass12345",
    })
    assert resp.status_code == 422


# ── Login ─────────────────────────────────────────────────────────────────────

def test_login_with_username(client, registered_user):
    resp = client.post("/api/v1/auth/login", data={
        "username": "testuser",
        "password": "testpass123",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_with_email(client, registered_user):
    """The login endpoint accepts email in the username field."""
    resp = client.post("/api/v1/auth/login", data={
        "username": "test@example.com",
        "password": "testpass123",
    })
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_wrong_password(client, registered_user):
    resp = client.post("/api/v1/auth/login", data={
        "username": "testuser",
        "password": "wrongpassword",
    })
    assert resp.status_code == 401


def test_login_nonexistent_user(client):
    resp = client.post("/api/v1/auth/login", data={
        "username": "nobody",
        "password": "testpass123",
    })
    assert resp.status_code == 401


# ── /me ───────────────────────────────────────────────────────────────────────

def test_get_me_success(client, auth_headers, registered_user):
    resp = client.get("/api/v1/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert "hashed_password" not in data


def test_get_me_no_token(client):
    assert client.get("/api/v1/auth/me").status_code == 401


def test_get_me_invalid_token(client):
    resp = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer badtoken"})
    assert resp.status_code == 401
