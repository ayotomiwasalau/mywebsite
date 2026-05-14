"""Schemas for image file endpoints."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel

ImageKind = Literal["blog", "project"]


class ImageWriteResponse(BaseModel):
    details: str
    kind: ImageKind
    slug: str
    image_name: str
    image_url: str


class ImageDeleteResponse(BaseModel):
    details: str
    kind: ImageKind
    slug: str
    image_name: str


class ImageListItem(BaseModel):
    kind: ImageKind
    slug: str
    image_name: str
    image_url: str


class ImageListResponse(BaseModel):
    images: list[ImageListItem]
