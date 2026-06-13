"""Minimal tests for PUBLIC_ROOT and S3 key prefix env handling."""

from __future__ import annotations

from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from src.filedisk.githubfilesystem import GitHubMarkdownFileSystem
from src.filedisk.localfiledisk import LocalFileDisk
from src.filedisk.s3filedisk import S3FileDisk


def test_local_file_disk_uses_public_root_from_env(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("PUBLIC_ROOT", "frontend/public")
    disk = LocalFileDisk()
    repo_root = Path(__file__).resolve().parents[2]
    assert disk._root == (repo_root / "frontend" / "public").resolve()


def test_github_from_env_uses_public_root_as_base_path(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("PUBLIC_ROOT", "frontend/public")
    monkeypatch.delenv("GITHUB_MARKDOWN_BASE_PATH", raising=False)
    monkeypatch.setenv("GITHUB_TOKEN", "test-token")
    monkeypatch.setenv("GITHUB_REPOSITORY", "owner/repo")
    fs = GitHubMarkdownFileSystem.from_env()
    assert fs._base_path == "frontend/public"


def test_s3_file_disk_uses_empty_prefix_when_key_prefix_unset(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("AWS_S3_MARKDOWN_BUCKET", "test-bucket")
    monkeypatch.setenv("MARKDOWN_CDN_BASE_URL", "https://example.com")
    monkeypatch.setenv("PUBLIC_ROOT", "frontend/public")
    monkeypatch.delenv("AWS_S3_MARKDOWN_KEY_PREFIX", raising=False)

    with patch("boto3.client", return_value=MagicMock()):
        disk = S3FileDisk.from_env()

    assert disk._key_prefix == ""
    assert disk._image_key("images/blog", "my-post", "cover.jpg") == (
        "images/blog/my-post/cover.jpg"
    )


def test_s3_file_disk_honours_explicit_key_prefix(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("AWS_S3_MARKDOWN_BUCKET", "test-bucket")
    monkeypatch.setenv("MARKDOWN_CDN_BASE_URL", "https://example.com")
    monkeypatch.setenv("AWS_S3_MARKDOWN_KEY_PREFIX", "uploads")

    with patch("boto3.client", return_value=MagicMock()):
        disk = S3FileDisk.from_env()

    assert disk._key_prefix == "uploads"
    assert disk._image_key("images/blog", "my-post", "cover.jpg") == (
        "uploads/images/blog/my-post/cover.jpg"
    )
