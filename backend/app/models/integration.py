from sqlalchemy import Column, String, Text

from app.database import Base


class Integration(Base):
    __tablename__ = "integrations"

    id = Column(String(50), primary_key=True)
    source_app_id = Column(String(50))
    target_app_id = Column(String(50))
    interface_type = Column(String(100))
    protocol = Column(String(100))
    description = Column(Text)
    data_objects = Column(String(500))
    frequency = Column(String(100))
    direction = Column(String(50))
    status = Column(String(100))
