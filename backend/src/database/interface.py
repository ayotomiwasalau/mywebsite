from abc import ABC, abstractmethod
from typing import Any, Optional


class DatabaseInterface(ABC):
    """Contract for blog/project storage (MongoDB)."""

    @abstractmethod
    def close(self) -> None:
        ...

    @abstractmethod
    def get_blog(self, blog_id: str) -> Optional[dict[str, Any]]:
        ...

    @abstractmethod
    def get_blog_by_slug(self, slug: str) -> Optional[dict[str, Any]]:
        ...

    @abstractmethod
    def update_blog_by_slug(
        self, slug: str, data: dict[str, Any]
    ) -> Optional[dict[str, Any]]:
        """Replace blog fields for the row matching ``slug``; preserve ``id``. Returns JSON dict or None."""

    @abstractmethod
    def delete_blog_by_slug(self, slug: str) -> bool:
        """Return True if a document was deleted."""

    @abstractmethod
    def get_project(self, project_id: str) -> Optional[dict[str, Any]]:
        ...

    @abstractmethod
    def get_project_by_slug(self, slug: str) -> Optional[dict[str, Any]]:
        ...

    @abstractmethod
    def update_project_by_slug(
        self, slug: str, data: dict[str, Any]
    ) -> Optional[dict[str, Any]]:
        """Replace project fields for the row matching ``slug``; preserve ``id``."""

    @abstractmethod
    def delete_project_by_slug(self, slug: str) -> bool:
        """Return True if a document was deleted."""

    @abstractmethod
    def insert_blog(self, blog: dict[str, Any]) -> None:
        ...

    @abstractmethod
    def insert_project(self, project: dict[str, Any]) -> None:
        ...

    @abstractmethod
    def insert_message(self, message: dict[str, Any]) -> None:
        ...

    @abstractmethod
    def insert_subscriber(self, subscriber: dict[str, Any]) -> None:
        ...

    @abstractmethod
    def list_blogs(
        self, page: int = 1, per_page: int = 10
    ) -> tuple[list[dict[str, Any]], int]:
        """Return (page of blogs newest first, total document count)."""
        ...

    @abstractmethod
    def list_projects(
        self, page: int = 1, per_page: int = 10
    ) -> tuple[list[dict[str, Any]], int]:
        """Return (page of projects newest first, total document count)."""
        ...

    @abstractmethod
    def list_work(
        self, page: int = 1, per_page: int = 10
    ) -> tuple[list[dict[str, Any]], int]:
        """
        Return (page of merged blogs + projects, total count).

        Each dict is ``{\"type\": \"blog\"|\"project\", \"item\": <jsonable record>}``.
        """

    @abstractmethod
    def list_work_featured(self) -> list[dict[str, Any]]:
        """
        Return up to 3 featured records sorted by ``feat_order`` then ``created_on``.

        Each dict is ``{\"type\": \"blog\"|\"project\", \"item\": <jsonable record>}``.
        """

    @abstractmethod
    def get_work_summary(self) -> dict[str, int]:
        """Return dashboard counts for projects, blogs, subscribers, images, and messages."""

    @abstractmethod
    def list_messages(
        self, page: int = 1, per_page: int = 10
    ) -> tuple[list[dict[str, Any]], int]:
        """Return (page of contact messages newest first, total document count)."""

    @abstractmethod
    def delete_message_by_id(self, message_id: str) -> bool:
        """Return True if a contact message row was deleted."""

    @abstractmethod
    def get_subscriber_by_email(self, email: str) -> Optional[dict[str, Any]]:
        ...

    @abstractmethod
    def delete_subscriber_by_id(self, subscriber_id: str) -> bool:
        """Return True if a subscriber row was deleted."""

    @abstractmethod
    def list_subscribers(
        self, page: int = 1, per_page: int = 10
    ) -> tuple[list[dict[str, Any]], int]:
        """Return (page of subscribers newest first, total document count)."""

    @abstractmethod
    def ensure_initialized(self) -> None:
        """Verify connectivity and create indexes / schema as needed (idempotent)."""
        ...
