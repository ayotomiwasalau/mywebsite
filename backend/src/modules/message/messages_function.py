from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from ...database.interface import DatabaseInterface
from ...exceptions.message import MessageNotFoundError
from ...schemas.message_schema import (
    MessageCreate,
    MessageCreateResponse,
    MessageDeleteResponse,
    MessageListParams,
    MessageListResponse,
    MessagePublic,
)


class MessagesFunction:
    """Contact message use-cases (list, create)."""

    def __init__(self, db: DatabaseInterface) -> None:
        self._db = db

    def list_messages(self, params: MessageListParams) -> MessageListResponse:
        messages, total = self._db.list_messages(
            page=params.page, per_page=params.per_page
        )
        return MessageListResponse(
            messages=[MessagePublic.model_validate(m) for m in messages],
            page=params.page,
            per_page=params.per_page,
            total=total,
        )

    def create_message(self, request: MessageCreate) -> MessageCreateResponse:
        payload = {
            "id": str(uuid4()),
            "name": request.name,
            "email": request.email,
            "subject": request.subject,
            "message": request.message,
            "created_on": datetime.now(timezone.utc),
        }
        self._db.insert_message(payload)
        return MessageCreateResponse(
            details="Message received successfully.",
            message=MessagePublic.model_validate(payload),
        )

    def delete_message_by_id(self, message_id: str) -> MessageDeleteResponse:
        if not message_id or not message_id.strip():
            raise MessageNotFoundError("Message id is required.")
        normalized = message_id.strip()
        if not self._db.delete_message_by_id(normalized):
            raise MessageNotFoundError(f"No message found with id {normalized!r}.")
        return MessageDeleteResponse(
            details="Message deleted successfully.",
            id=normalized,
        )

