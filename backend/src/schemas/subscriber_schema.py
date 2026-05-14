"""Pydantic payloads for subscriber routes."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class SubscriberCreate(BaseModel):
    email: str = Field(..., max_length=320)
    name: str = Field(..., max_length=255)

    def to_subscriber_kwargs(self) -> dict[str, Any]:
        return self.model_dump()


class SubscriberPublic(BaseModel):
    id: str = Field(..., max_length=64)
    email: str = Field(..., max_length=320)
    name: str = Field(..., max_length=255)
    created_on: datetime


class SubscriberListParams(BaseModel):
    page: int = Field(1, ge=1)
    per_page: int = Field(10, ge=1, le=100)


class SubscriberListResponse(BaseModel):
    subscribers: list[SubscriberPublic]
    page: int
    per_page: int
    total: int


class SubscriberCreateResponse(BaseModel):
    details: str
    subscriber: SubscriberPublic


class SubscriberDeleteResponse(BaseModel):
    details: str
    id: str = Field(..., max_length=64)
