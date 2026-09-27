"""NEXUS Project model — workspace registration and configuration.

Per Domain Architecture (Backend Architecture §10):
Project is the top-level entity representing a registered codebase workspace.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from nexus.models.base import Base, PrefixedIdMixin, TimestampMixin, _generate_prefixed_id

if TYPE_CHECKING:
    from nexus.models.task import Task


class Project(PrefixedIdMixin, TimestampMixin, Base):
    """A registered project workspace.

    Represents a local codebase that NEXUS can analyze and modify.
    """

    __tablename__ = "projects"

    # Display name for the project
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    # Absolute filesystem path to the project root directory
    root_path: Mapped[str] = mapped_column(String(1024), nullable=False, unique=True)

    # Optional description
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)

    # Project status: active, archived, error
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False)

    # Detected primary language (e.g., "python", "typescript")
    language: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Detected framework (e.g., "fastapi", "next.js")
    framework: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Relationships
    tasks: Mapped[list[Task]] = relationship(
        "Task",
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __init__(self, **kwargs: object) -> None:
        if "id" not in kwargs:
            kwargs["id"] = _generate_prefixed_id("prj")
        super().__init__(**kwargs)

    def __repr__(self) -> str:
        return f"<Project id={self.id!r} name={self.name!r}>"
