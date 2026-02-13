from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, DateTime

from app.database import Base


class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    user_id = Column(Integer, nullable=True)
    user_email = Column(String(255), nullable=True)
    action = Column(String(50), nullable=False)  # CREATE, UPDATE, DELETE
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(100), nullable=True)
    detail = Column(Text, nullable=True)
