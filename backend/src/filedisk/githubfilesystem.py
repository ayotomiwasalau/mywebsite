"""Store markdown files in GitHub via the Contents API."""

from __future__ import annotations

import base64
import json
import os
from dataclasses import dataclass
from typing import Any
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.request import Request, urlopen

from .filediskinterface import FileDiskInterface
from .utils import (
    MARKDOWN_BLOG_DIR,
    MARKDOWN_BLOG_URL_PREFIX,
    MARKDOWN_PROJECT_DIR,
    MARKDOWN_PROJECT_URL_PREFIX,
    assert_allowed_markdown_basename,
)


class GitHubMarkdownFileSystem:
    """Write markdown files to a GitHub repository."""

    def __init__(
        self,
        *,
        token: str,
        repository: str,
        branch: str = "main",
        base_path: str = "",
        public_base_url: str | None = None,
    ) -> None:
        if "/" not in repository:
            raise ValueError("GITHUB_REPOSITORY must use the format 'owner/repo'.")
        self._token = token
        self._repository = repository.strip("/")
        self._branch = branch
        self._base_path = base_path.strip("/")
        self._public_base_url = (
            public_base_url.rstrip("/")
            if public_base_url
            else f"https://raw.githubusercontent.com/{self._repository}/{self._branch}"
        )

    @classmethod
    def from_env(cls) -> "GitHubMarkdownFileSystem":
        token = os.environ.get("GITHUB_TOKEN", "").strip()
        if not token:
            raise ValueError("GITHUB_TOKEN is required when MARKDOWN_FILE_BACKEND=github")
        repository = os.environ.get("GITHUB_REPOSITORY", "").strip()
        if not repository:
            raise ValueError("GITHUB_REPOSITORY is required when MARKDOWN_FILE_BACKEND=github")
        return cls(
            token=token,
            repository=repository,
            branch=os.environ.get("GITHUB_BRANCH", "main").strip() or "main",
            base_path=os.environ.get("GITHUB_MARKDOWN_BASE_PATH", "").strip(),
            public_base_url=os.environ.get("GITHUB_MARKDOWN_PUBLIC_BASE_URL", "").strip()
            or None,
        )

    def write_blog_markdown(self, basename: str, content: str) -> str:
        safe = assert_allowed_markdown_basename(basename)
        path = self._github_path(MARKDOWN_BLOG_DIR, safe)
        self._put_file(path, content, f"Save blog markdown: {safe}")
        return self._public_url(MARKDOWN_BLOG_URL_PREFIX, safe)

    def write_project_markdown(self, basename: str, content: str) -> str:
        safe = assert_allowed_markdown_basename(basename)
        path = self._github_path(MARKDOWN_PROJECT_DIR, safe)
        self._put_file(path, content, f"Save project markdown: {safe}")
        return self._public_url(MARKDOWN_PROJECT_URL_PREFIX, safe)

    def _github_path(self, subdir: str, basename: str) -> str:
        parts = [p for p in (self._base_path, subdir, basename) if p]
        return "/".join(parts)

    def _public_url(self, url_prefix: str, basename: str) -> str:
        # Preserve the existing public path when a CDN/frontend serves markdowns.
        if os.environ.get("GITHUB_MARKDOWN_RETURN_PUBLIC_PATH", "").lower() in {
            "1",
            "true",
            "yes",
        }:
            return f"{url_prefix}/{basename}"
        path = self._github_path(url_prefix.strip("/"), basename)
        quoted_path = "/".join(quote(part) for part in path.split("/"))
        return f"{self._public_base_url}/{quoted_path}"

    def _api_url(self, path: str) -> str:
        quoted_path = "/".join(quote(part) for part in path.split("/"))
        return f"https://api.github.com/repos/{self._repository}/contents/{quoted_path}"

    def _request(
        self,
        method: str,
        url: str,
        *,
        body: dict[str, Any] | None = None,
    ) -> dict[str, Any] | None:
        data = json.dumps(body).encode("utf-8") if body is not None else None
        request = Request(
            url,
            data=data,
            method=method,
            headers={
                "Accept": "application/vnd.github+json",
                "Authorization": f"Bearer {self._token}",
                "Content-Type": "application/json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
        )
        try:
            with urlopen(request, timeout=30) as response:
                raw = response.read().decode("utf-8")
                return json.loads(raw) if raw else None
        except HTTPError as e:
            if e.code == 404:
                return None
            detail = e.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"GitHub API request failed: {e.code} {detail}") from e

    def _existing_sha(self, path: str) -> str | None:
        url = f"{self._api_url(path)}?ref={quote(self._branch)}"
        payload = self._request("GET", url)
        if not payload:
            return None
        sha = payload.get("sha")
        return sha if isinstance(sha, str) else None

    def _put_file(self, path: str, content: str, message: str) -> None:
        body: dict[str, Any] = {
            "message": message,
            "content": base64.b64encode(content.encode("utf-8")).decode("ascii"),
            "branch": self._branch,
        }
        sha = self._existing_sha(path)
        if sha:
            body["sha"] = sha

        author = _GitHubAuthor.from_env()
        if author:
            body["committer"] = author.as_payload()
            body["author"] = author.as_payload()

        self._request("PUT", self._api_url(path), body=body)


@dataclass(frozen=True)
class _GitHubAuthor:
    name: str
    email: str

    @classmethod
    def from_env(cls) -> "_GitHubAuthor | None":
        name = os.environ.get("GITHUB_COMMIT_AUTHOR_NAME", "").strip()
        email = os.environ.get("GITHUB_COMMIT_AUTHOR_EMAIL", "").strip()
        if not name or not email:
            return None
        return cls(name=name, email=email)

    def as_payload(self) -> dict[str, str]:
        return {"name": self.name, "email": self.email}


class SplitFileDisk:
    """Use one backend for markdown and another for images."""

    def __init__(self, markdown_disk: Any, image_disk: FileDiskInterface) -> None:
        self._markdown_disk = markdown_disk
        self._image_disk = image_disk

    def write_blog_markdown(self, basename: str, content: str) -> str:
        return self._markdown_disk.write_blog_markdown(basename, content)

    def write_project_markdown(self, basename: str, content: str) -> str:
        return self._markdown_disk.write_project_markdown(basename, content)

    def save_blog_image(self, slug: str, image_name: str, content: bytes) -> str:
        return self._image_disk.save_blog_image(slug, image_name, content)

    def save_project_image(self, slug: str, image_name: str, content: bytes) -> str:
        return self._image_disk.save_project_image(slug, image_name, content)

    def delete_blog_image(self, slug: str, image_name: str) -> bool:
        return self._image_disk.delete_blog_image(slug, image_name)

    def delete_project_image(self, slug: str, image_name: str) -> bool:
        return self._image_disk.delete_project_image(slug, image_name)

    def list_blog_images(self) -> list[tuple[str, str, str]]:
        return self._image_disk.list_blog_images()

    def list_project_images(self) -> list[tuple[str, str, str]]:
        return self._image_disk.list_project_images()
