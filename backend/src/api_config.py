"""Versioned REST route prefix (``/api/{version}/…``).

Set ``API_VERSION`` in the environment to change the segment (default ``v1``).
Unsafe values fall back to ``v1``.
"""

from __future__ import annotations

import os
import re

_raw = os.environ.get("API_VERSION", "v1").strip().strip("/") or "v1"
SAFE_VERSION = re.fullmatch(r"[a-zA-Z0-9][a-zA-Z0-9._-]{0,30}", _raw)
API_VERSION = _raw if SAFE_VERSION else "v1"
API_PREFIX = f"/api/{API_VERSION}"
