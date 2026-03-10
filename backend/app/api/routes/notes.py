import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.limiter import limiter
from app.models import Note, Task, User
from app.schemas import NoteCreate, NoteRead, NoteReadWithTasks, NoteUpdate
from app.services.ai_service import analyze_note

router = APIRouter(prefix="/notes", tags=["Notes"])


def _get_note_or_404(note_id: uuid.UUID, user_id: uuid.UUID, db: Session) -> Note:
    """Validates that the note exists and belongs to the authenticated user."""
    note: Note | None = db.get(Note, note_id)
    if note is None or note.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found.")
    return note


# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/",
    response_model=NoteRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new note (with AI analysis)",
)
def create_note(
    payload: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Note:
    """
    The note is saved; then the AI service adds a category and summary.
    The AI service is in draft phase so it does not raise errors — returns None on failure.
    """
    note = Note(
        user_id=current_user.id,
        title=payload.title,
        content=payload.content,
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    # AI analysis — errors are suppressed; note is already safely saved
    try:
        ai_result = analyze_note(note.content)
        if ai_result:
            note.ai_category = ai_result.get("category")
            note.ai_summary = ai_result.get("summary")
            # Auto-create tasks detected by the AI
            for task_text in ai_result.get("tasks", []):
                if task_text and task_text.strip():
                    db.add(Task(note_id=note.id, user_id=current_user.id, task_text=task_text.strip()))
            db.commit()
            db.refresh(note)
    except Exception:
        pass  # AI error is non-critical; note was already saved

    return note


@router.get(
    "/",
    response_model=list[NoteRead],
    summary="List all notes for the current user",
)
def list_notes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    category: str | None = Query(default=None, description="Filter by AI category (e.g. #work)"),
    search: str | None = Query(default=None, max_length=200, description="Full-text search in title and content"),
    skip: int = Query(default=0, ge=0, description="Pagination offset"),
    limit: int = Query(default=20, ge=1, le=100, description="Pagination page size"),
) -> list[Note]:
    q = db.query(Note).filter(Note.user_id == current_user.id)
    if category:
        q = q.filter(Note.ai_category == category)
    if search:
        term = f"%{search}%"
        q = q.filter((Note.title.ilike(term)) | (Note.content.ilike(term)))
    return q.order_by(Note.created_at.desc()).offset(skip).limit(limit).all()


@router.get(
    "/{note_id}",
    response_model=NoteReadWithTasks,
    summary="Get a specific note with its task list",
)
def get_note(
    note_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Note:
    return _get_note_or_404(note_id, current_user.id, db)


@router.patch(
    "/{note_id}",
    response_model=NoteRead,
    summary="Update a note",
)
def update_note(
    note_id: uuid.UUID,
    payload: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Note:
    note = _get_note_or_404(note_id, current_user.id, db)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(note, field, value)
    db.commit()
    db.refresh(note)
    return note


@router.delete(
    "/{note_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a note (cascade deletes its tasks)",
)
def delete_note(
    note_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    note = _get_note_or_404(note_id, current_user.id, db)
    db.delete(note)
    db.commit()


@router.post(
    "/{note_id}/analyze",
    response_model=NoteReadWithTasks,
    summary="Re-run AI analysis on an existing note",
)
@limiter.limit("10/hour")
def analyze_existing_note(
    request: Request,
    note_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Note:
    """
    Triggers AI analysis on the note's current content, overwriting any previous
    ai_category / ai_summary and appending newly detected tasks (deduplication by
    exact text match against existing tasks).
    """
    note = _get_note_or_404(note_id, current_user.id, db)

    ai_result = analyze_note(note.content)
    if ai_result is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is unavailable. Check OPENAI_API_KEY configuration.",
        )

    note.ai_category = ai_result.get("category")
    note.ai_summary = ai_result.get("summary")

    # Append tasks not already present (exact-text comparison)
    existing_texts = {t.task_text for t in note.tasks}
    for task_text in ai_result.get("tasks", []):
        task_text = task_text.strip()
        if task_text and task_text not in existing_texts:
            db.add(Task(note_id=note.id, task_text=task_text))
            existing_texts.add(task_text)

    db.commit()
    db.refresh(note)
    return note
