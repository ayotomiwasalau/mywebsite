from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from pathlib import Path

import main as main_module
from main import app
from src.database.factory import get_db
from src.filedisk import get_file_disk
from src.filedisk.localfiledisk import LocalFileDisk

from tests.fake_database import FakePortfolioDatabase


@pytest.fixture
def fake_db() -> FakePortfolioDatabase:
    return FakePortfolioDatabase()


@pytest.fixture
def client(
    fake_db: FakePortfolioDatabase, monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> Generator[TestClient, None, None]:
    monkeypatch.setattr(main_module, "init_database", lambda: None)
    monkeypatch.setattr(main_module, "shutdown_database", lambda: None)

    def override_get_db() -> Generator[FakePortfolioDatabase, None, None]:
        yield fake_db

    def override_get_file_disk() -> LocalFileDisk:
        return LocalFileDisk(public_root=tmp_path / "public")

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_file_disk] = override_get_file_disk
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
