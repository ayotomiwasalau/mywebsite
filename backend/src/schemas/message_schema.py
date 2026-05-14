"""Pydantic payloads for contact message routes."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class MessageCreate(BaseModel):
    name: str = Field(..., max_length=255)
    email: str = Field(..., max_length=320)
    subject: str = Field(..., max_length=512)
    message: str

    def to_message_kwargs(self) -> dict[str, Any]:
        return self.model_dump()


class MessagePublic(BaseModel):
    id: str = Field(..., max_length=64)
    name: str = Field(..., max_length=255)
    email: str = Field(..., max_length=320)
    subject: str = Field(..., max_length=512)
    message: str
    created_on: datetime


class MessageListParams(BaseModel):
    page: int = Field(1, ge=1)
    per_page: int = Field(10, ge=1, le=100)


class MessageListResponse(BaseModel):
    messages: list[MessagePublic]
    page: int
    per_page: int
    total: int


class MessageCreateResponse(BaseModel):
    details: str
    message: MessagePublic


class MessageDeleteResponse(BaseModel):
    details: str
    id: str = Field(..., max_length=64)

