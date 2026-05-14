from __future__ import annotations

from datetime import datetime, timezone

from pymongo.errors import DuplicateKeyError

from ...database.interface import DatabaseInterface
from ...exceptions import ProjectConflictError, ProjectNotFoundError
from ...filedisk import FileDiskInterface
from ...filedisk.utils import persist_project_markdown
from ...schemas import (
    MarkdownSaveResponse,
    MarkdownWriteBody,
    ProjectCreate,
    ProjectCreateResponse,
    ProjectDeleteResponse,
    ProjectListParams,
    ProjectListResponse,
    ProjectPublic,
    ProjectUpdateResponse,
)


class ProjectsFunction:
    """Project use-cases (list, read, create, replace, delete, markdown file)."""

    def __init__(self, db: DatabaseInterface, file_disk: FileDiskInterface) -> None:
        self._db = db
        self._file_disk = file_disk

    def list_projects(self, params: ProjectListParams) -> ProjectListResponse:
        projects, total = self._db.list_projects(
            page=params.page, per_page=params.per_page
        )
        return ProjectListResponse(
            projects=[ProjectPublic.model_validate(p) for p in projects],
            page=params.page,
            per_page=params.per_page,
            total=total,
        )

    def get_project_by_slug(self, slug: str) -> ProjectPublic:
        row = self._db.get_project_by_slug(slug)
        if row is None:
            raise ProjectNotFoundError("Project not found")
        return ProjectPublic.model_validate(row)

    def create_project(self, request: ProjectCreate) -> ProjectCreateResponse:
        if self._db.get_project(request.id) is not None:
            raise ProjectConflictError("A project with this id already exists")
        if self._db.get_project_by_slug(request.slug) is not None:
            raise ProjectConflictError("A project with this slug already exists")
        data = request.to_project_kwargs()
        if request.body_markdown is not None:
            data["filepath_md"] = persist_project_markdown(
                self._file_disk,
                filepath_md=data["filepath_md"],
                slug=request.slug,
                body_markdown=request.body_markdown,
            )
        try:
            self._db.insert_project(data)
        except DuplicateKeyError as e:
            raise ProjectConflictError(
                "A project with this id or slug already exists"
            ) from e
        return ProjectCreateResponse(
            details="Project added successfully.",
            project=ProjectPublic.model_validate(data),
        )

    def update_project(
        self, slug: str, request: ProjectCreate
    ) -> ProjectUpdateResponse:
        if self._db.get_project_by_slug(slug) is None:
            raise ProjectNotFoundError("Project not found")
        data = request.to_project_kwargs()
        if request.body_markdown is not None:
            data["filepath_md"] = persist_project_markdown(
                self._file_disk,
                filepath_md=data["filepath_md"],
                slug=request.slug,
                body_markdown=request.body_markdown,
            )
        try:
            updated = self._db.update_project_by_slug(slug, data)
        except DuplicateKeyError as e:
            raise ProjectConflictError(
                "Update conflicts with an existing id or slug"
            ) from e
        if updated is None:
            raise ProjectNotFoundError("Project not found")
        return ProjectUpdateResponse(
            details="Project updated successfully.",
            project=ProjectPublic.model_validate(updated),
        )

    def save_project_markdown(
        self, slug: str, body: MarkdownWriteBody
    ) -> MarkdownSaveResponse:
        row = self._db.get_project_by_slug(slug)
        if row is None:
            raise ProjectNotFoundError("Project not found")
        filepath = persist_project_markdown(
            self._file_disk,
            filepath_md=row["filepath_md"],
            slug=slug,
            body_markdown=body.content,
        )
        now = datetime.now(timezone.utc)
        updated = self._db.update_project_by_slug(
            slug, {"filepath_md": filepath, "updated_on": now}
        )
        if updated is None:
            raise ProjectNotFoundError("Project not found")
        return MarkdownSaveResponse(
            details="Project markdown saved.",
            slug=slug,
            filepath_md=filepath,
        )

    def delete_project(self, slug: str) -> ProjectDeleteResponse:
        if not self._db.delete_project_by_slug(slug):
            raise ProjectNotFoundError("Project not found")
        return ProjectDeleteResponse(
            details="Project deleted successfully.",
            slug=slug,
        )
