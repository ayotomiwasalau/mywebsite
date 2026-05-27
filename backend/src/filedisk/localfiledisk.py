"""Write markdown/images under local ``public`` root (default: repo ``frontend/public``)."""

from __future__ import annotations

import os
from pathlib import Path

from .utils import (
    IMAGE_BLOG_DIR,
    IMAGE_BLOG_URL_PREFIX,
    IMAGE_PROJECT_DIR,
    IMAGE_PROJECT_URL_PREFIX,
    MARKDOWN_BLOG_DIR,
    MARKDOWN_BLOG_URL_PREFIX,
    MARKDOWN_PROJECT_DIR,
    MARKDOWN_PROJECT_URL_PREFIX,
    assert_allowed_image_name,
    assert_allowed_markdown_basename,
    assert_safe_slug_segment,
)


def _resolve_public_root(public_root: Path | str | None = None) -> Path:
    if public_root is not None:
        return Path(public_root).resolve()
    raw = os.environ.get("PUBLIC_ROOT", "frontend/public").strip()
    path = Path(raw).expanduser()
    if path.is_absolute():
        return path.resolve()
    repo_root = Path(__file__).resolve().parents[3]
    return (repo_root / path).resolve()


class LocalFileDisk:
    """Store markdown/images on local filesystem inside ``{public_root}``."""

    def __init__(self, public_root: Path | str | None = None) -> None:
        self._root = _resolve_public_root(public_root)

    def _write(self, subdir: str, url_prefix: str, basename: str, content: str) -> str:
        safe = assert_allowed_markdown_basename(basename)
        dest_dir = self._root / subdir
        dest_dir.mkdir(parents=True, exist_ok=True)
        path = dest_dir / safe
        resolved_dir = dest_dir.resolve()
        resolved_file = path.resolve()
        if not str(resolved_file).startswith(str(resolved_dir) + os.sep):
            raise ValueError("Invalid markdown path.")
        path.write_text(content, encoding="utf-8")
        return f"{url_prefix}/{safe}"

    def _write_image(
        self, subdir: str, url_prefix: str, slug: str, image_name: str, content: bytes
    ) -> str:
        safe_slug = assert_safe_slug_segment(slug)
        safe_name = assert_allowed_image_name(image_name)
        dest_dir = self._root / subdir / safe_slug
        dest_dir.mkdir(parents=True, exist_ok=True)
        path = dest_dir / safe_name
        resolved_dir = dest_dir.resolve()
        resolved_file = path.resolve()
        if not str(resolved_file).startswith(str(resolved_dir) + os.sep):
            raise ValueError("Invalid image path.")
        path.write_bytes(content)
        return f"{url_prefix}/{safe_slug}/{safe_name}"

    def write_blog_markdown(self, basename: str, content: str) -> str:
        return self._write(MARKDOWN_BLOG_DIR, MARKDOWN_BLOG_URL_PREFIX, basename, content)

    def write_project_markdown(self, basename: str, content: str) -> str:
        return self._write(
            MARKDOWN_PROJECT_DIR,
            MARKDOWN_PROJECT_URL_PREFIX,
            basename,
            content,
        )

    def save_blog_image(self, slug: str, image_name: str, content: bytes) -> str:
        return self._write_image(
            IMAGE_BLOG_DIR, IMAGE_BLOG_URL_PREFIX, slug, image_name, content
        )

    def save_project_image(self, slug: str, image_name: str, content: bytes) -> str:
        return self._write_image(
            IMAGE_PROJECT_DIR, IMAGE_PROJECT_URL_PREFIX, slug, image_name, content
        )

    def delete_blog_image(self, slug: str, image_name: str) -> bool:
        safe_slug = assert_safe_slug_segment(slug)
        safe_name = assert_allowed_image_name(image_name)
        path = self._root / IMAGE_BLOG_DIR / safe_slug / safe_name
        if not path.exists():
            return False
        path.unlink()
        return True

    def delete_project_image(self, slug: str, image_name: str) -> bool:
        safe_slug = assert_safe_slug_segment(slug)
        safe_name = assert_allowed_image_name(image_name)
        path = self._root / IMAGE_PROJECT_DIR / safe_slug / safe_name
        if not path.exists():
            return False
        path.unlink()
        return True

    def _list_images_in_tree(
        self, image_dir: str, url_prefix: str
    ) -> list[tuple[str, str, str]]:
        base = self._root / image_dir
        out: list[tuple[str, str, str]] = []
        if not base.is_dir():
            return out
        try:
            slug_dirs = sorted(p for p in base.iterdir() if p.is_dir())
        except OSError:
            return out
        for slug_path in slug_dirs:
            try:
                slug = assert_safe_slug_segment(slug_path.name)
            except ValueError:
                continue
            try:
                files = sorted(p for p in slug_path.iterdir() if p.is_file())
            except OSError:
                continue
            for path in files:
                try:
                    safe_name = assert_allowed_image_name(path.name)
                except ValueError:
                    continue
                url = f"{url_prefix}/{slug}/{safe_name}"
                out.append((slug, safe_name, url))
        return out

    def list_blog_images(self) -> list[tuple[str, str, str]]:
        return self._list_images_in_tree(IMAGE_BLOG_DIR, IMAGE_BLOG_URL_PREFIX)

    def list_project_images(self) -> list[tuple[str, str, str]]:
        return self._list_images_in_tree(IMAGE_PROJECT_DIR, IMAGE_PROJECT_URL_PREFIX)
