from app.models.domain import Domain, Capability, SubCapability
from app.models.application import Application, CapabilityMapping
from app.models.project import Project, ProjectDependency
from app.models.vendor import Vendor
from app.models.demand import Demand
from app.models.integration import Integration
from app.models.process import E2EProcess
from app.models.entity import LegalEntity
from app.models.compliance import ComplianceAssessment
from app.models.kpi import ManagementKPI
from app.models.user import User
from app.models.audit_log import AuditLog

__all__ = [
    "Domain", "Capability", "SubCapability",
    "Application", "CapabilityMapping",
    "Project", "ProjectDependency",
    "Vendor", "Demand", "Integration",
    "E2EProcess", "LegalEntity",
    "ComplianceAssessment", "ManagementKPI",
    "User", "AuditLog",
]
