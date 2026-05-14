"""Apply markdown body writes using ``filepath_md`` + ``slug`` for basename rules."""

from __future__ import annotations

from ..filediskinterface import FileDiskInterface
from .basename import sanitize_markdown_basename


def persist_blog_markdown(
    disk: FileDiskInterface,
    *,
    filepath_md: str,
    slug: str,
    body_markdown: str,
) -> str:
    """Write blog markdown; return public ``filepath_md`` URL."""
    basename = sanitize_markdown_basename(filepath_md, slug)
    return disk.write_blog_markdown(basename, body_markdown)


def persist_project_markdown(
    disk: FileDiskInterface,
    *,
    filepath_md: str,
    slug: str,
    body_markdown: str,
) -> str:
    basename = sanitize_markdown_basename(filepath_md, slug)
    return disk.write_project_markdown(basename, body_markdown)
