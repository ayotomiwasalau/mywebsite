"""Store image assets in S3; markdown can be stored by another backend."""

from __future__ import annotations

import os
from typing import TYPE_CHECKING

from .utils import (
    IMAGE_BLOG_DIR,
    IMAGE_BLOG_URL_PREFIX,
    IMAGE_PROJECT_DIR,
    IMAGE_PROJECT_URL_PREFIX,
    assert_allowed_image_name,
    assert_safe_slug_segment,
)

if TYPE_CHECKING:
    pass


class S3FileDisk:
    """Upload image objects to a bucket."""

    def __init__(
        self,
        *,
        bucket: str,
        public_base_url: str,
        key_prefix: str = "",
    ) -> None:
        try:
            import boto3  # type: ignore[import-untyped]
        except ImportError as e:
            raise RuntimeError(
                "S3 backend requires the ``boto3`` package. Install with: pip install boto3"
            ) from e
        self._boto3 = boto3
        self._bucket = bucket
        self._client = boto3.client("s3")
        self._public_base = public_base_url.rstrip("/")
        self._key_prefix = key_prefix.strip("/")

    @classmethod
    def from_env(cls) -> "S3FileDisk":
        bucket = os.environ.get("AWS_S3_MARKDOWN_BUCKET", "").strip()
        if not bucket:
            raise ValueError("AWS_S3_MARKDOWN_BUCKET is required when FILE_DISK_BACKEND=s3")
        public_base = os.environ.get("MARKDOWN_CDN_BASE_URL", "").strip()
        if not public_base:
            raise ValueError("MARKDOWN_CDN_BASE_URL is required when FILE_DISK_BACKEND=s3")
        prefix = os.environ.get("AWS_S3_MARKDOWN_KEY_PREFIX", "").strip()
        return cls(bucket=bucket, public_base_url=public_base, key_prefix=prefix)

    def _object_key(self, subdir: str, filename: str) -> str:
        parts = [p for p in (self._key_prefix, subdir, filename) if p]
        return "/".join(parts)

    def _put_bytes(self, key: str, content: bytes, content_type: str) -> None:
        self._client.put_object(
            Bucket=self._bucket,
            Key=key,
            Body=content,
            ContentType=content_type,
        )

    def _image_key(self, subdir: str, slug: str, image_name: str) -> str:
        safe_slug = assert_safe_slug_segment(slug)
        safe_name = assert_allowed_image_name(image_name)
        img_subdir = f"{subdir}/{safe_slug}"
        return self._object_key(img_subdir, safe_name)

    def save_blog_image(self, slug: str, image_name: str, content: bytes) -> str:
        safe_slug = assert_safe_slug_segment(slug)
        safe_name = assert_allowed_image_name(image_name)
        key = self._image_key(IMAGE_BLOG_DIR, safe_slug, safe_name)
        self._put_bytes(key, content, "application/octet-stream")
        return f"{self._public_base}{IMAGE_BLOG_URL_PREFIX}/{safe_slug}/{safe_name}"

    def save_project_image(self, slug: str, image_name: str, content: bytes) -> str:
        safe_slug = assert_safe_slug_segment(slug)
        safe_name = assert_allowed_image_name(image_name)
        key = self._image_key(IMAGE_PROJECT_DIR, safe_slug, safe_name)
        self._put_bytes(key, content, "application/octet-stream")
        return f"{self._public_base}{IMAGE_PROJECT_URL_PREFIX}/{safe_slug}/{safe_name}"

    def _delete(self, key: str) -> bool:
        resp = self._client.delete_object(Bucket=self._bucket, Key=key)
        return resp.get("ResponseMetadata", {}).get("HTTPStatusCode", 0) < 400

    def delete_blog_image(self, slug: str, image_name: str) -> bool:
        key = self._image_key(IMAGE_BLOG_DIR, slug, image_name)
        return self._delete(key)

    def delete_project_image(self, slug: str, image_name: str) -> bool:
        key = self._image_key(IMAGE_PROJECT_DIR, slug, image_name)
        return self._delete(key)

    def _images_search_prefix(self, dir_part: str) -> str:
        parts = [p for p in (self._key_prefix, dir_part) if p]
        prefix = "/".join(parts)
        return f"{prefix}/" if prefix else ""

    def _list_images_under_prefix(
        self, dir_part: str, url_prefix: str
    ) -> list[tuple[str, str, str]]:
        search_prefix = self._images_search_prefix(dir_part)
        out: list[tuple[str, str, str]] = []
        paginator = self._client.get_paginator("list_objects_v2")
        for page in paginator.paginate(Bucket=self._bucket, Prefix=search_prefix):
            for obj in page.get("Contents") or []:
                key = obj.get("Key")
                if not key or not isinstance(key, str) or key.endswith("/"):
                    continue
                if not key.startswith(search_prefix):
                    continue
                rel = key[len(search_prefix) :]
                segments = rel.split("/")
                if len(segments) != 2:
                    continue
                slug_candidate, filename = segments
                try:
                    slug = assert_safe_slug_segment(slug_candidate)
                    safe_name = assert_allowed_image_name(filename)
                except ValueError:
                    continue
                url = f"{self._public_base}{url_prefix}/{slug}/{safe_name}"
                out.append((slug, safe_name, url))
        out.sort(key=lambda t: (t[0], t[1]))
        return out

    def list_blog_images(self) -> list[tuple[str, str, str]]:
        return self._list_images_under_prefix(IMAGE_BLOG_DIR, IMAGE_BLOG_URL_PREFIX)

    def list_project_images(self) -> list[tuple[str, str, str]]:
        return self._list_images_under_prefix(IMAGE_PROJECT_DIR, IMAGE_PROJECT_URL_PREFIX)
