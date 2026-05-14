from .factory import get_database, get_db, init_database, shutdown_database
from .interface import DatabaseInterface

__all__ = (
    "DatabaseInterface",
    "DynamoDatabase",
    "MongoDatabase",
    "get_database",
    "get_db",
    "init_database",
    "shutdown_database",
)


def __getattr__(name: str):
    if name == "DynamoDatabase":
        from .dynamodb_database import DynamoDatabase as DynamoDatabaseCls

        return DynamoDatabaseCls
    if name == "MongoDatabase":
        from .mongo_database import MongoDatabase as MongoDatabaseCls

        return MongoDatabaseCls
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
