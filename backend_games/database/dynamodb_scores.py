from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Optional

import boto3
from boto3.dynamodb.conditions import Key

from .interface import ScoreStoreInterface

_MAX_SCORE = 999_999_999


def _game_key(game: str) -> str:
    return f"GAME#{game}"


def _leaderboard_key(game: str) -> str:
    return f"GAME#{game}#LEADERBOARD"


def _to_int(value: Any) -> int:
    if isinstance(value, Decimal):
        return int(value)
    return int(value)


class DynamoScoreStore(ScoreStoreInterface):
    def __init__(
        self,
        table_name: Optional[str] = None,
        region_name: Optional[str] = None,
    ) -> None:
        self._table_name = table_name or os.environ.get(
            "APP_TABLE_NAME",
            os.environ.get("DYNAMODB_TABLE_NAME", ""),
        )
        if not self._table_name:
            raise ValueError("APP_TABLE_NAME is required for DynamoScoreStore.")
        self._dynamodb = boto3.resource("dynamodb", region_name=region_name)
        self._table = self._dynamodb.Table(self._table_name)

    def close(self) -> None:
        pass

    def ensure_initialized(self) -> None:
        self._table.load()

    def add_score(
        self,
        player_name: str,
        score: int,
        level: int,
        game_duration: int,
        game: str = "tommyjumper",
    ) -> dict[str, Any]:
        created = datetime.now(timezone.utc)
        created_iso = created.isoformat()
        score_id = str(uuid.uuid4())
        inverted = _MAX_SCORE - int(score)
        game_key = _game_key(game)

        item = {
            "PK": game_key,
            "SK": f"SCORE#{created_iso}#{score_id}",
            "GSI1PK": _leaderboard_key(game),
            "GSI1SK": f"{inverted:010d}#{created_iso}",
            "entity_type": "game_score",
            "game": game,
            "id": score_id,
            "player_name": player_name,
            "score": int(score),
            "level": int(level),
            "game_duration": int(game_duration),
            "created": created_iso,
        }
        self._table.put_item(Item=item)
        return {
            "id": score_id,
            "created": created_iso,
            "player_name": player_name,
            "score": int(score),
            "level": int(level),
            "game_duration": int(game_duration),
        }

    def get_top_scores(self, limit: int = 10, game: str = "tommyjumper") -> list[dict[str, Any]]:
        response = self._table.query(
            IndexName="GSI1",
            KeyConditionExpression=Key("GSI1PK").eq(_leaderboard_key(game)),
            ScanIndexForward=True,
            Limit=limit,
        )
        return [self._item_to_dict(item) for item in response.get("Items", [])]

    def get_score_count(self, game: str = "tommyjumper") -> int:
        response = self._table.query(
            KeyConditionExpression=Key("PK").eq(_game_key(game)) & Key("SK").begins_with("SCORE#"),
            Select="COUNT",
        )
        return int(response.get("Count", 0))

    def _item_to_dict(self, item: dict[str, Any]) -> dict[str, Any]:
        return {
            "id": item.get("id"),
            "created": item.get("created"),
            "player_name": item.get("player_name"),
            "score": _to_int(item.get("score", 0)),
            "level": _to_int(item.get("level", 0)),
            "game_duration": _to_int(item.get("game_duration", 0)),
        }
