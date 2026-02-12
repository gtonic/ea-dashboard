from sqlalchemy import Column, String, Text, Integer, Float, JSON, Date

from app.database import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False)
    vendor = Column(String(255))
    category = Column(String(100))
    type = Column(String(100))
    criticality = Column(String(100))
    time_quadrant = Column(String(100))
    business_owner = Column(String(255))
    it_owner = Column(String(255))
    cost_per_year = Column(Float)
    user_count = Column(Integer)
    go_live_date = Column(String(50))
    description = Column(Text)
    scores = Column(JSON, default=dict)
    risk_probability = Column(String(50))
    risk_impact = Column(String(50))
    lifecycle_status = Column(String(100))
    technology = Column(JSON, default=list)
    entities = Column(JSON, default=list)
    end_of_support_date = Column(String(50))
    end_of_life_date = Column(String(50))
    license_cost = Column(Float)
    operations_cost = Column(Float)
    integration_cost = Column(Float)
    personnel_cost = Column(Float)
    regulations = Column(JSON, default=list)
    data_classification = Column(String(100))


class CapabilityMapping(Base):
    __tablename__ = "capability_mappings"

    capability_id = Column(String(50), primary_key=True)
    application_id = Column(String(50), primary_key=True)
    role = Column(String(100))
