from __future__ import annotations

import os
from datetime import datetime
from decimal import Decimal
from typing import Any, Optional

import boto3
from boto3.dynamodb.conditions import Attr
from botocore.exceptions import ClientError

from .interface import DatabaseInterface
from .models import Blog, Message, Project, Subscriber
from .utils import document_to_model, model_to_jsonable_dict


class DynamoDatabase(DatabaseInterface):
    """DynamoDB implementation of the portfolio database contract."""

    _SK = "METADATA"
    _INTERNAL_KEYS = {"PK", "SK", "GSI1PK", "GSI1SK", "entity_type"}

    def __init__(
        self,
        table_name: Optional[str] = None,
        region_name: Optional[str] = None,
    ) -> None:
        self._table_name = table_name or os.environ.get(
            "APP_TABLE_NAME",
            os.environ.get("DYNAMODB_TABLE_NAME", ""),
        )
        if not self._table_name:
            raise ValueError("APP_TABLE_NAME is required for DynamoDatabase.")
        self._dynamodb = boto3.resource("dynamodb", region_name=region_name)
        self._table = self._dynamodb.Table(self._table_name)

    def ensure_initialized(self) -> None:
        """Verify the configured table exists and is reachable."""
        self._table.load()

    def close(self) -> None:
        pass

    def get_blog(self, blog_id: str) -> Optional[dict[str, Any]]:
        doc = self._get_entity("blog", blog_id)
        return self._to_model_dict(doc, Blog) if doc else None

    def get_blog_by_slug(self, slug: str) -> Optional[dict[str, Any]]:
        doc = self._find_one("blog", "slug", slug)
        return self._to_model_dict(doc, Blog) if doc else None

    def update_blog_by_slug(
        self, slug: str, data: dict[str, Any]
    ) -> Optional[dict[str, Any]]:
        existing = self._find_one("blog", "slug", slug)
        if existing is None:
            return None
        merged = {**existing, **data}
        merged["id"] = existing["id"]
        model = Blog.model_validate(merged)
        self._put_entity("blog", model.model_dump(mode="python"))
        return model_to_jsonable_dict(model)

    def delete_blog_by_slug(self, slug: str) -> bool:
        existing = self._find_one("blog", "slug", slug)
        if existing is None:
            return False
        return self._delete_entity("blog", existing["id"])

    def get_project(self, project_id: str) -> Optional[dict[str, Any]]:
        doc = self._get_entity("project", project_id)
        return self._to_model_dict(doc, Project) if doc else None

    def get_project_by_slug(self, slug: str) -> Optional[dict[str, Any]]:
        doc = self._find_one("project", "slug", slug)
        return self._to_model_dict(doc, Project) if doc else None

    def update_project_by_slug(
        self, slug: str, data: dict[str, Any]
    ) -> Optional[dict[str, Any]]:
        existing = self._find_one("project", "slug", slug)
        if existing is None:
            return None
        merged = {**existing, **data}
        merged["id"] = existing["id"]
        model = Project.model_validate(merged)
        self._put_entity("project", model.model_dump(mode="python"))
        return model_to_jsonable_dict(model)

    def delete_project_by_slug(self, slug: str) -> bool:
        existing = self._find_one("project", "slug", slug)
        if existing is None:
            return False
        return self._delete_entity("project", existing["id"])

    def insert_blog(self, blog: dict[str, Any]) -> None:
        self._put_entity("blog", blog, require_new=True)

    def insert_project(self, project: dict[str, Any]) -> None:
        self._put_entity("project", project, require_new=True)

    def insert_message(self, message: dict[str, Any]) -> None:
        self._put_entity("message", message, require_new=True)

    def insert_subscriber(self, subscriber: dict[str, Any]) -> None:
        self._put_entity("subscriber", subscriber, require_new=True)

    def list_blogs(
        self, page: int = 1, per_page: int = 10
    ) -> tuple[list[dict[str, Any]], int]:
        rows = self._list_entities("blog")
        rows.sort(key=lambda x: x["created_on"], reverse=True)
        page_rows = self._page(rows, page, per_page)
        return [self._to_model_dict(row, Blog) for row in page_rows], len(rows)

    def list_projects(
        self, page: int = 1, per_page: int = 10
    ) -> tuple[list[dict[str, Any]], int]:
        rows = self._list_entities("project")
        rows.sort(key=lambda x: x["created_on"], reverse=True)
        page_rows = self._page(rows, page, per_page)
        return [self._to_model_dict(row, Project) for row in page_rows], len(rows)

    def list_work(
        self, page: int = 1, per_page: int = 10
    ) -> tuple[list[dict[str, Any]], int]:
        combined: list[tuple[str, dict[str, Any]]] = [
            ("blog", row) for row in self._list_entities("blog")
        ] + [("project", row) for row in self._list_entities("project")]
        combined.sort(key=lambda x: x[1]["created_on"], reverse=True)
        page_rows = self._page(combined, page, per_page)
        items: list[dict[str, Any]] = []
        for kind, row in page_rows:
            model_cls = Blog if kind == "blog" else Project
            items.append({"type": kind, "item": self._to_model_dict(row, model_cls)})
        return items, len(combined)

    def list_work_featured(self) -> list[dict[str, Any]]:
        combined: list[tuple[str, dict[str, Any]]] = [
            ("blog", row)
            for row in self._list_entities("blog")
            if row.get("feature") is True and row.get("feat_order") is not None
        ] + [
            ("project", row)
            for row in self._list_entities("project")
            if row.get("feature") is True and row.get("feat_order") is not None
        ]
        combined.sort(
            key=lambda x: (x[1]["feat_order"], self._reverse_sort_value(x[1]["created_on"]))
        )
        items: list[dict[str, Any]] = []
        for kind, row in combined[:3]:
            model_cls = Blog if kind == "blog" else Project
            items.append({"type": kind, "item": self._to_model_dict(row, model_cls)})
        return items

    def get_work_summary(self) -> dict[str, int]:
        blogs = self._list_entities("blog")
        projects = self._list_entities("project")
        image_urls = {
            row.get("header_img_url")
            for row in [*blogs, *projects]
            if row.get("header_img_url")
        }
        return {
            "projects": len(projects),
            "blogs": len(blogs),
            "subscribers": len(self._list_entities("subscriber")),
            "images": len(image_urls),
            "messages": len(self._list_entities("message")),
        }

    def list_messages(
        self, page: int = 1, per_page: int = 10
    ) -> tuple[list[dict[str, Any]], int]:
        rows = self._list_entities("message")
        rows.sort(key=lambda x: x["created_on"], reverse=True)
        page_rows = self._page(rows, page, per_page)
        return [self._to_model_dict(row, Message) for row in page_rows], len(rows)

    def delete_message_by_id(self, message_id: str) -> bool:
        return self._delete_entity("message", message_id)

    def get_subscriber_by_email(self, email: str) -> Optional[dict[str, Any]]:
        doc = self._find_one("subscriber", "email", email)
        return self._to_model_dict(doc, Subscriber) if doc else None

    def delete_subscriber_by_id(self, subscriber_id: str) -> bool:
        return self._delete_entity("subscriber", subscriber_id)

    def list_subscribers(
        self, page: int = 1, per_page: int = 10
    ) -> tuple[list[dict[str, Any]], int]:
        rows = self._list_entities("subscriber")
        rows.sort(key=lambda x: x["created_on"], reverse=True)
        page_rows = self._page(rows, page, per_page)
        return [self._to_model_dict(row, Subscriber) for row in page_rows], len(rows)

    def _entity_pk(self, entity_type: str, entity_id: str) -> str:
        return f"{entity_type.upper()}#{entity_id}"

    def _clean_item(self, item: dict[str, Any]) -> dict[str, Any]:
        return {k: self._from_dynamodb(v) for k, v in item.items() if k not in self._INTERNAL_KEYS}

    def _to_model_dict(self, doc: dict[str, Any], model_cls: type[Any]) -> dict[str, Any]:
        return model_to_jsonable_dict(document_to_model(doc, model_cls))

    def _put_entity(
        self,
        entity_type: str,
        payload: dict[str, Any],
        *,
        require_new: bool = False,
    ) -> None:
        entity_id = str(payload["id"])
        item = {
            **self._to_dynamodb(payload),
            "PK": self._entity_pk(entity_type, entity_id),
            "SK": self._SK,
            "entity_type": entity_type,
            "GSI1PK": entity_type.upper(),
            "GSI1SK": self._sort_key(payload),
        }
        kwargs: dict[str, Any] = {"Item": item}
        if require_new:
            kwargs["ConditionExpression"] = "attribute_not_exists(PK)"
        try:
            self._table.put_item(**kwargs)
        except ClientError as e:
            if e.response.get("Error", {}).get("Code") == "ConditionalCheckFailedException":
                raise ValueError(f"{entity_type} with id {entity_id!r} already exists.") from e
            raise

    def _get_entity(self, entity_type: str, entity_id: str) -> Optional[dict[str, Any]]:
        resp = self._table.get_item(
            Key={"PK": self._entity_pk(entity_type, entity_id), "SK": self._SK}
        )
        item = resp.get("Item")
        return self._clean_item(item) if item else None

    def _delete_entity(self, entity_type: str, entity_id: str) -> bool:
        resp = self._table.delete_item(
            Key={"PK": self._entity_pk(entity_type, entity_id), "SK": self._SK},
            ReturnValues="ALL_OLD",
        )
        return "Attributes" in resp

    def _find_one(
        self,
        entity_type: str,
        field_name: str,
        value: Any,
    ) -> Optional[dict[str, Any]]:
        rows = self._scan(
            FilterExpression=Attr("entity_type").eq(entity_type) & Attr(field_name).eq(value),
            Limit=1,
        )
        return rows[0] if rows else None

    def _list_entities(self, entity_type: str) -> list[dict[str, Any]]:
        return self._scan(FilterExpression=Attr("entity_type").eq(entity_type))

    def _scan(self, **kwargs: Any) -> list[dict[str, Any]]:
        rows: list[dict[str, Any]] = []
        params = dict(kwargs)
        while True:
            resp = self._table.scan(**params)
            rows.extend(self._clean_item(item) for item in resp.get("Items", []))
            last_key = resp.get("LastEvaluatedKey")
            if not last_key:
                return rows
            params["ExclusiveStartKey"] = last_key

    def _sort_key(self, payload: dict[str, Any]) -> str:
        value = payload.get("created_on") or payload.get("updated_on") or payload["id"]
        if isinstance(value, datetime):
            return value.isoformat()
        return str(value)

    def _page(self, rows: list[Any], page: int, per_page: int) -> list[Any]:
        p = max(1, page)
        n = max(1, min(per_page, 100))
        start = (p - 1) * n
        return rows[start : start + n]

    def _reverse_sort_value(self, value: Any) -> float:
        if isinstance(value, datetime):
            return -value.timestamp()
        if isinstance(value, str):
            try:
                return -datetime.fromisoformat(value.replace("Z", "+00:00")).timestamp()
            except ValueError:
                return 0
        return 0

    def _to_dynamodb(self, value: Any) -> Any:
        if isinstance(value, datetime):
            return value.isoformat()
        if isinstance(value, float):
            return Decimal(str(value))
        if isinstance(value, dict):
            return {k: self._to_dynamodb(v) for k, v in value.items()}
        if isinstance(value, list):
            return [self._to_dynamodb(v) for v in value]
        return value

    def _from_dynamodb(self, value: Any) -> Any:
        if isinstance(value, Decimal):
            if value % 1 == 0:
                return int(value)
            return float(value)
        if isinstance(value, dict):
            return {k: self._from_dynamodb(v) for k, v in value.items()}
        if isinstance(value, list):
            return [self._from_dynamodb(v) for v in value]
        return value
