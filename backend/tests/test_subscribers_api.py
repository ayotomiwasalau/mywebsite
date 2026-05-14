"""HTTP tests for subscriber routes."""

from __future__ import annotations

from uuid import UUID

from fastapi.testclient import TestClient

from src.api_config import API_PREFIX


def _subscriber_json(
    *,
    email: str = "ayotomiwasalau@gmail.com",
    name: str = "Ayotomiwa Salau",
) -> dict:
    return {
        "email": email,
        "name": name,
    }


def test_create_subscriber_and_list_subscribers(client: TestClient) -> None:
    create = client.post(f"{API_PREFIX}/subscribers", json=_subscriber_json())
    assert create.status_code == 200
    body = create.json()
    assert body["details"] == "Subscriber added successfully."
    assert body["subscriber"]["email"] == "ayotomiwasalau@gmail.com"
    assert body["subscriber"]["name"] == "Ayotomiwa Salau"
    assert "id" in body["subscriber"]
    assert "created_on" in body["subscriber"]

    listed = client.get(f"{API_PREFIX}/subscribers", params={"page": 1, "per_page": 10})
    assert listed.status_code == 200
    payload = listed.json()
    assert payload["total"] == 1
    assert len(payload["subscribers"]) == 1
    assert payload["subscribers"][0]["email"] == "ayotomiwasalau@gmail.com"


def test_subscribers_rejects_invalid_page(client: TestClient) -> None:
    response = client.get(f"{API_PREFIX}/subscribers", params={"page": 0})
    assert response.status_code == 422


def test_create_subscriber_conflict_duplicate_email(client: TestClient) -> None:
    first = client.post(f"{API_PREFIX}/subscribers", json=_subscriber_json())
    assert first.status_code == 200
    second = client.post(f"{API_PREFIX}/subscribers", json=_subscriber_json())
    assert second.status_code == 409
    assert "email" in second.json()["detail"].lower()


def test_delete_subscriber_by_id(client: TestClient) -> None:
    email = "remove-me@example.com"
    created = client.post(f"{API_PREFIX}/subscribers", json=_subscriber_json(email=email, name="Tmp"))
    assert created.status_code == 200
    subscriber_id = created.json()["subscriber"]["id"]
    UUID(subscriber_id)  # sanity: create uses uuid4 string

    deleted = client.delete(f"{API_PREFIX}/subscribers/{subscriber_id}")
    assert deleted.status_code == 200
    body = deleted.json()
    assert body["id"] == subscriber_id
    assert "deleted" in body["details"].lower()

    listed = client.get(f"{API_PREFIX}/subscribers", params={"page": 1, "per_page": 100})
    assert listed.status_code == 200
    ids = [s["id"] for s in listed.json()["subscribers"]]
    assert subscriber_id not in ids


def test_delete_subscriber_404_when_unknown_id(client: TestClient) -> None:
    resp = client.delete(
        f"{API_PREFIX}/subscribers/00000000-0000-0000-0000-000000000000",
    )
    assert resp.status_code == 404

