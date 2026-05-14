"""HTTP tests for message routes."""

from __future__ import annotations

from fastapi.testclient import TestClient

from src.api_config import API_PREFIX


def _message_json(
    *,
    name: str = "Ayotomiwa Salau",
    email: str = "ayotomiwasalau@gmail.com",
    subject: str = "Hello",
    message: str = "Let's work together.",
) -> dict:
    return {
        "name": name,
        "email": email,
        "subject": subject,
        "message": message,
    }


def test_create_message_and_list_messages(client: TestClient) -> None:
    create = client.post(f"{API_PREFIX}/messages", json=_message_json())
    assert create.status_code == 200
    body = create.json()
    assert body["details"] == "Message received successfully."
    assert body["message"]["name"] == "Ayotomiwa Salau"
    assert body["message"]["email"] == "ayotomiwasalau@gmail.com"
    assert "id" in body["message"]
    assert "created_on" in body["message"]

    listed = client.get(f"{API_PREFIX}/messages", params={"page": 1, "per_page": 10})
    assert listed.status_code == 200
    payload = listed.json()
    assert payload["total"] == 1
    assert len(payload["messages"]) == 1
    assert payload["messages"][0]["subject"] == "Hello"


def test_messages_rejects_invalid_page(client: TestClient) -> None:
    response = client.get(f"{API_PREFIX}/messages", params={"page": 0})
    assert response.status_code == 422


def test_create_message_validates_required_fields(client: TestClient) -> None:
    payload = _message_json()
    del payload["message"]
    response = client.post(f"{API_PREFIX}/messages", json=payload)
    assert response.status_code == 422


def test_delete_message(client: TestClient) -> None:
    create = client.post(f"{API_PREFIX}/messages", json=_message_json(subject="To delete"))
    assert create.status_code == 200
    msg_id = create.json()["message"]["id"]

    deleted = client.delete(f"{API_PREFIX}/messages/{msg_id}")
    assert deleted.status_code == 200
    assert deleted.json()["id"] == msg_id

    listed = client.get(f"{API_PREFIX}/messages", params={"page": 1, "per_page": 10})
    assert listed.json()["total"] == 0


def test_delete_message_unknown_returns_404(client: TestClient) -> None:
    response = client.delete(f"{API_PREFIX}/messages/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404

