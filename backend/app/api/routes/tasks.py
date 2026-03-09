import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Note, Task, User
from app.schemas import TaskCreate, TaskRead, TaskUpdate

router = APIRouter(prefix="/notes/{note_id}/tasks", tags=["Tasks"])


def _get_note_or_404(note_id: uuid.UUID, user_id: uuid.UUID, db: Session) -> Note:
    note: Note | None = db.get(Note, note_id)
    if note is None or note.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found.")
    return note


def _get_task_or_404(task_id: uuid.UUID, note_id: uuid.UUID, db: Session) -> Task:
    task: Task | None = db.get(Task, task_id)
    if task is None or task.note_id != note_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")
    return task


# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/",
    response_model=TaskRead,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new task to a note",
)
def create_task(
    note_id: uuid.UUID,
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Task:
    _get_note_or_404(note_id, current_user.id, db)
    task = Task(note_id=note_id, task_text=payload.task_text, due_date=payload.due_date)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get(
    "/",
    response_model=list[TaskRead],
    summary="Get the task list for a note",
)
def list_tasks(
    note_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Task]:
    _get_note_or_404(note_id, current_user.id, db)
    return (
        db.query(Task)
        .filter(Task.note_id == note_id)
        .order_by(Task.created_at.asc())
        .all()
    )


@router.patch(
    "/{task_id}",
    response_model=TaskRead,
    summary="Update a task (including marking as completed)",
)
def update_task(
    note_id: uuid.UUID,
    task_id: uuid.UUID,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Task:
    _get_note_or_404(note_id, current_user.id, db)
    task = _get_task_or_404(task_id, note_id, db)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a task",
)
def delete_task(
    note_id: uuid.UUID,
    task_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    _get_note_or_404(note_id, current_user.id, db)
    task = _get_task_or_404(task_id, note_id, db)
    db.delete(task)
    db.commit()
