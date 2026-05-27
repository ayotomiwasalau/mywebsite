from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import os
import secrets

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

_ALGORITHM = "HS256"
_bearer = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class AdminPrincipal:
    username: str
    role: str = "admin"


def hash_password(password: str, *, salt: str | None = None) -> str:
    salt_value = salt or secrets.token_hex(16)
    digest = hashlib.sha256(f"{salt_value}:{password}".encode("utf-8")).hexdigest()
    return f"sha256${salt_value}${digest}"


def _verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, salt, expected = stored_hash.split("$", 2)
    except ValueError:
        return False
    if algorithm != "sha256":
        return False
    candidate = hash_password(password, salt=salt).split("$", 2)[2]
    return hmac.compare_digest(candidate, expected)


def _jwt_secret() -> str:
    secret = os.environ.get("JWT_SECRET", "").strip()
    if not secret:
        raise RuntimeError("JWT_SECRET is required for admin authentication.")
    return secret


def _token_expiry_minutes() -> int:
    raw = os.environ.get("JWT_EXPIRES_MINUTES", "60").strip()
    try:
        return max(1, int(raw))
    except ValueError:
        return 60


def verify_admin_credentials(username: str, password: str) -> bool:
    expected_username = os.environ.get("ADMIN_USERNAME", "").strip()
    if not expected_username or not hmac.compare_digest(username, expected_username):
        return False

    password_hash = os.environ.get("ADMIN_PASSWORD_HASH", "").strip()
    if password_hash:
        return _verify_password(password, password_hash)

    # Local development fallback. Prefer ADMIN_PASSWORD_HASH in deployed environments.
    plain_password = os.environ.get("ADMIN_PASSWORD", "")
    return bool(plain_password) and hmac.compare_digest(password, plain_password)


def create_access_token(username: str) -> tuple[str, int]:
    expires_minutes = _token_expiry_minutes()
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=expires_minutes)
    payload = {
        "sub": username,
        "role": "admin",
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=_ALGORITHM), expires_minutes * 60


def require_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> AdminPrincipal:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(credentials.credentials, _jwt_secret(), algorithms=[_ALGORITHM])
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired admin token.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e

    username = payload.get("sub")
    role = payload.get("role")
    if not isinstance(username, str) or role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin authorization required.",
        )
    return AdminPrincipal(username=username, role=role)
