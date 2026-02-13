from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.auth import get_current_user
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

router = APIRouter(prefix="/export", tags=["export"])


def _to_camel(name: str) -> str:
    components = name.split("_")
    return components[0] + "".join(x.title() for x in components[1:])


@router.get("/json")
def export_json(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    domains = db.query(Domain).all()
    domains_out = []
    for d in domains:
        caps_out = []
        for cap in d.capabilities:
            sub_caps = [{"id": sc.id, "name": sc.name} for sc in cap.sub_capabilities]
            caps_out.append({
                "id": cap.id,
                "name": cap.name,
                "maturity": cap.maturity,
                "targetMaturity": cap.target_maturity,
                "criticality": cap.criticality,
                "subCapabilities": sub_caps,
            })
        domains_out.append({
            "id": d.id,
            "name": d.name,
            "color": d.color,
            "icon": d.icon,
            "description": d.description,
            "domainOwner": d.domain_owner,
            "strategicFocus": d.strategic_focus,
            "vision": d.vision,
            "kpis": d.kpis or [],
            "capabilities": caps_out,
        })

    apps = db.query(Application).all()
    apps_out = []
    for a in apps:
        apps_out.append({
            "id": a.id,
            "name": a.name,
            "vendor": a.vendor,
            "category": a.category,
            "type": a.type,
            "criticality": a.criticality,
            "timeQuadrant": a.time_quadrant,
            "businessOwner": a.business_owner,
            "itOwner": a.it_owner,
            "costPerYear": a.cost_per_year,
            "userCount": a.user_count,
            "goLiveDate": a.go_live_date,
            "description": a.description,
            "scores": a.scores or {},
            "riskProbability": a.risk_probability,
            "riskImpact": a.risk_impact,
            "lifecycleStatus": a.lifecycle_status,
            "technology": a.technology or [],
            "entities": a.entities or [],
            "endOfSupportDate": a.end_of_support_date,
            "endOfLifeDate": a.end_of_life_date,
            "licenseCost": a.license_cost,
            "operationsCost": a.operations_cost,
            "integrationCost": a.integration_cost,
            "personnelCost": a.personnel_cost,
            "regulations": a.regulations or [],
            "dataClassification": a.data_classification,
            "version": a.version or 1,
        })

    mappings = db.query(CapabilityMapping).all()
    mappings_out = [
        {"capabilityId": m.capability_id, "applicationId": m.application_id, "role": m.role}
        for m in mappings
    ]

    projects = db.query(Project).all()
    projects_out = []
    for p in projects:
        projects_out.append({
            "id": p.id,
            "name": p.name,
            "primaryDomain": p.primary_domain,
            "secondaryDomains": p.secondary_domains or [],
            "capabilities": p.capabilities or [],
            "affectedApps": p.affected_apps or [],
            "category": p.category,
            "budget": p.budget,
            "start": p.start,
            "end": p.end,
            "status": p.status,
            "statusText": p.status_text,
            "sponsor": p.sponsor,
            "projectLead": p.project_lead,
            "strategicContribution": p.strategic_contribution,
            "timeReference": p.time_reference,
            "e2eProcesses": p.e2e_processes or [],
            "mediaBreakRefs": p.media_break_refs or [],
            "conformity": p.conformity,
        })

    deps = db.query(ProjectDependency).all()
    deps_out = [
        {
            "sourceProjectId": dep.source_project_id,
            "targetProjectId": dep.target_project_id,
            "type": dep.type,
            "description": dep.description,
        }
        for dep in deps
    ]

    vendors = db.query(Vendor).all()
    vendors_out = []
    for v in vendors:
        vendors_out.append({
            "id": v.id,
            "name": v.name,
            "category": v.category,
            "vendorType": v.vendor_type,
            "status": v.status,
            "criticality": v.criticality,
            "serviceLevel": v.service_level,
            "contractValue": v.contract_value,
            "contractEnd": v.contract_end,
            "contactPerson": v.contact_person,
            "vendorManager": v.vendor_manager,
            "website": v.website,
            "rating": v.rating,
            "description": v.description,
        })

    demands_list = db.query(Demand).all()
    demands_out = []
    for dm in demands_list:
        demands_out.append({
            "id": dm.id,
            "title": dm.title,
            "description": dm.description,
            "category": dm.category,
            "status": dm.status,
            "priority": dm.priority,
            "requestedBy": dm.requested_by,
            "requestDate": dm.request_date,
            "estimatedBudget": dm.estimated_budget,
            "primaryDomain": dm.primary_domain,
            "relatedDomains": dm.related_domains or [],
            "relatedApps": dm.related_apps or [],
            "relatedVendors": dm.related_vendors or [],
            "businessCase": dm.business_case,
            "isAIUseCase": dm.is_ai_use_case,
            "aiRiskCategory": dm.ai_risk_category,
            "aiDescription": dm.ai_description,
            "checklistSecurity": dm.checklist_security,
            "checklistLegal": dm.checklist_legal,
            "checklistArchitecture": dm.checklist_architecture,
        })

    integrations = db.query(Integration).all()
    integrations_out = []
    for i in integrations:
        integrations_out.append({
            "id": i.id,
            "sourceAppId": i.source_app_id,
            "targetAppId": i.target_app_id,
            "interfaceType": i.interface_type,
            "protocol": i.protocol,
            "description": i.description,
            "dataObjects": i.data_objects,
            "frequency": i.frequency,
            "direction": i.direction,
            "status": i.status,
        })

    processes = db.query(E2EProcess).all()
    processes_out = []
    for proc in processes:
        processes_out.append({
            "id": proc.id,
            "name": proc.name,
            "owner": proc.owner,
            "description": proc.description,
            "domains": proc.domains or [],
            "status": proc.status,
            "kpis": proc.kpis or [],
        })

    entities = db.query(LegalEntity).all()
    entities_out = []
    for e in entities:
        entities_out.append({
            "id": e.id,
            "name": e.name,
            "shortName": e.short_name,
            "description": e.description,
            "country": e.country,
            "city": e.city,
            "region": e.region,
            "parentEntity": e.parent_entity,
        })

    assessments = db.query(ComplianceAssessment).all()
    assessments_out = []
    for ca in assessments:
        assessments_out.append({
            "id": ca.id,
            "appId": ca.app_id,
            "regulation": ca.regulation,
            "status": ca.status,
            "assessedBy": ca.assessed_by,
            "assessedDate": ca.assessed_date,
            "notes": ca.notes,
            "workflowStatus": ca.workflow_status,
            "deadline": ca.deadline,
            "auditTrail": ca.audit_trail or [],
        })

    kpis = db.query(ManagementKPI).all()
    kpis_out = []
    for k in kpis:
        kpis_out.append({
            "id": k.id,
            "name": k.name,
            "description": k.description,
            "target": k.target,
            "current": k.current,
            "unit": k.unit,
            "trend": k.trend,
            "category": k.category,
        })

    return JSONResponse(content={
        "domains": domains_out,
        "applications": apps_out,
        "capabilityMappings": mappings_out,
        "projects": projects_out,
        "projectDependencies": deps_out,
        "vendors": vendors_out,
        "demands": demands_out,
        "integrations": integrations_out,
        "e2eProcesses": processes_out,
        "legalEntities": entities_out,
        "complianceAssessments": assessments_out,
        "managementKPIs": kpis_out,
    })
