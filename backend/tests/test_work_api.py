"""Tests for ``GET /work`` merged feed."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

from src.api_config import API_PREFIX


def _dt(offset_days: int = 0) -> str:
    base = datetime(2026, 1, 15, 12, 0, 0, tzinfo=timezone.utc)
    return (base + timedelta(days=offset_days)).isoformat()


def _blog(slug: str, day: int) -> dict:
    return {
        "id": f"blog-{slug}",
        "slug": slug,
        "title": f"Blog {slug}",
        "header_img_url": "https://example.com/b.png",
        "header_img_alt": "b",
        "description": "d",
        "tags": [],
        "href": f"/work/blogs/{slug}",
        "filepath_md": "/b.md",
        "created_on": _dt(day),
        "updated_on": _dt(day),
        "feature": False,
        "feat_order": None,
        "shares": 0,
        "project_url": "https://github.com/x",
    }


def _project(slug: str, day: int) -> dict:
    return {
        "id": f"proj-{slug}",
        "slug": slug,
        "title": f"Project {slug}",
        "header_img_url": "https://example.com/p.png",
        "header_img_alt": "p",
        "description": "d",
        "tags": [],
        "href": f"/work/projects/{slug}",
        "filepath_md": "/p.md",
        "created_on": _dt(day),
        "updated_on": _dt(day),
        "feature": False,
        "feat_order": None,
        "shares": 0,
        "blog_url": "/work/blogs/x",
    }


def test_work_feed_sorted_newest_first(client: TestClient) -> None:
    client.post(f"{API_PREFIX}/blogs", json=_blog("older-blog", day=-10))
    client.post(f"{API_PREFIX}/projects", json=_project("newer-proj", day=5))
    r = client.get(f"{API_PREFIX}/work", params={"page": 1, "per_page": 10})
    assert r.status_code == 200
    data = r.json()
    assert data["total"] == 2
    types = [it["type"] for it in data["items"]]
    assert types[0] == "project"
    assert types[1] == "blog"


def test_work_pagination(client: TestClient) -> None:
    for i in range(3):
        client.post(f"{API_PREFIX}/blogs", json=_blog(f"b{i}", day=i))
    for j in range(3):
        client.post(f"{API_PREFIX}/projects", json=_project(f"p{j}", day=j + 10))
    r1 = client.get(f"{API_PREFIX}/work", params={"page": 1, "per_page": 2})
    assert r1.json()["total"] == 6
    assert len(r1.json()["items"]) == 2
    r2 = client.get(f"{API_PREFIX}/work", params={"page": 2, "per_page": 2})
    assert len(r2.json()["items"]) == 2
    seen = {r1.json()["items"][0]["item"]["slug"], r1.json()["items"][1]["item"]["slug"]}
    seen2 = {r2.json()["items"][0]["item"]["slug"], r2.json()["items"][1]["item"]["slug"]}
    assert seen.isdisjoint(seen2)


def test_work_invalid_page(client: TestClient) -> None:
    assert client.get(f"{API_PREFIX}/work", params={"page": 0}).status_code == 422


def test_work_summary(client: TestClient) -> None:
    client.post(f"{API_PREFIX}/blogs", json=_blog("summary-blog", day=1))
    client.post(f"{API_PREFIX}/projects", json=_project("summary-proj", day=2))
    client.post(
        f"{API_PREFIX}/messages",
        json={
            "name": "Jane Doe",
            "email": "jane@example.com",
            "subject": "Hello",
            "message": "Message body",
        },
    )
    client.post(
        f"{API_PREFIX}/subscribers",
        json={"name": "Jane Doe", "email": "subscriber@example.com"},
    )

    response = client.get(f"{API_PREFIX}/work-summary")

    assert response.status_code == 200
    assert response.json() == {
        "projects": 1,
        "blogs": 1,
        "subscribers": 1,
        "images": 2,
        "messages": 1,
    }


def test_work_featured_orders_by_feat_order(client: TestClient) -> None:
    b1 = _blog("featured-blog", day=1)
    b1["feature"] = True
    b1["feat_order"] = 2
    p1 = _project("featured-proj-1", day=2)
    p1["feature"] = True
    p1["feat_order"] = 1
    p2 = _project("featured-proj-2", day=3)
    p2["feature"] = True
    p2["feat_order"] = 3
    client.post(f"{API_PREFIX}/blogs", json=b1)
    client.post(f"{API_PREFIX}/projects", json=p1)
    client.post(f"{API_PREFIX}/projects", json=p2)

    response = client.get(f"{API_PREFIX}/work-featured")
    assert response.status_code == 200
    payload = response.json()
    assert [item["item"]["feat_order"] for item in payload["items"]] == [1, 2, 3]
