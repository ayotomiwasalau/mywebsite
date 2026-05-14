"""Safe markdown filenames under ``public/markdowns/{blog|project}``."""

from __future__ import annotations

import os
import re

_ALLOWED = re.compile(r"^[a-zA-Z0-9._-]+\.(?:md|markdown|txt)$", re.IGNORECASE)


def slug_to_default_filename(slug: str) -> str:
    base = re.sub(r"[^a-zA-Z0-9._-]+", "-", slug.strip().lower()).strip("-._")
    if not base:
        base = "post"
    return f"{base}.md"


def sanitize_markdown_basename(filepath_md: str, slug: str) -> str:
    """Pick a safe basename from ``filepath_md`` or fall back to ``slug``.md."""
    name = os.path.basename((filepath_md or "").strip().strip("/"))
    if name and _ALLOWED.fullmatch(name):
        return name
    return slug_to_default_filename(slug)


def assert_allowed_markdown_basename(name: str) -> str:
    """Return ``name`` if it matches allowed markdown filename rules, else raise."""
    n = name.strip()
    if not n or not _ALLOWED.fullmatch(n):
        raise ValueError(f"Invalid markdown filename: {name!r}")
    return n
