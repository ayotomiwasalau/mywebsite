"""Versioned REST route prefix (``/api/{version}/…``). Mirrors ``backend/src/api_config.py``."""

from __future__ import annotations

import os
import re

_raw = os.environ.get("API_VERSION", "v1").strip().strip("/") or "v1"
SAFE_VERSION = re.fullmatch(r"[a-zA-Z0-9][a-zA-Z0-9._-]{0,30}", _raw)
API_VERSION = _raw if SAFE_VERSION else "v1"
API_PREFIX = f"/api/{API_VERSION}"
GAMES_PREFIX = f"{API_PREFIX}/games"
