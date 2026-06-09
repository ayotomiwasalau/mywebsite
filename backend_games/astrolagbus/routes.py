import logging
import os

from flask import Blueprint, jsonify, render_template, request

from backend_games.astrolagbus.models import add_score as db_add_score, get_top_scores

astrolagbus_bp = Blueprint(
    "astrolagbus",
    __name__,
    static_folder=os.path.join(os.path.dirname(__file__), "static"),
    template_folder=os.path.join(os.path.dirname(__file__), "templates"),
)


@astrolagbus_bp.route("/")
def index():
    logging.info("Astrolagbus Defender game loaded.")
    return render_template("astrolagbus_game_zone.html")


@astrolagbus_bp.route("/leaderboard")
def leaderboard():
    top_scores = get_top_scores(10)
    logging.info("Astrolagbus leaderboard loaded with %d scores.", len(top_scores))
    return render_template("astrolagbus_leaderboard.html", scores=top_scores)


@astrolagbus_bp.route("/about")
def about():
    try:
        logging.info("Astrolagbus about page retrieved")
        return render_template("astrolagbus_story_mode.html")
    except Exception as e:
        logging.error("Error loading astrolagbus about page: %s", e)
        raise


@astrolagbus_bp.route("/submit-score", methods=["POST"])
def submit_score():
    try:
        data = request.get_json() or {}
        player_name = (data.get("player_name") or "Anonymous").strip()[:20] or "Anonymous"
        score = int(data.get("score", 0))
        level = int(data.get("level", 1))
        game_duration = int(data.get("game_duration", 0))

        if score < 0 or level < 1:
            return jsonify({"error": "Invalid data provided"}), 400

        db_add_score(player_name, score, level, game_duration)

        logging.info(
            "Astrolagbus score submitted: %s by %s (Level: %s, Duration: %ss)",
            score,
            player_name,
            level,
            game_duration,
        )

        return jsonify({"success": True, "message": "Score submitted successfully"}), 200

    except (TypeError, ValueError):
        return jsonify({"error": "Invalid data provided"}), 400
    except Exception as e:
        logging.error("Error submitting Astrolagbus score: %s", e)
        return jsonify({"error": "Internal server error"}), 500


@astrolagbus_bp.route("/api/scores")
def get_scores():
    try:
        limit = request.args.get("limit", 10, type=int)
        top_scores = get_top_scores(limit)
        return jsonify({"scores": top_scores}), 200
    except Exception as e:
        logging.error("Error getting Astrolagbus scores: %s", e)
        return jsonify({"error": "Internal server error"}), 500
