"""Storage backend for markdown + image assets (local disk or S3)."""

from __future__ import annotations

from typing import Protocol, runtime_checkable


@runtime_checkable
class FileDiskInterface(Protocol):
    """Write markdown and image assets, returning public URL paths."""

    def write_blog_markdown(self, basename: str, content: str) -> str:
        """Persist ``content`` as ``basename`` under blog markdown storage."""
        ...

    def write_project_markdown(self, basename: str, content: str) -> str:
        """Persist ``content`` as ``basename`` under project markdown storage."""
        ...

    def save_blog_image(self, slug: str, image_name: str, content: bytes) -> str:
        """Write image bytes under ``/images/blog/{slug}/{image_name}``."""
        ...

    def save_project_image(self, slug: str, image_name: str, content: bytes) -> str:
        """Write image bytes under ``/images/project/{slug}/{image_name}``."""
        ...

    def delete_blog_image(self, slug: str, image_name: str) -> bool:
        """Delete ``/images/blog/{slug}/{image_name}`` if it exists."""
        ...

    def delete_project_image(self, slug: str, image_name: str) -> bool:
        """Delete ``/images/project/{slug}/{image_name}`` if it exists."""
        ...

    def list_blog_images(self) -> list[tuple[str, str, str]]:
        """List ``(slug, image_name, image_url)`` for blog uploads."""
        ...

    def list_project_images(self) -> list[tuple[str, str, str]]:
        """List ``(slug, image_name, image_url)`` for project uploads."""
        ...
