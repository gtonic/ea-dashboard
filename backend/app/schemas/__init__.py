from app.schemas.domain import (
    DomainCreate, DomainRead, DomainUpdate,
    CapabilityCreate, CapabilityRead, CapabilityUpdate,
    SubCapabilityCreate, SubCapabilityRead, SubCapabilityUpdate,
)
from app.schemas.application import (
    ApplicationCreate, ApplicationRead, ApplicationUpdate,
    CapabilityMappingCreate, CapabilityMappingRead, CapabilityMappingUpdate,
)
from app.schemas.project import (
    ProjectCreate, ProjectRead, ProjectUpdate,
    ProjectDependencyCreate, ProjectDependencyRead, ProjectDependencyUpdate,
)
from app.schemas.vendor import VendorCreate, VendorRead, VendorUpdate
from app.schemas.demand import DemandCreate, DemandRead, DemandUpdate
from app.schemas.integration import IntegrationCreate, IntegrationRead, IntegrationUpdate
from app.schemas.process import E2EProcessCreate, E2EProcessRead, E2EProcessUpdate
from app.schemas.entity import LegalEntityCreate, LegalEntityRead, LegalEntityUpdate
from app.schemas.compliance import (
    ComplianceAssessmentCreate, ComplianceAssessmentRead, ComplianceAssessmentUpdate,
)
from app.schemas.kpi import ManagementKPICreate, ManagementKPIRead, ManagementKPIUpdate
