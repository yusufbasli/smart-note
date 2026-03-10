"""add user_id to tasks, make note_id nullable (standalone tasks)

Revision ID: b2c3d4e5f6a7
Revises: 8fecd155f176
Create Date: 2026-03-10

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, None] = "8fecd155f176"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add user_id as nullable first so existing rows are accepted
    op.add_column("tasks", sa.Column("user_id", sa.UUID(), nullable=True))

    # 2. Backfill user_id from the parent note
    op.execute(
        """
        UPDATE tasks
        SET user_id = notes.user_id
        FROM notes
        WHERE tasks.note_id = notes.id
        """
    )

    # 3. Enforce NOT NULL now that every row has a value
    op.alter_column("tasks", "user_id", nullable=False)

    # 4. Add FK + index
    op.create_foreign_key(
        "fk_tasks_user_id", "tasks", "users", ["user_id"], ["id"], ondelete="CASCADE"
    )
    op.create_index("ix_tasks_user_id", "tasks", ["user_id"])

    # 5. Make note_id nullable (standalone tasks have no note)
    op.alter_column("tasks", "note_id", existing_type=sa.UUID(), nullable=True)


def downgrade() -> None:
    # Remove standalone tasks that can't have a note_id restored
    op.execute("DELETE FROM tasks WHERE note_id IS NULL")
    op.alter_column("tasks", "note_id", existing_type=sa.UUID(), nullable=False)
    op.drop_index("ix_tasks_user_id", table_name="tasks")
    op.drop_constraint("fk_tasks_user_id", "tasks", type_="foreignkey")
    op.drop_column("tasks", "user_id")
