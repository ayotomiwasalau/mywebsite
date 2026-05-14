from __future__ import annotations

from datetime import datetime, timezone

from pymongo.errors import DuplicateKeyError

from ...database.interface import DatabaseInterface
from ...exceptions import BlogConflictError, BlogNotFoundError
from ...filedisk import FileDiskInterface
from ...filedisk.utils import persist_blog_markdown
from ...schemas import (
    BlogCreate,
    BlogCreateResponse,
    BlogDeleteResponse,
    BlogListParams,
    BlogListResponse,
    BlogPublic,
    BlogUpdateResponse,
    MarkdownSaveResponse,
    MarkdownWriteBody,
)


class BlogsFunction:
    """Blog use-cases (list, read, create, replace, delete, markdown file)."""

    def __init__(self, db: DatabaseInterface, file_disk: FileDiskInterface) -> None:
        self._db = db
        self._file_disk = file_disk

    def list_blogs(self, params: BlogListParams) -> BlogListResponse:
        blogs, total = self._db.list_blogs(
            page=params.page, per_page=params.per_page
        )
        return BlogListResponse(
            blogs=[BlogPublic.model_validate(b) for b in blogs],
            page=params.page,
            per_page=params.per_page,
            total=total,
        )

    def get_blog_by_slug(self, slug: str) -> BlogPublic:
        row = self._db.get_blog_by_slug(slug)
        if row is None:
            raise BlogNotFoundError("Blog not found")
        return BlogPublic.model_validate(row)

    def create_blog(self, request: BlogCreate) -> BlogCreateResponse:
        if self._db.get_blog(request.id) is not None:
            raise BlogConflictError("A blog with this id already exists")
        if self._db.get_blog_by_slug(request.slug) is not None:
            raise BlogConflictError("A blog with this slug already exists")
        data = request.to_blog_kwargs()
        if request.body_markdown is not None:
            data["filepath_md"] = persist_blog_markdown(
                self._file_disk,
                filepath_md=data["filepath_md"],
                slug=request.slug,
                body_markdown=request.body_markdown,
            )
        try:
            self._db.insert_blog(data)
        except DuplicateKeyError as e:
            raise BlogConflictError(
                "A blog with this id or slug already exists"
            ) from e
        return BlogCreateResponse(
            details="Blog added successfully.",
            blog=BlogPublic.model_validate(data),
        )

    def update_blog(self, slug: str, request: BlogCreate) -> BlogUpdateResponse:
        if self._db.get_blog_by_slug(slug) is None:
            raise BlogNotFoundError("Blog not found")
        data = request.to_blog_kwargs()
        if request.body_markdown is not None:
            data["filepath_md"] = persist_blog_markdown(
                self._file_disk,
                filepath_md=data["filepath_md"],
                slug=request.slug,
                body_markdown=request.body_markdown,
            )
        try:
            updated = self._db.update_blog_by_slug(slug, data)
        except DuplicateKeyError as e:
            raise BlogConflictError(
                "Update conflicts with an existing id or slug"
            ) from e
        if updated is None:
            raise BlogNotFoundError("Blog not found")
        return BlogUpdateResponse(
            details="Blog updated successfully.",
            blog=BlogPublic.model_validate(updated),
        )

    def save_blog_markdown(self, slug: str, body: MarkdownWriteBody) -> MarkdownSaveResponse:
        row = self._db.get_blog_by_slug(slug)
        if row is None:
            raise BlogNotFoundError("Blog not found")
        filepath = persist_blog_markdown(
            self._file_disk,
            filepath_md=row["filepath_md"],
            slug=slug,
            body_markdown=body.content,
        )
        now = datetime.now(timezone.utc)
        updated = self._db.update_blog_by_slug(
            slug, {"filepath_md": filepath, "updated_on": now}
        )
        if updated is None:
            raise BlogNotFoundError("Blog not found")
        return MarkdownSaveResponse(
            details="Blog markdown saved.",
            slug=slug,
            filepath_md=filepath,
        )

    def delete_blog(self, slug: str) -> BlogDeleteResponse:
        if not self._db.delete_blog_by_slug(slug):
            raise BlogNotFoundError("Blog not found")
        return BlogDeleteResponse(
            details="Blog deleted successfully.",
            slug=slug,
        )
