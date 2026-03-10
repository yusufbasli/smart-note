"""add is_recurring and last_completed_date to tasks

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-03-10

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, None] = "b2c3d4e5f6a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "tasks",
        sa.Column("is_recurring", sa.Boolean(), nullable=False, server_default="false"),
    )
    op.add_column(
        "tasks",
        sa.Column("last_completed_date", sa.Date(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("tasks", "last_completed_date")
    op.drop_column("tasks", "is_recurring")
