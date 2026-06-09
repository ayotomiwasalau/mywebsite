from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any, Optional

from pymongo import DESCENDING, MongoClient
from pymongo.collection import Collection

from .interface import ScoreStoreInterface


class MongoScoreStore(ScoreStoreInterface):
    def __init__(
        self,
        mongodb_uri: Optional[str] = None,
        database_name: Optional[str] = None,
        collection_name: Optional[str] = None,
    ) -> None:
        self._uri = mongodb_uri or os.environ.get(
            "MONGODB_URI",
            "mongodb://localhost:2701",
        )
        self._database_name = database_name or os.environ.get(
            "MONGODB_DB",
            "portfolio",
        )
        self._collection_name = collection_name or os.environ.get(
            "MONGODB_SCORES_COLLECTION",
            "astrolagbus_scores",
        )
        self._client: MongoClient[Any] = MongoClient(self._uri)
        self._collection: Collection[Any] = self._client[self._database_name][
            self._collection_name
        ]

    def close(self) -> None:
        self._client.close()

    def ensure_initialized(self) -> None:
        self._client.admin.command("ping")
        self._collection.create_index([("game", DESCENDING), ("score", DESCENDING), ("created", DESCENDING)])

    def add_score(
        self,
        player_name: str,
        score: int,
        level: int,
        game_duration: int,
        game: str = "tommyjumper",
    ) -> dict[str, Any]:
        created = datetime.now(timezone.utc)
        payload = {
            "game": game,
            "player_name": player_name,
            "score": int(score),
            "level": int(level),
            "game_duration": int(game_duration),
            "created": created,
        }
        result = self._collection.insert_one(payload)
        return {
            "id": str(result.inserted_id),
            "created": created.isoformat(),
            "player_name": player_name,
            "score": int(score),
            "level": int(level),
            "game_duration": int(game_duration),
        }

    def get_top_scores(self, limit: int = 10, game: str = "tommyjumper") -> list[dict[str, Any]]:
        cursor = (
            self._collection.find({"game": game})
            .sort([("score", DESCENDING), ("created", DESCENDING)])
            .limit(limit)
        )
        rows = []
        for doc in cursor:
            created = doc.get("created")
            rows.append(
                {
                    "id": str(doc.get("_id")),
                    "created": created.isoformat() if hasattr(created, "isoformat") else created,
                    "player_name": doc.get("player_name"),
                    "score": int(doc.get("score", 0)),
                    "level": int(doc.get("level", 0)),
                    "game_duration": int(doc.get("game_duration", 0)),
                }
            )
        return rows

    def get_score_count(self, game: str = "tommyjumper") -> int:
        return self._collection.count_documents({"game": game})
