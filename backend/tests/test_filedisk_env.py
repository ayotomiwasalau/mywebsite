"""Minimal tests for PUBLIC_ROOT env handling."""

from __future__ import annotations

from pathlib import Path

import pytest

from src.filedisk.githubfilesystem import GitHubMarkdownFileSystem
from src.filedisk.localfiledisk import LocalFileDisk


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
