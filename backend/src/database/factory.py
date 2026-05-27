"""Database singleton for FastAPI."""

from __future__ import annotations

from collections.abc import Generator
import os
from typing import Optional

from .interface import DatabaseInterface

_db: Optional[DatabaseInterface] = None


def get_database() -> DatabaseInterface:
    print(f"Getting database: {os.environ.get('DATABASE_BACKEND')}")
    global _db
    if _db is None:
        backend = os.environ.get("DATABASE_BACKEND", "dynamodb").lower().strip()
        if backend in {"dynamodb", "dynamo"}:
            from .dynamodb_database import DynamoDatabase

            _db = DynamoDatabase()
        elif backend in {"mongodb", "mongo"}:
            from .mongo_database import MongoDatabase

            _db = MongoDatabase()
        else:
            raise ValueError(f"Unsupported DATABASE_BACKEND: {backend!r}")
    return _db


def shutdown_database() -> None:
    global _db
    if _db is not None:
        _db.close()
        _db = None


def get_db() -> Generator[DatabaseInterface, None, None]:
    """FastAPI dependency: one shared database backend instance per process."""
    yield get_database()


def init_database() -> None:
    """Call once at app startup: verify storage, then optional JSON seed data."""
    db = get_database()
    db.ensure_initialized()
    from .utils import load_and_seed, should_run_seed

    if should_run_seed():
        load_and_seed(db)
