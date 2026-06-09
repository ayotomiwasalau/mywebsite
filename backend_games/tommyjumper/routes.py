import logging
import os
from flask import Blueprint, jsonify, render_template, request

from backend_games.tommyjumper.models import add_score as db_add_score, get_top_scores


tommyjumper_bp = Blueprint(
    "tommyjumper",
    __name__,
    static_folder=os.path.join(os.path.dirname(__file__), "static"),
    template_folder=os.path.join(os.path.dirname(__file__), "templates"),
)


@tommyjumper_bp.route("/")
def index():
    logging.info("TommyJumper game page loaded.")
    return render_template("index.html")


@tommyjumper_bp.route("/leaderboard")
def leaderboard():
    top_scores = get_top_scores(10)
    logging.info("Leaderboard page loaded with %d scores.", len(top_scores))
    return render_template("leaderboard.html", scores=top_scores)


@tommyjumper_bp.route("/about")
def about():
    try:
        logging.info("About page retrieved")
        return render_template("about.html")
    except Exception as e:
        logging.error("Error loading about page: %s", e)
        raise


@tommyjumper_bp.route("/submit-score", methods=["POST"])
def submit_score():
    try:
        data = request.get_json() or {}
        player_name = data.get("player_name", "Anonymous")
        score = data.get("score", 0)
        level = data.get("level", 1)
        game_duration = data.get("game_duration", 0)

        if not player_name or score < 0:
            return jsonify({"error": "Invalid data provided"}), 400

        db_add_score(player_name, score, level, game_duration)

        logging.info(
            "New score submitted: %s by %s (Level: %s, Duration: %ss)",
            score,
            player_name,
            level,
            game_duration,
        )

        return jsonify({"success": True, "message": "Score submitted successfully"}), 200

    except Exception as e:
        logging.error("Error submitting score: %s", e)
        return jsonify({"error": "Internal server error"}), 500


@tommyjumper_bp.route("/api/scores")
def get_scores():
    try:
        limit = request.args.get("limit", 10, type=int)
        top_scores = get_top_scores(limit)
        return jsonify({"scores": top_scores}), 200
    except Exception as e:
        logging.error("Error getting scores: %s", e)
        return jsonify({"error": "Internal server error"}), 500
