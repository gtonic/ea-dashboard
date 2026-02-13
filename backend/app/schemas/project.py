from pydantic import BaseModel


class ProjectBase(BaseModel):
    name: str
    primary_domain: int | None = None
    secondary_domains: list | None = None
    capabilities: list | None = None
    affected_apps: list | None = None
    category: str | None = None
    budget: float | None = None
    start: str | None = None
    end: str | None = None
    status: str | None = None
    status_text: str | None = None
    sponsor: str | None = None
    project_lead: str | None = None
    strategic_contribution: str | None = None
    time_reference: str | None = None
    e2e_processes: list | None = None
    media_break_refs: list | None = None
    conformity: str | None = None


class ProjectCreate(ProjectBase):
    id: str | None = None


class ProjectRead(ProjectBase):
    id: str

    model_config = {"from_attributes": True}


class ProjectUpdate(BaseModel):
    name: str | None = None
    primary_domain: int | None = None
    secondary_domains: list | None = None
    capabilities: list | None = None
    affected_apps: list | None = None
    category: str | None = None
    budget: float | None = None
    start: str | None = None
    end: str | None = None
    status: str | None = None
    status_text: str | None = None
    sponsor: str | None = None
    project_lead: str | None = None
    strategic_contribution: str | None = None
    time_reference: str | None = None
    e2e_processes: list | None = None
    media_break_refs: list | None = None
    conformity: str | None = None


class ProjectDependencyBase(BaseModel):
    source_project_id: str
    target_project_id: str
    type: str | None = None
    description: str | None = None


class ProjectDependencyCreate(ProjectDependencyBase):
    pass


class ProjectDependencyRead(ProjectDependencyBase):
    model_config = {"from_attributes": True}


class ProjectDependencyUpdate(BaseModel):
    type: str | None = None
    description: str | None = None
