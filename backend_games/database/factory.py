"""Score store singleton for the games Flask app."""

from __future__ import annotations

import os
from typing import Optional

from .interface import ScoreStoreInterface

_store: Optional[ScoreStoreInterface] = None


def get_score_store() -> ScoreStoreInterface:
    global _store
    if _store is None:
        backend = os.environ.get("DATABASE_BACKEND", "dynamodb").lower().strip()
        if backend in {"dynamodb", "dynamo"}:
            from .dynamodb_scores import DynamoScoreStore

            _store = DynamoScoreStore()
        elif backend in {"mongodb", "mongo"}:
            from .mongo_scores import MongoScoreStore

            _store = MongoScoreStore()
        else:
            raise ValueError(f"Unsupported DATABASE_BACKEND: {backend!r}")
    return _store


def shutdown_score_store() -> None:
    global _store
    if _store is not None:
        _store.close()
        _store = None


def init_score_store() -> None:
    get_score_store().ensure_initialized()
