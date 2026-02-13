from sqlalchemy import Column, String, Text, Integer, Boolean, JSON

from app.database import Base


class DataObject(Base):
    __tablename__ = "data_objects"

    id = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    classification = Column(String(50))
    owner = Column(String(255))
    steward = Column(String(255))
    source_app_ids = Column(JSON, default=list)
    consuming_app_ids = Column(JSON, default=list)
    quality_score = Column(Integer)
    retention_period = Column(String(100))
    personal_data = Column(Boolean, default=False)
    format = Column(String(50))
    domain = Column(Integer)
    version = Column(Integer, default=1, nullable=False)
