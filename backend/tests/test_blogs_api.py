"""HTTP tests for blog routes (edge cases; uses in-memory DB via conftest)."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi.testclient import TestClient

from src.api_config import API_PREFIX


def _blog_json(
    *,
    id_: str = "id-1",
    slug: str = "my-post",
    title: str = "Title",
) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    return {
        "id": id_,
        "slug": slug,
        "title": title,
        "header_img_url": "https://example.com/h.png",
        "header_img_alt": "alt",
        "description": "Desc",
        "tags": ["a"],
        "href": "/posts/my-post",
        "filepath_md": "/x.md",
        "created_on": now,
        "updated_on": now,
        "shares": 0,
        "share_destination": "linkedin",
        "project_url": "https://github.com/example",
    }


def test_list_blogs_rejects_page_below_one(client: TestClient) -> None:
    """``page`` must be >= 1 (Pydantic validation on query params)."""
    response = client.get(f"{API_PREFIX}/blogs", params={"page": 0})
    assert response.status_code == 422
    body = response.json()
    assert "detail" in body


def test_list_blogs_rejects_per_page_over_max(client: TestClient) -> None:
    """``per_page`` is capped at 100."""
    response = client.get(f"{API_PREFIX}/blogs", params={"per_page": 101})
    assert response.status_code == 422


def test_get_blog_by_slug_returns_404_when_missing(client: TestClient) -> None:
    """Unknown slug maps to ``BlogNotFoundError`` → 404 JSON."""
    response = client.get(f"{API_PREFIX}/blogs/does-not-exist")
    assert response.status_code == 404
    assert response.json() == {"detail": "Blog not found"}


def test_create_blog_conflict_when_slug_already_exists(
    client: TestClient,
) -> None:
    """Second POST with same slug must be 409."""
    first = _blog_json(id_="a1", slug="shared-slug")
    r1 = client.post(f"{API_PREFIX}/blogs", json=first)
    assert r1.status_code == 200

    second = _blog_json(id_="a2", slug="shared-slug", title="Other")
    r2 = client.post(f"{API_PREFIX}/blogs", json=second)
    assert r2.status_code == 409
    assert "slug" in r2.json()["detail"].lower()


def test_delete_blog_404_when_not_found(client: TestClient) -> None:
    """DELETE on a slug that was never created returns 404."""
    response = client.delete(f"{API_PREFIX}/blogs/never-seeded-slug")
    assert response.status_code == 404
    assert response.json()["detail"] == "Blog not found"
