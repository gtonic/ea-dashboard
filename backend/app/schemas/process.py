from pydantic import BaseModel


class E2EProcessBase(BaseModel):
    name: str
    owner: str | None = None
    description: str | None = None
    domains: list | None = None
    status: str | None = None
    kpis: list | None = None


class E2EProcessCreate(E2EProcessBase):
    id: str | None = None


class E2EProcessRead(E2EProcessBase):
    id: str

    model_config = {"from_attributes": True}


class E2EProcessUpdate(BaseModel):
    name: str | None = None
    owner: str | None = None
    description: str | None = None
    domains: list | None = None
    status: str | None = None
    kpis: list | None = None
