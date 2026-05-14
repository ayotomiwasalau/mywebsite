"""HTTP tests for project routes."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi.testclient import TestClient

from src.api_config import API_PREFIX


def _project_json(
    *,
    id_: str = "proj-1",
    slug: str = "my-project",
    title: str = "Project title",
) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    return {
        "id": id_,
        "slug": slug,
        "title": title,
        "header_img_url": "https://example.com/p.png",
        "header_img_alt": "alt",
        "description": "Project desc",
        "tags": ["ml"],
        "href": "/projects/my-project",
        "filepath_md": "/p.md",
        "created_on": now,
        "updated_on": now,
        "shares": 0,
        "share_destination": "linkedin",
        "blog_url": "/posts/example",
    }


def test_get_project_by_slug_404_when_missing(client: TestClient) -> None:
    response = client.get(f"{API_PREFIX}/projects/no-such-project-slug")
    assert response.status_code == 404
    assert response.json() == {"detail": "Project not found"}


def test_create_project_conflict_duplicate_slug(client: TestClient) -> None:
    first = _project_json(id_="p1", slug="dup-slug")
    assert client.post(f"{API_PREFIX}/projects", json=first).status_code == 200
    second = _project_json(id_="p2", slug="dup-slug", title="Other")
    r2 = client.post(f"{API_PREFIX}/projects", json=second)
    assert r2.status_code == 409


def test_list_projects_rejects_invalid_page(client: TestClient) -> None:
    assert client.get(f"{API_PREFIX}/projects", params={"page": 0}).status_code == 422
