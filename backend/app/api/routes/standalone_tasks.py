"""Standalone task endpoints â€” tasks that may or may not be linked to a note.

GET  /tasks/              list tasks (filtered by period + completed status)
POST /tasks/              create standalone task
PATCH /tasks/{task_id}    update task (text / completed / due_date / is_recurring)
DELETE /tasks/{task_id}   delete task
"""
import uuid
from datetime import datetime, timedelta, timezone, date
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Task, User
from app.schemas import TaskCreate, TaskRead, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["Tasks"])

Period = Literal["today", "tomorrow", "week", "all"]


def _date_range(period: Period):
    """Return (start, end) UTC datetimes for the given period, or (None, None) for 'all'."""
    now = datetime.now(timezone.utc)
    today = now.date()

    if period == "today":
        start = datetime(today.year, today.month, today.day, tzinfo=timezone.utc)
        return start, start + timedelta(days=1)

    if period == "tomorrow":
        tomorrow = today + timedelta(days=1)
        start = datetime(tomorrow.year, tomorrow.month, tomorrow.day, tzinfo=timezone.utc)
        return start, start + timedelta(days=1)

    if period == "week":
        start = datetime(today.year, today.month, today.day, tzinfo=timezone.utc)
        return start, start + timedelta(days=7)

    return None, None  # "all"


def _get_task_or_404(task_id: uuid.UUID, user_id: uuid.UUID, db: Session) -> Task:
    task: Task | None = db.get(Task, task_id)
    if task is None or task.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")
    return task


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€


@router.get(
    "/",
    response_model=list[TaskRead],
    summary="List tasks filtered by period (recurring tasks always included)",
)
def list_tasks(
    period: Period = Query(default="today", description="Date range filter"),
    include_completed: bool = Query(default=True, description="Also return completed tasks"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Task]:
    base = db.query(Task).filter(Task.user_id == current_user.id)

    if not include_completed:
        base = base.filter(Task.is_completed == False)  # noqa: E712

    start, end = _date_range(period)

    if start is not None:
        # Period-specific tasks OR recurring tasks (always shown)
        from sqlalchemy import or_
        date_filter = (Task.due_date >= start) & (Task.due_date < end)
        base = base.filter(or_(date_filter, Task.is_recurring == True))  # noqa: E712
    # else: "all" â€” no date filter

    return (
        base
        .order_by(Task.is_recurring.desc(), Task.is_completed.asc(), Task.due_date.asc().nullslast(), Task.created_at.asc())
        .all()
    )


@router.post(
    "/",
    response_model=TaskRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a standalone task (not linked to any note)",
)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Task:
    task = Task(
        user_id=current_user.id,
        task_text=payload.task_text.strip(),
        due_date=payload.due_date,
        is_recurring=payload.is_recurring,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch(
    "/{task_id}",
    response_model=TaskRead,
    summary="Update a task (text / completed / due_date / is_recurring)",
)
def update_task(
    task_id: uuid.UUID,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Task:
    task = _get_task_or_404(task_id, current_user.id, db)
    if payload.task_text is not None:
        task.task_text = payload.task_text.strip()
    if payload.is_recurring is not None:
        task.is_recurring = payload.is_recurring
    if payload.due_date is not None:
        task.due_date = payload.due_date
    if payload.is_completed is not None:
        task.is_completed = payload.is_completed
        # For recurring tasks: track the last date it was completed so the
        # frontend can reset the display each new day.
        if task.is_recurring:
            task.last_completed_date = date.today() if payload.is_completed else None
    db.commit()
    db.refresh(task)
    return task


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a task",
)
def delete_task(
    task_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    task = _get_task_or_404(task_id, current_user.id, db)
    db.delete(task)
    db.commit()

