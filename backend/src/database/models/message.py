from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class Message(BaseModel):
    """Contact message document model (MongoDB)."""

    model_config = ConfigDict(extra="ignore")

    id: str = Field(..., max_length=64)
    name: str = Field(..., max_length=255)
    email: str = Field(..., max_length=320)
    subject: str = Field(..., max_length=512)
    message: str
    created_on: datetime

