from pydantic import BaseModel


class DataObjectBase(BaseModel):
    name: str
    description: str | None = None
    classification: str | None = None
    owner: str | None = None
    steward: str | None = None
    source_app_ids: list[str] | None = None
    consuming_app_ids: list[str] | None = None
    quality_score: int | None = None
    retention_period: str | None = None
    personal_data: bool = False
    format: str | None = None
    domain: int | None = None


class DataObjectCreate(DataObjectBase):
    id: str | None = None


class DataObjectRead(DataObjectBase):
    id: str
    version: int = 1

    model_config = {"from_attributes": True}


class DataObjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    classification: str | None = None
    owner: str | None = None
    steward: str | None = None
    source_app_ids: list[str] | None = None
    consuming_app_ids: list[str] | None = None
    quality_score: int | None = None
    retention_period: str | None = None
    personal_data: bool | None = None
    format: str | None = None
    domain: int | None = None
