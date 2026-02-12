from pydantic import BaseModel


class DemandBase(BaseModel):
    title: str
    description: str | None = None
    category: str | None = None
    status: str | None = None
    priority: str | None = None
    requested_by: str | None = None
    request_date: str | None = None
    estimated_budget: float | None = None
    primary_domain: int | None = None
    related_domains: list | None = None
    related_apps: list | None = None
    related_vendors: list | None = None
    business_case: str | None = None
    is_ai_use_case: bool | None = False
    ai_risk_category: str | None = None
    ai_description: str | None = None
    checklist_security: bool | None = False
    checklist_legal: bool | None = False
    checklist_architecture: bool | None = False


class DemandCreate(DemandBase):
    id: str | None = None


class DemandRead(DemandBase):
    id: str

    model_config = {"from_attributes": True}


class DemandUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    status: str | None = None
    priority: str | None = None
    requested_by: str | None = None
    request_date: str | None = None
    estimated_budget: float | None = None
    primary_domain: int | None = None
    related_domains: list | None = None
    related_apps: list | None = None
    related_vendors: list | None = None
    business_case: str | None = None
    is_ai_use_case: bool | None = None
    ai_risk_category: str | None = None
    ai_description: str | None = None
    checklist_security: bool | None = None
    checklist_legal: bool | None = None
    checklist_architecture: bool | None = None
