from __future__ import annotations

from ...database.interface import DatabaseInterface
from ...schemas.blog_schema import BlogPublic
from ...schemas.project_schema import ProjectPublic
from ...schemas.work_schema import (
    WorkFeaturedResponse,
    WorkItemBlog,
    WorkItemProject,
    WorkListParams,
    WorkListResponse,
    WorkSummaryResponse,
)


class WorksFunction:
    """Unified work feed (blogs + projects)."""

    def __init__(self, db: DatabaseInterface) -> None:
        self._db = db

    def list_work(self, params: WorkListParams) -> WorkListResponse:
        rows, total = self._db.list_work(
            page=params.page, per_page=params.per_page
        )
        items: list[WorkItemBlog | WorkItemProject] = []
        for row in rows:
            if row.get("type") == "blog":
                items.append(
                    WorkItemBlog(item=BlogPublic.model_validate(row["item"]))
                )
            else:
                items.append(
                    WorkItemProject(item=ProjectPublic.model_validate(row["item"]))
                )
        return WorkListResponse(
            items=items,
            page=params.page,
            per_page=params.per_page,
            total=total,
        )

    def get_work_summary(self) -> WorkSummaryResponse:
        return WorkSummaryResponse.model_validate(self._db.get_work_summary())

    def list_work_featured(self) -> WorkFeaturedResponse:
        rows = self._db.list_work_featured()
        items: list[WorkItemBlog | WorkItemProject] = []
        for row in rows:
            if row.get("type") == "blog":
                items.append(
                    WorkItemBlog(item=BlogPublic.model_validate(row["item"]))
                )
            else:
                items.append(
                    WorkItemProject(item=ProjectPublic.model_validate(row["item"]))
                )
        return WorkFeaturedResponse(items=items)
