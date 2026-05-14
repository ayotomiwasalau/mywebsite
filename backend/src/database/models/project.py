from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class Project(BaseModel):
    """Project document model (MongoDB)."""

    model_config = ConfigDict(extra="ignore")

    id: str = Field(..., max_length=64)
    slug: str = Field(..., max_length=255)
    title: str = Field(..., max_length=512)
    header_img_url: str = Field(..., max_length=2048)
    header_img_alt: str = Field(..., max_length=512)
    description: str
    tags: list[str] = Field(default_factory=list)
    href: str = Field(..., max_length=2048)
    filepath_md: str = Field(..., max_length=2048)
    created_on: datetime
    updated_on: datetime
    feature: bool = False
    feat_order: int | None = Field(default=None, ge=1, le=3)
    shares: int = 0
    share_destination: str = Field(..., max_length=64)
    blog_url: str = Field(..., max_length=2048)

    @model_validator(mode="after")
    def validate_feature_order(self):
        if self.feature and self.feat_order is None:
            raise ValueError("feat_order is required when feature is true")
        if not self.feature:
            self.feat_order = None
        return self

