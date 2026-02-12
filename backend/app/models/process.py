from sqlalchemy import Column, String, Text, JSON

from app.database import Base


class E2EProcess(Base):
    __tablename__ = "e2e_processes"

    id = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False)
    owner = Column(String(255))
    description = Column(Text)
    domains = Column(JSON, default=list)
    status = Column(String(100))
    kpis = Column(JSON, default=list)
