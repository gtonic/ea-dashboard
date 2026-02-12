from pydantic import BaseModel


class IntegrationBase(BaseModel):
    source_app_id: str | None = None
    target_app_id: str | None = None
    interface_type: str | None = None
    protocol: str | None = None
    description: str | None = None
    data_objects: str | None = None
    frequency: str | None = None
    direction: str | None = None
    status: str | None = None


class IntegrationCreate(IntegrationBase):
    id: str | None = None


class IntegrationRead(IntegrationBase):
    id: str

    model_config = {"from_attributes": True}


class IntegrationUpdate(BaseModel):
    source_app_id: str | None = None
    target_app_id: str | None = None
    interface_type: str | None = None
    protocol: str | None = None
    description: str | None = None
    data_objects: str | None = None
    frequency: str | None = None
    direction: str | None = None
    status: str | None = None
