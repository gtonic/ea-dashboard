from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Domain(Base):
    __tablename__ = "domains"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    color = Column(String(50))
    icon = Column(String(50))
    description = Column(Text)
    domain_owner = Column(String(255))
    strategic_focus = Column(Text)
    vision = Column(Text)
    kpis = Column(JSON, default=list)

    capabilities = relationship("Capability", back_populates="domain", cascade="all, delete-orphan")


class Capability(Base):
    __tablename__ = "capabilities"

    id = Column(String(50), primary_key=True)
    domain_id = Column(Integer, ForeignKey("domains.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    maturity = Column(Integer)
    target_maturity = Column(Integer)
    criticality = Column(String(50))

    domain = relationship("Domain", back_populates="capabilities")
    sub_capabilities = relationship("SubCapability", back_populates="capability", cascade="all, delete-orphan")


class SubCapability(Base):
    __tablename__ = "sub_capabilities"

    id = Column(String(50), primary_key=True)
    capability_id = Column(String(50), ForeignKey("capabilities.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)

    capability = relationship("Capability", back_populates="sub_capabilities")
