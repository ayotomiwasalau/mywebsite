from __future__ import annotations

from datetime import datetime
from typing import List, Optional


class InMemoryScoreCache:
    """In-memory store for unit tests."""

    def __init__(self, max_entries: Optional[int] = None):
        self.max_entries = max_entries or 1000
        self.scores: List[dict] = []
        self.next_id: int = 1

    def add_score(self, player_name: str, score: int, level: int, game_duration: int) -> dict:
        new_score = {
            "id": self.next_id,
            "created": datetime.now().isoformat(),
            "player_name": player_name,
            "score": int(score),
            "level": int(level),
            "game_duration": int(game_duration),
        }
        self.next_id += 1
        self.scores.append(new_score)
        if len(self.scores) > self.max_entries:
            self.scores.pop(0)
        return new_score

    def get_top_scores(self, limit: int = 10) -> List[dict]:
        sorted_scores = sorted(
            self.scores,
            key=lambda row: (row["score"], row["created"]),
            reverse=True,
        )
        return sorted_scores[:limit]

    def get_score_count(self) -> int:
        return len(self.scores)
