from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func as sa_func
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Note, Task, User
from app.schemas import TaskRead

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "/tasks/today",
    response_model=list[TaskRead],
    summary="Get all incomplete tasks due today for the current user",
)
def get_tasks_today(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    target_date: date = Query(
        default=None,
        description="ISO date (YYYY-MM-DD).  Defaults to today in UTC.",
    ),
) -> list[Task]:
    """
    Returns every incomplete task (is_completed=False) whose due_date falls on
    the requested day.  Tasks with no due_date are excluded.
    """
    # Use UTC date; SQLite stores datetimes as naive (no tzinfo) so comparisons
    # must also use naive UTC datetimes to avoid TypeError.
    utc_now = datetime.now(timezone.utc)
    day = target_date or utc_now.date()
    day_start = datetime(day.year, day.month, day.day, 0, 0, 0)
    day_end = datetime(day.year, day.month, day.day, 23, 59, 59, 999999)

    return (
        db.query(Task)
        .join(Note, Task.note_id == Note.id)
        .filter(
            Note.user_id == current_user.id,
            Task.is_completed == False,  # noqa: E712
            Task.due_date >= day_start,
            Task.due_date <= day_end,
        )
        .order_by(Task.due_date.asc())
        .all()
    )


@router.get(
    "/summary",
    summary="Count notes by AI category for the current user",
)
def get_category_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Returns {category: count} aggregated from ai_category values.
    Uncategorised notes are grouped under 'uncategorised'.
    """
    rows = (
        db.query(Note.ai_category, sa_func.count(Note.id))
        .filter(Note.user_id == current_user.id)
        .group_by(Note.ai_category)
        .all()
    )
    return {(cat or "uncategorised"): count for cat, count in rows}
