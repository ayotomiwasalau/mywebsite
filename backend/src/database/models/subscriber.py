from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class Subscriber(BaseModel):
    """Subscriber document model (MongoDB)."""

    model_config = ConfigDict(extra="ignore")

    id: str = Field(..., max_length=64)
    email: str = Field(..., max_length=320)
    name: str = Field(..., max_length=255)
    created_on: datetime

