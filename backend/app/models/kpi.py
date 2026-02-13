from sqlalchemy import Column, String, Text, Float

from app.database import Base


class ManagementKPI(Base):
    __tablename__ = "management_kpis"

    id = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    target = Column(Float)
    current = Column(Float)
    unit = Column(String(100))
    trend = Column(String(50))
    category = Column(String(100))
