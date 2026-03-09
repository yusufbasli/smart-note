import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


# ─────────────────────────────────────────────────────────────────────────────
# USER SCHEMAS
# ─────────────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class UserRead(BaseModel):
    id: uuid.UUID
    username: str
    email: EmailStr
    created_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────────────────────────────────────
# AUTH SCHEMAS
# ─────────────────────────────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: uuid.UUID | None = None


# ─────────────────────────────────────────────────────────────────────────────
# NOTE SCHEMAS
# ─────────────────────────────────────────────────────────────────────────────

class NoteCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)


class NoteUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    content: str | None = Field(default=None, min_length=1)


class NoteRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    content: str
    ai_category: str | None
    ai_summary: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class NoteReadWithTasks(NoteRead):
    tasks: list["TaskRead"] = []


# ─────────────────────────────────────────────────────────────────────────────
# TASK SCHEMAS
# ─────────────────────────────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    task_text: str = Field(..., min_length=1, max_length=500)
    due_date: datetime | None = None


class TaskUpdate(BaseModel):
    task_text: str | None = Field(default=None, min_length=1, max_length=500)
    is_completed: bool | None = None
    due_date: datetime | None = None


class TaskRead(BaseModel):
    id: uuid.UUID
    note_id: uuid.UUID
    task_text: str
    is_completed: bool
    due_date: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


# Forward ref güncelle
NoteReadWithTasks.model_rebuild()
