"""HTTP tests for image upload/replace/delete routes."""

from __future__ import annotations

from fastapi.testclient import TestClient

from src.api_config import API_PREFIX


def test_upload_blog_image(client: TestClient) -> None:
    response = client.post(
        f"{API_PREFIX}/images",
        data={"kind": "blog", "slug": "my-blog"},
        files={"file": ("hero.png", b"fake-png-bytes", "image/png")},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["kind"] == "blog"
    assert body["slug"] == "my-blog"
    assert body["image_name"] == "hero.png"
    assert body["image_url"] == "/images/blog/my-blog/hero.png"


def test_replace_project_image(client: TestClient) -> None:
    first = client.post(
        f"{API_PREFIX}/images",
        data={"kind": "project", "slug": "proj-a"},
        files={"file": ("diagram.webp", b"old", "image/webp")},
    )
    assert first.status_code == 200

    replaced = client.put(
        f"{API_PREFIX}/images/project/proj-a/diagram.webp",
        files={"file": ("diagram.webp", b"new", "image/webp")},
    )
    assert replaced.status_code == 200
    body = replaced.json()
    assert body["details"] == "Image replaced successfully."
    assert body["image_url"] == "/images/project/proj-a/diagram.webp"


def test_delete_image_returns_404_if_missing(client: TestClient) -> None:
    response = client.delete(f"{API_PREFIX}/images/blog/ghost/nope.png")
    assert response.status_code == 404
    assert response.json()["detail"] == "Image not found"


def test_reject_non_image_upload(client: TestClient) -> None:
    response = client.post(
        f"{API_PREFIX}/images",
        data={"kind": "blog", "slug": "oops"},
        files={"file": ("file.txt", b"hello", "text/plain")},
    )
    assert response.status_code == 422
    assert "image uploads" in response.json()["detail"].lower()


def test_list_images_includes_uploads(client: TestClient) -> None:
    upload = client.post(
        f"{API_PREFIX}/images",
        data={"kind": "blog", "slug": "list-me"},
        files={"file": ("shot.png", b"x", "image/png")},
    )
    assert upload.status_code == 200
    listed = client.get(f"{API_PREFIX}/images")
    assert listed.status_code == 200
    body = listed.json()
    slugs = {(i["kind"], i["slug"], i["image_name"]) for i in body["images"]}
    assert ("blog", "list-me", "shot.png") in slugs
    assert any(
        i["image_url"] == "/images/blog/list-me/shot.png" for i in body["images"]
    )


def test_list_images_kind_filter(client: TestClient) -> None:
    client.post(
        f"{API_PREFIX}/images",
        data={"kind": "blog", "slug": "only-blog"},
        files={"file": ("a.png", b"x", "image/png")},
    )
    client.post(
        f"{API_PREFIX}/images",
        data={"kind": "project", "slug": "only-proj"},
        files={"file": ("b.webp", b"x", "image/webp")},
    )
    blogs = client.get(f"{API_PREFIX}/images?kind=blog").json()["images"]
    assert all(row["kind"] == "blog" for row in blogs)
    projects = client.get(f"{API_PREFIX}/images?kind=project").json()["images"]
    assert all(row["kind"] == "project" for row in projects)
