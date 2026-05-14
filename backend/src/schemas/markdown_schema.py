"""Payloads for markdown-only routes."""

from __future__ import annotations

from pydantic import BaseModel, Field


class MarkdownWriteBody(BaseModel):
    """Raw markdown to persist to the item's storage path."""

    content: str = Field(default="", description="Markdown body (may be empty).")


class MarkdownSaveResponse(BaseModel):
    details: str
    slug: str
    filepath_md: str
