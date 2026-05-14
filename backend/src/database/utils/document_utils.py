from __future__ import annotations

from datetime import datetime
from typing import Any, TypeVar

from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


def strip_mongo_id(doc: dict[str, Any]) -> dict[str, Any]:
    out = dict(doc)
    out.pop("_id", None)
    return out


def _parse_iso_dt(value: Any) -> Any:
    if isinstance(value, str):
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    return value


def document_to_model(doc: dict[str, Any], model_cls: type[T]) -> T:
    clean = strip_mongo_id(doc)
    for k in ("created_on", "updated_on"):
        if k in clean:
            clean[k] = _parse_iso_dt(clean[k])
    return model_cls.model_validate(clean)


def model_to_jsonable_dict(model: BaseModel) -> dict[str, Any]:
    return model.model_dump(mode="json")
