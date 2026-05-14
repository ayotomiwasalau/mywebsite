"""Validate image names and slug path segments."""

from __future__ import annotations

import os
import re

_SAFE_SEGMENT = re.compile(r"^[a-z0-9][a-z0-9._-]{0,120}$")
_SAFE_IMAGE_NAME = re.compile(
    r"^[a-zA-Z0-9][a-zA-Z0-9._-]{0,200}\.(?:png|jpg|jpeg|webp|gif|svg)$",
    re.IGNORECASE,
)


def assert_safe_slug_segment(slug: str) -> str:
    s = slug.strip().lower()
    if not _SAFE_SEGMENT.fullmatch(s):
        raise ValueError(f"Invalid slug path segment: {slug!r}")
    return s


def assert_allowed_image_name(name: str) -> str:
    base = os.path.basename(name.strip())
    if base != name.strip() or not _SAFE_IMAGE_NAME.fullmatch(base):
        raise ValueError(f"Invalid image filename: {name!r}")
    return base
