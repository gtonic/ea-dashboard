from pydantic import BaseModel


class ComplianceAssessmentBase(BaseModel):
    app_id: str | None = None
    regulation: str | None = None
    status: str | None = None
    assessed_by: str | None = None
    assessed_date: str | None = None
    notes: str | None = None
    workflow_status: str | None = None
    deadline: str | None = None
    audit_trail: list | None = None


class ComplianceAssessmentCreate(ComplianceAssessmentBase):
    id: str | None = None


class ComplianceAssessmentRead(ComplianceAssessmentBase):
    id: str

    model_config = {"from_attributes": True}


class ComplianceAssessmentUpdate(BaseModel):
    app_id: str | None = None
    regulation: str | None = None
    status: str | None = None
    assessed_by: str | None = None
    assessed_date: str | None = None
    notes: str | None = None
    workflow_status: str | None = None
    deadline: str | None = None
    audit_trail: list | None = None
