from sqlalchemy import Column, Integer, String, Text, JSON

from app.database import Base


class ComplianceAssessment(Base):
    __tablename__ = "compliance_assessments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    app_id = Column(String(50))
    regulation = Column(String(100))
    status = Column(String(100))
    assessed_by = Column(String(255))
    assessed_date = Column(String(50))
    notes = Column(Text)
    workflow_status = Column(String(100))
    deadline = Column(String(50))
    audit_trail = Column(JSON, default=list)
