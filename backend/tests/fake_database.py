"""In-memory ``DatabaseInterface`` for API tests (no MongoDB)."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from src.database.interface import DatabaseInterface


def _to_jsonable(doc: dict[str, Any]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for k, v in doc.items():
        if isinstance(v, datetime):
            out[k] = v.isoformat()
        else:
            out[k] = v
    return out


class FakePortfolioDatabase(DatabaseInterface):
    """Minimal blog + project storage for tests."""

    def __init__(self) -> None:
        self._blog_rows: list[dict[str, Any]] = []
        self._project_rows: list[dict[str, Any]] = []
        self._message_rows: list[dict[str, Any]] = []
        self._subscriber_rows: list[dict[str, Any]] = []

    def close(self) -> None:
        pass

    def ensure_initialized(self) -> None:
        pass

    def get_blog(self, blog_id: str) -> Optional[dict[str, Any]]:
        for r in self._blog_rows:
            if r["id"] == blog_id:
                return _to_jsonable(r)
        return None

    def get_blog_by_slug(self, slug: str) -> Optional[dict[str, Any]]:
        for r in self._blog_rows:
            if r["slug"] == slug:
                return _to_jsonable(r)
        return None

    def insert_blog(self, blog: dict[str, Any]) -> None:
        self._blog_rows.append(dict(blog))

    def update_blog_by_slug(
        self, slug: str, data: dict[str, Any]
    ) -> Optional[dict[str, Any]]:
        for i, r in enumerate(self._blog_rows):
            if r["slug"] != slug:
                continue
            merged = {**r, **data}
            merged["id"] = r["id"]
            self._blog_rows[i] = merged
            return _to_jsonable(merged)
        return None

    def delete_blog_by_slug(self, slug: str) -> bool:
        for i, r in enumerate(self._blog_rows):
            if r["slug"] == slug:
                del self._blog_rows[i]
                return True
        return False

    def list_blogs(
        self, page: int = 1, per_page: int = 10
    ) -> tuple[list[dict[str, Any]], int]:
        sorted_rows = sorted(
            self._blog_rows,
            key=lambda x: x["created_on"],
            reverse=True,
        )
        total = len(sorted_rows)
        start = (page - 1) * per_page
        chunk = sorted_rows[start : start + per_page]
        return [_to_jsonable(r) for r in chunk], total

    def get_project(self, project_id: str) -> Optional[dict[str, Any]]:
        for r in self._project_rows:
            if r["id"] == project_id:
                return _to_jsonable(r)
        return None

    def get_project_by_slug(self, slug: str) -> Optional[dict[str, Any]]:
        for r in self._project_rows:
            if r["slug"] == slug:
                return _to_jsonable(r)
        return None

    def insert_project(self, project: dict[str, Any]) -> None:
        self._project_rows.append(dict(project))

    def insert_message(self, message: dict[str, Any]) -> None:
        self._message_rows.append(dict(message))

    def insert_subscriber(self, subscriber: dict[str, Any]) -> None:
        self._subscriber_rows.append(dict(subscriber))

    def update_project_by_slug(
        self, slug: str, data: dict[str, Any]
    ) -> Optional[dict[str, Any]]:
        for i, r in enumerate(self._project_rows):
            if r["slug"] != slug:
                continue
            merged = {**r, **data}
            merged["id"] = r["id"]
            self._project_rows[i] = merged
            return _to_jsonable(merged)
        return None

    def delete_project_by_slug(self, slug: str) -> bool:
        for i, r in enumerate(self._project_rows):
            if r["slug"] == slug:
                del self._project_rows[i]
                return True
        return False

    def list_projects(
        self, page: int = 1, per_page: int = 10
    ) -> tuple[list[dict[str, Any]], int]:
        sorted_rows = sorted(
            self._project_rows,
            key=lambda x: x["created_on"],
            reverse=True,
        )
        total = len(sorted_rows)
        start = (page - 1) * per_page
        chunk = sorted_rows[start : start + per_page]
        return [_to_jsonable(r) for r in chunk], total

    def list_work(
        self, page: int = 1, per_page: int = 10
    ) -> tuple[list[dict[str, Any]], int]:
        combined: list[tuple[str, dict[str, Any]]] = [
            ("blog", dict(r)) for r in self._blog_rows
        ] + [("project", dict(r)) for r in self._project_rows]
        combined.sort(key=lambda x: x[1]["created_on"], reverse=True)
        total = len(combined)
        start = (page - 1) * per_page
        chunk = combined[start : start + per_page]
        items: list[dict[str, Any]] = []
        for kind, raw in chunk:
            items.append({"type": kind, "item": _to_jsonable(raw)})
        return items, total

    def list_work_featured(self) -> list[dict[str, Any]]:
        combined: list[tuple[str, dict[str, Any]]] = [
            ("blog", dict(r))
            for r in self._blog_rows
            if r.get("feature") is True and r.get("feat_order") is not None
        ] + [
            ("project", dict(r))
            for r in self._project_rows
            if r.get("feature") is True and r.get("feat_order") is not None
        ]
        combined.sort(
            key=lambda x: (x[1]["feat_order"], -x[1]["created_on"].timestamp()),
        )
        return [
            {"type": kind, "item": _to_jsonable(raw)}
            for kind, raw in combined[:3]
        ]

    def get_work_summary(self) -> dict[str, int]:
        image_urls = {
            r.get("header_img_url")
            for r in [*self._blog_rows, *self._project_rows]
            if r.get("header_img_url")
        }
        return {
            "projects": len(self._project_rows),
            "blogs": len(self._blog_rows),
            "subscribers": len(self._subscriber_rows),
            "images": len(image_urls),
            "messages": len(self._message_rows),
        }

    def list_messages(
        self, page: int = 1, per_page: int = 10
    ) -> tuple[list[dict[str, Any]], int]:
        sorted_rows = sorted(
            self._message_rows,
            key=lambda x: x["created_on"],
            reverse=True,
        )
        total = len(sorted_rows)
        start = (page - 1) * per_page
        chunk = sorted_rows[start : start + per_page]
        return [_to_jsonable(r) for r in chunk], total

    def delete_message_by_id(self, message_id: str) -> bool:
        for i, r in enumerate(self._message_rows):
            if r["id"] == message_id:
                del self._message_rows[i]
                return True
        return False

    def get_subscriber_by_email(self, email: str) -> Optional[dict[str, Any]]:
        for r in self._subscriber_rows:
            if r["email"] == email:
                return _to_jsonable(r)
        return None

    def delete_subscriber_by_id(self, subscriber_id: str) -> bool:
        for i, r in enumerate(self._subscriber_rows):
            if r["id"] == subscriber_id:
                del self._subscriber_rows[i]
                return True
        return False

    def list_subscribers(
        self, page: int = 1, per_page: int = 10
    ) -> tuple[list[dict[str, Any]], int]:
        sorted_rows = sorted(
            self._subscriber_rows,
            key=lambda x: x["created_on"],
            reverse=True,
        )
        total = len(sorted_rows)
        start = (page - 1) * per_page
        chunk = sorted_rows[start : start + per_page]
        return [_to_jsonable(r) for r in chunk], total
