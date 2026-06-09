from typing import List

from backend_games.database.factory import get_score_store

GAME_ID = "astrolagbus"


def add_score(player_name: str, score: int, level: int, game_duration: int) -> dict:
    return get_score_store().add_score(
        player_name,
        score,
        level,
        game_duration,
        game=GAME_ID,
    )


def get_top_scores(limit: int = 10) -> List[dict]:
    return get_score_store().get_top_scores(limit, game=GAME_ID)


def get_score_count() -> int:
    return get_score_store().get_score_count(game=GAME_ID)
