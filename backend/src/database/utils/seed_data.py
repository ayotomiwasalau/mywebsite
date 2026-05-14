"""Load seed documents from ``database/data/*.json`` (idempotent)."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from ..interface import DatabaseInterface
from ..models import Blog, Project


def _data_dir() -> Path:
    return Path(__file__).resolve().parents[1] / "data"


def _read_json_array(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    text = path.read_text(encoding="utf-8")
    data = json.loads(text)
    return data if isinstance(data, list) else []


def _dump_for_storage(obj: Blog | Project) -> dict[str, Any]:
    """Storage-friendly: native Python datetimes for ``created_on`` / ``updated_on``."""
    return obj.model_dump(mode="python")


def load_and_seed(db: DatabaseInterface) -> dict[str, int]:
    """
    Insert seed rows from ``blogs.json`` and ``project.json`` when ``id`` is absent.

    Returns counts of inserted rows per collection.
    """
    counts = {"blogs_inserted": 0, "projects_inserted": 0}
    base = _data_dir()

    for raw in _read_json_array(base / "blogs.json"):
        blog = Blog.model_validate(raw)
        if db.get_blog(blog.id) is not None:
            continue
        db.insert_blog(_dump_for_storage(blog))
        counts["blogs_inserted"] += 1

    for raw in _read_json_array(base / "project.json"):
        project = Project.model_validate(raw)
        if db.get_project(project.id) is not None:
            continue
        db.insert_project(_dump_for_storage(project))
        counts["projects_inserted"] += 1

    return counts


def should_run_seed() -> bool:
    return os.environ.get("SKIP_JSON_SEED", "").lower() not in (
        "1",
        "true",
        "yes",
    )
