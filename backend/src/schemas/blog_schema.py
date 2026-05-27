"""Pydantic payloads for blog routes (aligned with `database.models.blog.Blog`)."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, model_validator


class BlogFields(BaseModel):
    """Persisted blog fields (MongoDB document shape)."""

    id: str = Field(..., max_length=64)
    slug: str = Field(..., max_length=255)
    title: str = Field(..., max_length=512)
    header_img_url: str = Field(..., max_length=2048)
    header_img_alt: str = Field(..., max_length=512)
    description: str
    tags: list[str] = Field(default_factory=list)
    href: str = Field(..., max_length=2048)
    filepath_md: str = Field(..., max_length=2048)
    created_on: datetime
    updated_on: datetime
    feature: bool = False
    feat_order: int | None = Field(default=None, ge=1, le=3)
    shares: int = 0
    project_url: str = Field(..., max_length=2048)

    @model_validator(mode="after")
    def validate_feature_order(self):
        if self.feature and self.feat_order is None:
            raise ValueError("feat_order is required when feature is true")
        if not self.feature:
            self.feat_order = None
        return self


class BlogCreate(BlogFields):
    """Create/replace payload; optional ``body_markdown`` is written to disk, not stored on the document."""

    body_markdown: str | None = None

    def to_blog_kwargs(self) -> dict[str, Any]:
        return self.model_dump(mode="python", exclude={"body_markdown"})


class BlogPublic(BlogFields):
    """Blog document returned from the API."""


class BlogListParams(BaseModel):
    """Query parameters for ``GET /blogs``."""

    page: int = Field(1, ge=1)
    per_page: int = Field(10, ge=1, le=100)


class BlogListResponse(BaseModel):
    blogs: list[BlogPublic]
    page: int
    per_page: int
    total: int


class BlogCreateResponse(BaseModel):
    details: str
    blog: BlogPublic


class BlogUpdateResponse(BaseModel):
    details: str
    blog: BlogPublic


class BlogDeleteResponse(BaseModel):
    details: str
    slug: str
