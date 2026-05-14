from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from pymongo.errors import DuplicateKeyError

from ...database.interface import DatabaseInterface
from ...exceptions import SubscriberConflictError, SubscriberNotFoundError
from ...schemas.subscriber_schema import (
    SubscriberCreate,
    SubscriberCreateResponse,
    SubscriberDeleteResponse,
    SubscriberListParams,
    SubscriberListResponse,
    SubscriberPublic,
)


class SubscribersFunction:
    """Subscriber use-cases (list, create, delete)."""

    def __init__(self, db: DatabaseInterface) -> None:
        self._db = db

    def list_subscribers(
        self, params: SubscriberListParams
    ) -> SubscriberListResponse:
        subscribers, total = self._db.list_subscribers(
            page=params.page, per_page=params.per_page
        )
        return SubscriberListResponse(
            subscribers=[SubscriberPublic.model_validate(s) for s in subscribers],
            page=params.page,
            per_page=params.per_page,
            total=total,
        )

    def create_subscriber(
        self, request: SubscriberCreate
    ) -> SubscriberCreateResponse:
        if self._db.get_subscriber_by_email(request.email) is not None:
            raise SubscriberConflictError(
                "A subscriber with this email already exists"
            )

        payload = {
            "id": str(uuid4()),
            "email": request.email,
            "name": request.name,
            "created_on": datetime.now(timezone.utc),
        }
        try:
            self._db.insert_subscriber(payload)
        except DuplicateKeyError as e:
            raise SubscriberConflictError(
                "A subscriber with this email already exists"
            ) from e

        return SubscriberCreateResponse(
            details="Subscriber added successfully.",
            subscriber=SubscriberPublic.model_validate(payload),
        )

    def delete_subscriber_by_id(self, subscriber_id: str) -> SubscriberDeleteResponse:
        if not subscriber_id or not subscriber_id.strip():
            raise SubscriberNotFoundError("Subscriber id is required.")
        normalized = subscriber_id.strip()
        if not self._db.delete_subscriber_by_id(normalized):
            raise SubscriberNotFoundError(
                f"No subscriber found with id {normalized!r}."
            )
        return SubscriberDeleteResponse(
            details="Subscriber deleted successfully.",
            id=normalized,
        )
