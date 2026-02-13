from pydantic import BaseModel


class SubCapabilityBase(BaseModel):
    name: str
    capability_id: str | None = None


class SubCapabilityCreate(SubCapabilityBase):
    id: str | None = None


class SubCapabilityRead(SubCapabilityBase):
    id: str
    capability_id: str

    model_config = {"from_attributes": True}


class SubCapabilityUpdate(BaseModel):
    name: str | None = None
    capability_id: str | None = None


class CapabilityBase(BaseModel):
    name: str
    domain_id: int | None = None
    maturity: int | None = None
    target_maturity: int | None = None
    criticality: str | None = None


class CapabilityCreate(CapabilityBase):
    id: str | None = None
    sub_capabilities: list[SubCapabilityCreate] | None = None


class CapabilityRead(CapabilityBase):
    id: str
    domain_id: int
    sub_capabilities: list[SubCapabilityRead] = []

    model_config = {"from_attributes": True}


class CapabilityUpdate(BaseModel):
    name: str | None = None
    domain_id: int | None = None
    maturity: int | None = None
    target_maturity: int | None = None
    criticality: str | None = None


class DomainBase(BaseModel):
    name: str
    color: str | None = None
    icon: str | None = None
    description: str | None = None
    domain_owner: str | None = None
    strategic_focus: str | None = None
    vision: str | None = None
    kpis: list | None = None


class DomainCreate(DomainBase):
    id: int | None = None
    capabilities: list[CapabilityCreate] | None = None


class DomainRead(DomainBase):
    id: int
    capabilities: list[CapabilityRead] = []

    model_config = {"from_attributes": True}


class DomainUpdate(BaseModel):
    name: str | None = None
    color: str | None = None
    icon: str | None = None
    description: str | None = None
    domain_owner: str | None = None
    strategic_focus: str | None = None
    vision: str | None = None
    kpis: list | None = None
