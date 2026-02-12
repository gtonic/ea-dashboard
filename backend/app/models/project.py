from sqlalchemy import Column, String, Text, Integer, Float, JSON

from app.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False)
    primary_domain = Column(Integer)
    secondary_domains = Column(JSON, default=list)
    capabilities = Column(JSON, default=list)
    affected_apps = Column(JSON, default=list)
    category = Column(String(100))
    budget = Column(Float)
    start = Column(String(50))
    end = Column(String(50))
    status = Column(String(50))
    status_text = Column(Text)
    sponsor = Column(String(255))
    project_lead = Column(String(255))
    strategic_contribution = Column(Text)
    time_reference = Column(String(255))
    e2e_processes = Column(JSON, default=list)
    media_break_refs = Column(JSON, default=list)
    conformity = Column(String(100))


class ProjectDependency(Base):
    __tablename__ = "project_dependencies"

    source_project_id = Column(String(50), primary_key=True)
    target_project_id = Column(String(50), primary_key=True)
    type = Column(String(50))
    description = Column(Text)
