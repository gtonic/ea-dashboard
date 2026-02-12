import json
import os
from pathlib import Path

from sqlalchemy.orm import Session

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


def _find_json_file() -> Path:
    candidates = [
        Path(__file__).resolve().parent.parent.parent.parent / "app" / "data" / "bebauungsplan.json",
        Path(os.getcwd()) / "app" / "data" / "bebauungsplan.json",
        Path(os.getcwd()) / "seed-data" / "bebauungsplan.json",
        Path(__file__).resolve().parent.parent.parent / "seed-data" / "bebauungsplan.json",
        Path(__file__).resolve().parent.parent.parent / "app" / "data" / "bebauungsplan.json",
    ]
    for p in candidates:
        if p.exists():
            return p
    raise FileNotFoundError(
        f"bebauungsplan.json not found. Searched: {[str(c) for c in candidates]}"
    )


def seed_database(db: Session) -> dict:
    data_path = _find_json_file()
    with open(data_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Clear all tables in reverse dependency order
    db.query(SubCapability).delete()
    db.query(Capability).delete()
    db.query(CapabilityMapping).delete()
    db.query(ProjectDependency).delete()
    db.query(ComplianceAssessment).delete()
    db.query(ManagementKPI).delete()
    db.query(Integration).delete()
    db.query(E2EProcess).delete()
    db.query(Demand).delete()
    db.query(Vendor).delete()
    db.query(Project).delete()
    db.query(Application).delete()
    db.query(LegalEntity).delete()
    db.query(Domain).delete()
    db.flush()

    counts = {}

    # Domains with capabilities and sub-capabilities
    domains = data.get("domains", [])
    cap_count = 0
    sub_cap_count = 0
    for d in domains:
        domain = Domain(
            id=d["id"],
            name=d["name"],
            color=d.get("color"),
            icon=d.get("icon"),
            description=d.get("description"),
            domain_owner=d.get("domainOwner"),
            strategic_focus=d.get("strategicFocus"),
            vision=d.get("vision"),
            kpis=d.get("kpis", []),
        )
        db.add(domain)
        db.flush()

        for cap in d.get("capabilities", []):
            capability = Capability(
                id=str(cap["id"]),
                domain_id=domain.id,
                name=cap["name"],
                maturity=cap.get("maturity"),
                target_maturity=cap.get("targetMaturity"),
                criticality=cap.get("criticality"),
            )
            db.add(capability)
            cap_count += 1
            db.flush()

            for sc in cap.get("subCapabilities", []):
                sub_cap = SubCapability(
                    id=str(sc["id"]),
                    capability_id=capability.id,
                    name=sc["name"],
                )
                db.add(sub_cap)
                sub_cap_count += 1

    counts["domains"] = len(domains)
    counts["capabilities"] = cap_count
    counts["sub_capabilities"] = sub_cap_count

    # Applications
    apps = data.get("applications", [])
    for a in apps:
        application = Application(
            id=a["id"],
            name=a["name"],
            vendor=a.get("vendor"),
            category=a.get("category"),
            type=a.get("type"),
            criticality=a.get("criticality"),
            time_quadrant=a.get("timeQuadrant"),
            business_owner=a.get("businessOwner"),
            it_owner=a.get("itOwner"),
            cost_per_year=a.get("costPerYear"),
            user_count=a.get("userCount"),
            go_live_date=a.get("goLiveDate"),
            description=a.get("description"),
            scores=a.get("scores"),
            risk_probability=a.get("riskProbability"),
            risk_impact=a.get("riskImpact"),
            lifecycle_status=a.get("lifecycleStatus"),
            technology=a.get("technology", []),
            entities=a.get("entities", []),
            end_of_support_date=a.get("endOfSupportDate"),
            end_of_life_date=a.get("endOfLifeDate"),
            license_cost=a.get("licenseCost"),
            operations_cost=a.get("operationsCost"),
            integration_cost=a.get("integrationCost"),
            personnel_cost=a.get("personnelCost"),
            regulations=a.get("regulations", []),
            data_classification=a.get("dataClassification"),
        )
        db.add(application)
    counts["applications"] = len(apps)

    # Capability Mappings
    mappings = data.get("capabilityMappings", [])
    for m in mappings:
        mapping = CapabilityMapping(
            capability_id=str(m["capabilityId"]),
            application_id=m["applicationId"],
            role=m.get("role"),
        )
        db.add(mapping)
    counts["capability_mappings"] = len(mappings)

    # Projects
    projects = data.get("projects", [])
    for p in projects:
        project = Project(
            id=p["id"],
            name=p["name"],
            primary_domain=p.get("primaryDomain"),
            secondary_domains=p.get("secondaryDomains", []),
            capabilities=p.get("capabilities", []),
            affected_apps=p.get("affectedApps", []),
            category=p.get("category"),
            budget=p.get("budget"),
            start=p.get("start"),
            end=p.get("end"),
            status=p.get("status"),
            status_text=p.get("statusText"),
            sponsor=p.get("sponsor"),
            project_lead=p.get("projectLead"),
            strategic_contribution=p.get("strategicContribution"),
            time_reference=p.get("timeReference"),
            e2e_processes=p.get("e2eProcesses", []),
            media_break_refs=p.get("mediaBreakRefs", []),
            conformity=p.get("conformity"),
        )
        db.add(project)
    counts["projects"] = len(projects)

    # Project Dependencies
    deps = data.get("projectDependencies", [])
    for dep in deps:
        dependency = ProjectDependency(
            source_project_id=dep["sourceProjectId"],
            target_project_id=dep["targetProjectId"],
            type=dep.get("type"),
            description=dep.get("description"),
        )
        db.add(dependency)
    counts["project_dependencies"] = len(deps)

    # Vendors
    vendors = data.get("vendors", [])
    for v in vendors:
        vendor = Vendor(
            id=v["id"],
            name=v["name"],
            category=v.get("category"),
            vendor_type=v.get("vendorType"),
            status=v.get("status"),
            criticality=v.get("criticality"),
            service_level=v.get("serviceLevel"),
            contract_value=v.get("contractValue"),
            contract_end=v.get("contractEnd"),
            contact_person=v.get("contactPerson"),
            vendor_manager=v.get("vendorManager"),
            website=v.get("website"),
            rating=v.get("rating"),
            description=v.get("description"),
        )
        db.add(vendor)
    counts["vendors"] = len(vendors)

    # Demands
    demands_list = data.get("demands", [])
    for dm in demands_list:
        demand = Demand(
            id=dm["id"],
            title=dm["title"],
            description=dm.get("description"),
            category=dm.get("category"),
            status=dm.get("status"),
            priority=dm.get("priority"),
            requested_by=dm.get("requestedBy"),
            request_date=dm.get("requestDate"),
            estimated_budget=dm.get("estimatedBudget"),
            primary_domain=dm.get("primaryDomain"),
            related_domains=dm.get("relatedDomains", []),
            related_apps=dm.get("relatedApps", []),
            related_vendors=dm.get("relatedVendors", []),
            business_case=dm.get("businessCase"),
            is_ai_use_case=dm.get("isAIUseCase", False),
            ai_risk_category=dm.get("aiRiskCategory"),
            ai_description=dm.get("aiDescription"),
            checklist_security=dm.get("checklistSecurity", False),
            checklist_legal=dm.get("checklistLegal", False),
            checklist_architecture=dm.get("checklistArchitecture", False),
        )
        db.add(demand)
    counts["demands"] = len(demands_list)

    # Integrations
    integrations = data.get("integrations", [])
    for i in integrations:
        integration = Integration(
            id=i["id"],
            source_app_id=i.get("sourceAppId"),
            target_app_id=i.get("targetAppId"),
            interface_type=i.get("interfaceType"),
            protocol=i.get("protocol"),
            description=i.get("description"),
            data_objects=i.get("dataObjects"),
            frequency=i.get("frequency"),
            direction=i.get("direction"),
            status=i.get("status"),
        )
        db.add(integration)
    counts["integrations"] = len(integrations)

    # E2E Processes
    processes = data.get("e2eProcesses", [])
    for proc in processes:
        process = E2EProcess(
            id=proc["id"],
            name=proc["name"],
            owner=proc.get("owner"),
            description=proc.get("description"),
            domains=proc.get("domains", []),
            status=proc.get("status"),
            kpis=proc.get("kpis", []),
        )
        db.add(process)
    counts["e2e_processes"] = len(processes)

    # Legal Entities
    entities = data.get("legalEntities", [])
    for e in entities:
        entity = LegalEntity(
            id=e["id"],
            name=e["name"],
            short_name=e.get("shortName"),
            description=e.get("description"),
            country=e.get("country"),
            city=e.get("city"),
            region=e.get("region"),
            parent_entity=e.get("parentEntity"),
        )
        db.add(entity)
    counts["legal_entities"] = len(entities)

    # Compliance Assessments
    assessments = data.get("complianceAssessments", [])
    for ca in assessments:
        assessment = ComplianceAssessment(
            id=ca["id"],
            app_id=ca.get("appId"),
            regulation=ca.get("regulation"),
            status=ca.get("status"),
            assessed_by=ca.get("assessedBy"),
            assessed_date=ca.get("assessedDate"),
            notes=ca.get("notes"),
            workflow_status=ca.get("workflowStatus"),
            deadline=ca.get("deadline"),
            audit_trail=ca.get("auditTrail", []),
        )
        db.add(assessment)
    counts["compliance_assessments"] = len(assessments)

    # Management KPIs
    kpis = data.get("managementKPIs", [])
    for k in kpis:
        kpi = ManagementKPI(
            id=k["id"],
            name=k["name"],
            description=k.get("description"),
            target=k.get("target"),
            current=k.get("current"),
            unit=k.get("unit"),
            trend=k.get("trend"),
            category=k.get("category"),
        )
        db.add(kpi)
    counts["management_kpis"] = len(kpis)

    db.commit()
    return counts
