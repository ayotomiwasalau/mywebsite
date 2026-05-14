"""Schemas for unified blog + project feed (``GET /work``)."""

from __future__ import annotations

from typing import Annotated, Literal, Union

from pydantic import BaseModel, Field

from .blog_schema import BlogPublic
from .project_schema import ProjectPublic


class WorkItemBlog(BaseModel):
    type: Literal["blog"] = "blog"
    item: BlogPublic


class WorkItemProject(BaseModel):
    type: Literal["project"] = "project"
    item: ProjectPublic


WorkListItem = Annotated[
    Union[WorkItemBlog, WorkItemProject],
    Field(discriminator="type"),
]


class WorkListParams(BaseModel):
    """Query parameters for ``GET /work``."""

    page: int = Field(1, ge=1)
    per_page: int = Field(10, ge=1, le=100)


class WorkListResponse(BaseModel):
    items: list[WorkItemBlog | WorkItemProject]
    page: int
    per_page: int
    total: int


class WorkSummaryResponse(BaseModel):
    projects: int
    blogs: int
    subscribers: int
    images: int
    messages: int


class WorkFeaturedResponse(BaseModel):
    """Top featured work cards (max 3, sorted by ``feat_order``)."""

    items: list[WorkItemBlog | WorkItemProject]
