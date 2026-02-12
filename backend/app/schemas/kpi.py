from pydantic import BaseModel


class ManagementKPIBase(BaseModel):
    name: str
    description: str | None = None
    target: float | None = None
    current: float | None = None
    unit: str | None = None
    trend: str | None = None
    category: str | None = None


class ManagementKPICreate(ManagementKPIBase):
    id: str | None = None


class ManagementKPIRead(ManagementKPIBase):
    id: str

    model_config = {"from_attributes": True}


class ManagementKPIUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    target: float | None = None
    current: float | None = None
    unit: str | None = None
    trend: str | None = None
    category: str | None = None
