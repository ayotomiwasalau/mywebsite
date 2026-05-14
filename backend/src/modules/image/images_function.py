from __future__ import annotations

from typing import Optional

from ...filedisk import FileDiskInterface
from ...schemas import (
    ImageDeleteResponse,
    ImageKind,
    ImageListItem,
    ImageListResponse,
    ImageWriteResponse,
)


class ImagesFunction:
    """Image file use-cases (upload, replace, delete)."""

    def __init__(self, disk: FileDiskInterface) -> None:
        self._disk = disk

    def save_image(
        self, *, kind: ImageKind, slug: str, image_name: str, content: bytes
    ) -> ImageWriteResponse:
        if kind == "blog":
            url = self._disk.save_blog_image(slug, image_name, content)
        else:
            url = self._disk.save_project_image(slug, image_name, content)
        return ImageWriteResponse(
            details="Image saved successfully.",
            kind=kind,
            slug=slug,
            image_name=image_name,
            image_url=url,
        )

    def replace_image(
        self, *, kind: ImageKind, slug: str, image_name: str, content: bytes
    ) -> ImageWriteResponse:
        # Overwrite semantics are identical for local and S3 backends.
        resp = self.save_image(
            kind=kind, slug=slug, image_name=image_name, content=content
        )
        return ImageWriteResponse(
            details="Image replaced successfully.",
            kind=resp.kind,
            slug=resp.slug,
            image_name=resp.image_name,
            image_url=resp.image_url,
        )

    def list_images(self, *, kind_filter: Optional[ImageKind]) -> ImageListResponse:
        items: list[ImageListItem] = []
        if kind_filter is None or kind_filter == "blog":
            for slug, image_name, image_url in self._disk.list_blog_images():
                items.append(
                    ImageListItem(
                        kind="blog",
                        slug=slug,
                        image_name=image_name,
                        image_url=image_url,
                    )
                )
        if kind_filter is None or kind_filter == "project":
            for slug, image_name, image_url in self._disk.list_project_images():
                items.append(
                    ImageListItem(
                        kind="project",
                        slug=slug,
                        image_name=image_name,
                        image_url=image_url,
                    )
                )
        items.sort(key=lambda row: (row.kind, row.slug, row.image_name))
        return ImageListResponse(images=items)

    def delete_image(
        self, *, kind: ImageKind, slug: str, image_name: str
    ) -> ImageDeleteResponse:
        deleted = (
            self._disk.delete_blog_image(slug, image_name)
            if kind == "blog"
            else self._disk.delete_project_image(slug, image_name)
        )
        if not deleted:
            raise FileNotFoundError("Image not found")
        return ImageDeleteResponse(
            details="Image deleted successfully.",
            kind=kind,
            slug=slug,
            image_name=image_name,
        )
