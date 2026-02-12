from sqlalchemy import Column, String, Text, Integer, Float, JSON, Boolean

from app.database import Base


class Demand(Base):
    __tablename__ = "demands"

    id = Column(String(50), primary_key=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100))
    status = Column(String(100))
    priority = Column(String(50))
    requested_by = Column(String(255))
    request_date = Column(String(50))
    estimated_budget = Column(Float)
    primary_domain = Column(Integer)
    related_domains = Column(JSON, default=list)
    related_apps = Column(JSON, default=list)
    related_vendors = Column(JSON, default=list)
    business_case = Column(Text)
    is_ai_use_case = Column(Boolean, default=False)
    ai_risk_category = Column(String(100))
    ai_description = Column(Text)
    checklist_security = Column(Boolean, default=False)
    checklist_legal = Column(Boolean, default=False)
    checklist_architecture = Column(Boolean, default=False)
