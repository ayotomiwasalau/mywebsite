"""Resolve active markdown and image storage backends from environment."""

from __future__ import annotations

import os

from .filediskinterface import FileDiskInterface
from .githubfilesystem import GitHubMarkdownFileSystem, SplitFileDisk
from .localfiledisk import LocalFileDisk
from .s3filedisk import S3FileDisk


def get_file_disk() -> FileDiskInterface:
    """
    ``FILE_DISK_BACKEND`` controls image storage:

    - ``local`` (default): write under ``MARKDOWN_PUBLIC_ROOT`` or ``frontend/public``.
    - ``s3``: use ``S3FileDisk`` for image uploads.

    ``MARKDOWN_FILE_BACKEND`` controls markdown storage:

    - ``local`` (default): use the same local disk implementation.
    - ``github``: commit markdown files to GitHub and delegate images to ``FILE_DISK_BACKEND``.
    """
    image_kind = os.environ.get("FILE_DISK_BACKEND", "local").lower().strip()
    markdown_kind = os.environ.get("MARKDOWN_FILE_BACKEND", image_kind).lower().strip()

    image_disk: FileDiskInterface
    if image_kind == "s3":
        image_disk = S3FileDisk.from_env()
    else:
        image_disk = LocalFileDisk()

    if markdown_kind == "github":
        return SplitFileDisk(GitHubMarkdownFileSystem.from_env(), image_disk)
    if markdown_kind == "s3":
        raise ValueError("S3 markdown storage has moved to GitHub. Use MARKDOWN_FILE_BACKEND=github.")
    return image_disk
