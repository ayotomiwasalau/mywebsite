import os
from typing import Any, Generator, Optional

from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database as MongoDb

from .utils import (
    document_to_model,
    model_to_jsonable_dict,
    strip_mongo_id,
)
from .interface import DatabaseInterface
from .models import Blog, Message, Project, Subscriber


class MongoDatabase(DatabaseInterface):
    """MongoDB via PyMongo."""

    def __init__(
        self,
        mongodb_uri: Optional[str] = None,
        database_name: Optional[str] = None,
    ) -> None:
        self._uri = mongodb_uri or os.environ.get(
            "MONGODB_URI",
            "mongodb://localhost:2701",
        )
        self._database_name = database_name or os.environ.get(
            "MONGODB_DB",
            "portfolio",
        )
        self._client: MongoClient[Any] = MongoClient(self._uri)
        self._db: MongoDb[Any] = self._client[self._database_name]

    def ensure_initialized(self) -> None:
        """Ping server; ensure collections exist (via indexes) and indexes for queries."""
        self._client.admin.command("ping")
        # Creating an index materializes the collection if it does not exist yet.
        self.blogs.create_index("id", unique=True)
        self.blogs.create_index("slug", unique=True)
        self.blogs.create_index([("created_on", -1)])
        self.blogs.create_index([("feature", 1), ("feat_order", 1), ("created_on", -1)])
        self.projects.create_index("id", unique=True)
        self.projects.create_index("slug", unique=True)
        self.projects.create_index([("created_on", -1)])
        self.projects.create_index([("feature", 1), ("feat_order", 1), ("created_on", -1)])
        self.messages.create_index("id", unique=True)
        self.messages.create_index([("created_on", -1)])
        self.subscribers.create_index("id", unique=True)
        self.subscribers.create_index("email", unique=True)
        self.subscribers.create_index([("created_on", -1)])

    @property
    def blogs(self) -> Collection[Any]:
        return self._db["blogs"]

    @property
    def projects(self) -> Collection[Any]:
        return self._db["projects"]

    @property
    def messages(self) -> Collection[Any]:
        return self._db["messages"]

    @property
    def subscribers(self) -> Collection[Any]:
        return self._db["subscribers"]

    def create_tables(self) -> None:
        """No-op: collections are created on first write."""

    def session(self) -> Generator[MongoDb[Any], None, None]:
        """Yield the PyMongo database handle."""
        yield self._db

    def close(self) -> None:
        self._client.close()

    def get_blog(self, blog_id: str) -> Optional[dict[str, Any]]:
        doc = self.blogs.find_one({"id": blog_id})
        if doc is None:
            return None
        model = document_to_model(doc, Blog)
        return model_to_jsonable_dict(model)

    def get_blog_by_slug(self, slug: str) -> Optional[dict[str, Any]]:
        doc = self.blogs.find_one({"slug": slug})
        if doc is None:
            return None
        model = document_to_model(doc, Blog)
        return model_to_jsonable_dict(model)

    def update_blog_by_slug(
        self, slug: str, data: dict[str, Any]
    ) -> Optional[dict[str, Any]]:
        doc = self.blogs.find_one({"slug": slug})
        if doc is None:
            return None
        existing = strip_mongo_id(doc)
        merged = {**existing, **data}
        merged["id"] = existing["id"]
        model = Blog.model_validate(merged)
        storage = model.model_dump(mode="python")
        self.blogs.replace_one({"_id": doc["_id"]}, storage)
        return model_to_jsonable_dict(model)

    def delete_blog_by_slug(self, slug: str) -> bool:
        result = self.blogs.delete_one({"slug": slug})
        return result.deleted_count > 0

    def get_project(self, project_id: str) -> Optional[dict[str, Any]]:
        doc = self.projects.find_one({"id": project_id})
        if doc is None:
            return None
        model = document_to_model(doc, Project)
        return model_to_jsonable_dict(model)

    def get_project_by_slug(self, slug: str) -> Optional[dict[str, Any]]:
        doc = self.projects.find_one({"slug": slug})
        if doc is None:
            return None
        model = document_to_model(doc, Project)
        return model_to_jsonable_dict(model)

    def update_project_by_slug(
        self, slug: str, data: dict[str, Any]
    ) -> Optional[dict[str, Any]]:
        doc = self.projects.find_one({"slug": slug})
        if doc is None:
            return None
        existing = strip_mongo_id(doc)
        merged = {**existing, **data}
        merged["id"] = existing["id"]
        model = Project.model_validate(merged)
        storage = model.model_dump(mode="python")
        self.projects.replace_one({"_id": doc["_id"]}, storage)
        return model_to_jsonable_dict(model)

    def delete_project_by_slug(self, slug: str) -> bool:
        result = self.projects.delete_one({"slug": slug})
        return result.deleted_count > 0

    def insert_blog(self, blog: dict[str, Any]) -> None:
        self.blogs.insert_one(blog)

    def insert_project(self, project: dict[str, Any]) -> None:
        self.projects.insert_one(project)

    def insert_message(self, message: dict[str, Any]) -> None:
        self.messages.insert_one(message)

    def insert_subscriber(self, subscriber: dict[str, Any]) -> None:
        self.subscribers.insert_one(subscriber)

    def list_blogs(
        self, page: int = 1, per_page: int = 10
    ) -> tuple[list[dict[str, Any]], int]:
        p = max(1, page)
        n = max(1, min(per_page, 100))
        total = self.blogs.count_documents({})
        cursor = (
            self.blogs.find()
            .sort("created_on", -1)
            .skip((p - 1) * n)
            .limit(n)
        )
        items = [
            model_to_jsonable_dict(document_to_model(doc, Blog)) for doc in cursor
        ]
        return items, total

    def list_projects(
        self, page: int = 1, per_page: int = 10
    ) -> tuple[list[dict[str, Any]], int]:
        p = max(1, page)
        n = max(1, min(per_page, 100))
        total = self.projects.count_documents({})
        cursor = (
            self.projects.find()
            .sort("created_on", -1)
            .skip((p - 1) * n)
            .limit(n)
        )
        items = [
            model_to_jsonable_dict(document_to_model(doc, Project))
            for doc in cursor
        ]
        return items, total

    def list_work(
        self, page: int = 1, per_page: int = 10
    ) -> tuple[list[dict[str, Any]], int]:
        p = max(1, page)
        n = max(1, min(per_page, 100))
        skip = (p - 1) * n
        pipeline: list[dict[str, Any]] = [
            {"$addFields": {"work_type": "blog"}},
            {
                "$unionWith": {
                    "coll": "projects",
                    "pipeline": [
                        {"$addFields": {"work_type": "project"}},
                    ],
                }
            },
            {"$sort": {"created_on": -1}},
            {
                "$facet": {
                    "rows": [{"$skip": skip}, {"$limit": n}],
                    "total_count": [{"$count": "n"}],
                }
            },
        ]
        agg = self.blogs.aggregate(pipeline)
        doc = next(agg, None)
        if not doc:
            return [], 0
        rows_raw = doc.get("rows") or []
        total_list = doc.get("total_count") or []
        total = int(total_list[0]["n"]) if total_list else 0
        items: list[dict[str, Any]] = []
        for raw in rows_raw:
            clean = strip_mongo_id(dict(raw))
            wt = clean.pop("work_type", None)
            if wt == "blog":
                model = Blog.model_validate(clean)
            elif wt == "project":
                model = Project.model_validate(clean)
            else:
                continue
            payload = model_to_jsonable_dict(model)
            items.append({"type": wt, "item": payload})
        return items, total

    def list_work_featured(self) -> list[dict[str, Any]]:
        pipeline: list[dict[str, Any]] = [
            {"$match": {"feature": True, "feat_order": {"$ne": None}}},
            {"$addFields": {"work_type": "blog"}},
            {
                "$unionWith": {
                    "coll": "projects",
                    "pipeline": [
                        {"$match": {"feature": True, "feat_order": {"$ne": None}}},
                        {"$addFields": {"work_type": "project"}},
                    ],
                }
            },
            {"$sort": {"feat_order": 1, "created_on": -1}},
            {"$limit": 3},
        ]
        rows_raw = list(self.blogs.aggregate(pipeline))
        items: list[dict[str, Any]] = []
        for raw in rows_raw:
            clean = strip_mongo_id(dict(raw))
            wt = clean.pop("work_type", None)
            if wt == "blog":
                model = Blog.model_validate(clean)
            elif wt == "project":
                model = Project.model_validate(clean)
            else:
                continue
            payload = model_to_jsonable_dict(model)
            items.append({"type": wt, "item": payload})
        return items

    def get_work_summary(self) -> dict[str, int]:
        image_pipeline: list[dict[str, Any]] = [
            {"$project": {"image": "$header_img_url"}},
            {
                "$unionWith": {
                    "coll": "projects",
                    "pipeline": [{"$project": {"image": "$header_img_url"}}],
                }
            },
            {"$match": {"image": {"$type": "string", "$ne": ""}}},
            {"$group": {"_id": "$image"}},
            {"$count": "n"},
        ]
        images_count_doc = next(self.blogs.aggregate(image_pipeline), None)

        return {
            "projects": self.projects.count_documents({}),
            "blogs": self.blogs.count_documents({}),
            "subscribers": self.subscribers.count_documents({}),
            "images": int(images_count_doc["n"]) if images_count_doc else 0,
            "messages": self.messages.count_documents({}),
        }

    def list_messages(
        self, page: int = 1, per_page: int = 10
    ) -> tuple[list[dict[str, Any]], int]:
        p = max(1, page)
        n = max(1, min(per_page, 100))
        total = self.messages.count_documents({})
        cursor = (
            self.messages.find()
            .sort("created_on", -1)
            .skip((p - 1) * n)
            .limit(n)
        )
        items = [
            model_to_jsonable_dict(document_to_model(doc, Message))
            for doc in cursor
        ]
        return items, total

    def delete_message_by_id(self, message_id: str) -> bool:
        result = self.messages.delete_one({"id": message_id})
        return result.deleted_count == 1

    def get_subscriber_by_email(self, email: str) -> Optional[dict[str, Any]]:
        doc = self.subscribers.find_one({"email": email})
        if doc is None:
            return None
        model = document_to_model(doc, Subscriber)
        return model_to_jsonable_dict(model)

    def delete_subscriber_by_id(self, subscriber_id: str) -> bool:
        result = self.subscribers.delete_one({"id": subscriber_id})
        return result.deleted_count == 1

    def list_subscribers(
        self, page: int = 1, per_page: int = 10
    ) -> tuple[list[dict[str, Any]], int]:
        p = max(1, page)
        n = max(1, min(per_page, 100))
        total = self.subscribers.count_documents({})
        cursor = (
            self.subscribers.find()
            .sort("created_on", -1)
            .skip((p - 1) * n)
            .limit(n)
        )
        items = [
            model_to_jsonable_dict(document_to_model(doc, Subscriber))
            for doc in cursor
        ]
        return items, total
