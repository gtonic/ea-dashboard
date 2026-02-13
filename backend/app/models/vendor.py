from sqlalchemy import Column, String, Text, Integer, Float

from app.database import Base


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100))
    vendor_type = Column(String(100))
    status = Column(String(100))
    criticality = Column(String(100))
    service_level = Column(String(100))
    contract_value = Column(Float)
    contract_end = Column(String(50))
    contact_person = Column(String(255))
    vendor_manager = Column(String(255))
    website = Column(String(500))
    rating = Column(Integer)
    description = Column(Text)
