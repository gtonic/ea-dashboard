from sqlalchemy import Column, String, Text

from app.database import Base


class LegalEntity(Base):
    __tablename__ = "legal_entities"

    id = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False)
    short_name = Column(String(50))
    description = Column(Text)
    country = Column(String(10))
    city = Column(String(255))
    region = Column(String(255))
    parent_entity = Column(String(50))
