from abc import ABC, abstractmethod
from typing import Any


class ScoreStoreInterface(ABC):
    """Contract for game score persistence."""

    @abstractmethod
    def close(self) -> None:
        ...

    @abstractmethod
    def ensure_initialized(self) -> None:
        ...

    @abstractmethod
    def add_score(
        self,
        player_name: str,
        score: int,
        level: int,
        game_duration: int,
        game: str = "tommyjumper",
    ) -> dict[str, Any]:
        ...

    @abstractmethod
    def get_top_scores(self, limit: int = 10, game: str = "tommyjumper") -> list[dict[str, Any]]:
        ...

    @abstractmethod
    def get_score_count(self, game: str = "tommyjumper") -> int:
        ...
