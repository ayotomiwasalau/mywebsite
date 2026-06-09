from flask import jsonify
import logging
import sys
import os

from backend_games.api_config import GAMES_PREFIX
from backend_games.config import app
from backend_games.database import init_score_store
from backend_games.astrolagbus.models import get_score_count as get_astrolagbus_score_count
from backend_games.tommyjumper.models import get_score_count
from backend_games.tommyjumper.routes import tommyjumper_bp
from backend_games.astrolagbus.routes import astrolagbus_bp


def configure_logging(
    log_level=logging.INFO,
    log_format="%(asctime)s - %(levelname)s - %(message)s",
):
    stdout_handler = logging.StreamHandler(sys.stdout)
    stderr_handler = logging.StreamHandler(sys.stderr)
    formatter = logging.Formatter(log_format)
    stderr_handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.addHandler(stdout_handler)
    root_logger.addHandler(stderr_handler)


app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "tommyjumper-secret-key-2024")
configure_logging()

with app.app_context():
    try:
        init_score_store()
    except Exception as exc:
        logging.error("Failed to initialize score store: %s", exc)

app.register_blueprint(tommyjumper_bp, url_prefix=f"{GAMES_PREFIX}/tommyjumper")
app.register_blueprint(astrolagbus_bp, url_prefix=f"{GAMES_PREFIX}/astrolagbus")


@app.route(f"{GAMES_PREFIX}/healthz")
def health():
    return jsonify({"result": "OK - healthy"}), 200


@app.route(f"{GAMES_PREFIX}/metrics")
def metrics():
    try:
        score_count = get_score_count()
        astrolagbus_score_count = get_astrolagbus_score_count()
        backend = os.environ.get("DATABASE_BACKEND", "dynamodb")
        return jsonify(
            {
                "score_count": score_count,
                "astrolagbus_score_count": astrolagbus_score_count,
                "database_backend": backend,
            }
        ), 200
    except Exception as exc:
        logging.error("Metrics error: %s", exc)
        return jsonify({"error": "metrics unavailable"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3112, debug=True)
