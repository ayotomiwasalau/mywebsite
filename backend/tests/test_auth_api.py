"""HTTP tests for admin authentication and route protection."""

from __future__ import annotations

from fastapi.testclient import TestClient
import pytest

from src.api_config import API_PREFIX


def test_admin_login_returns_bearer_token(
    unauthenticated_client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("ADMIN_USERNAME", "admin")
    monkeypatch.setenv("ADMIN_PASSWORD", "secret")
    monkeypatch.setenv("JWT_SECRET", "test-jwt-secret")

    response = unauthenticated_client.post(
        f"{API_PREFIX}/auth/login",
        json={"username": "admin", "password": "secret"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["expires_in"] > 0


def test_admin_login_rejects_bad_credentials(
    unauthenticated_client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("ADMIN_USERNAME", "admin")
    monkeypatch.setenv("ADMIN_PASSWORD", "secret")

    response = unauthenticated_client.post(
        f"{API_PREFIX}/auth/login",
        json={"username": "admin", "password": "wrong"},
    )

    assert response.status_code == 401


def test_public_reads_do_not_require_authentication(
    unauthenticated_client: TestClient,
) -> None:
    response = unauthenticated_client.get(f"{API_PREFIX}/blogs")

    assert response.status_code == 200


def test_admin_write_requires_authentication(
    unauthenticated_client: TestClient,
) -> None:
    response = unauthenticated_client.post(f"{API_PREFIX}/blogs", json={})

    assert response.status_code == 401


def test_admin_me_returns_current_admin(client: TestClient) -> None:
    response = client.get(f"{API_PREFIX}/auth/me")

    assert response.status_code == 200
    assert response.json() == {"username": "admin", "role": "admin"}
