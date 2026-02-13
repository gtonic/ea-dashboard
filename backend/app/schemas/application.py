from pydantic import BaseModel


class ApplicationBase(BaseModel):
    name: str
    vendor: str | None = None
    category: str | None = None
    type: str | None = None
    criticality: str | None = None
    time_quadrant: str | None = None
    business_owner: str | None = None
    it_owner: str | None = None
    cost_per_year: float | None = None
    user_count: int | None = None
    go_live_date: str | None = None
    description: str | None = None
    scores: dict | None = None
    risk_probability: str | None = None
    risk_impact: str | None = None
    lifecycle_status: str | None = None
    technology: list | None = None
    entities: list | None = None
    end_of_support_date: str | None = None
    end_of_life_date: str | None = None
    license_cost: float | None = None
    operations_cost: float | None = None
    integration_cost: float | None = None
    personnel_cost: float | None = None
    regulations: list | None = None
    data_classification: str | None = None


class ApplicationCreate(ApplicationBase):
    id: str | None = None


class ApplicationRead(ApplicationBase):
    id: str
    version: int = 1

    model_config = {"from_attributes": True}


class ApplicationUpdate(BaseModel):
    name: str | None = None
    vendor: str | None = None
    category: str | None = None
    type: str | None = None
    criticality: str | None = None
    time_quadrant: str | None = None
    business_owner: str | None = None
    it_owner: str | None = None
    cost_per_year: float | None = None
    user_count: int | None = None
    go_live_date: str | None = None
    description: str | None = None
    scores: dict | None = None
    risk_probability: str | None = None
    risk_impact: str | None = None
    lifecycle_status: str | None = None
    technology: list | None = None
    entities: list | None = None
    end_of_support_date: str | None = None
    end_of_life_date: str | None = None
    license_cost: float | None = None
    operations_cost: float | None = None
    integration_cost: float | None = None
    personnel_cost: float | None = None
    regulations: list | None = None
    data_classification: str | None = None


class CapabilityMappingBase(BaseModel):
    capability_id: str
    application_id: str
    role: str | None = None


class CapabilityMappingCreate(CapabilityMappingBase):
    pass


class CapabilityMappingRead(CapabilityMappingBase):
    model_config = {"from_attributes": True}


class CapabilityMappingUpdate(BaseModel):
    role: str | None = None
