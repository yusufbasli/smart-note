import uuid
from datetime import datetime, date

from pydantic import BaseModel, EmailStr, Field, field_validator

_VALID_CATEGORIES = {"#work", "#school", "#personal", "#health", "#finance", "#other"}


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
    content: str = Field(..., min_length=1, max_length=50_000)
    ai_category: str | None = None

    @field_validator("ai_category")
    @classmethod
    def validate_category(cls, v: str | None) -> str | None:
        if v is not None and v not in _VALID_CATEGORIES:
            raise ValueError(f"Category must be one of: {', '.join(sorted(_VALID_CATEGORIES))}")
        return v


class NoteUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    content: str | None = Field(default=None, min_length=1, max_length=50_000)
    ai_category: str | None = None

    @field_validator("ai_category")
    @classmethod
    def validate_category(cls, v: str | None) -> str | None:
        if v is not None and v not in _VALID_CATEGORIES:
            raise ValueError(f"Category must be one of: {', '.join(sorted(_VALID_CATEGORIES))}")
        return v


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
    is_recurring: bool = False


class TaskUpdate(BaseModel):
    task_text: str | None = Field(default=None, min_length=1, max_length=500)
    is_completed: bool | None = None
    due_date: datetime | None = None
    is_recurring: bool | None = None


class TaskRead(BaseModel):
    id: uuid.UUID
    note_id: uuid.UUID | None  # None for standalone tasks
    task_text: str
    is_completed: bool
    is_recurring: bool
    due_date: datetime | None
    last_completed_date: date | None
    created_at: datetime

    model_config = {"from_attributes": True}


# Forward ref güncelle
NoteReadWithTasks.model_rebuild()
