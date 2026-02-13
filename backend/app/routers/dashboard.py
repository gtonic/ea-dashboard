"""Aggregated dashboard endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.models.application import Application
from app.models.domain import Domain
from app.models.project import Project
from app.models.vendor import Vendor
from app.models.demand import Demand
from app.models.compliance import ComplianceAssessment
from app.models.integration import Integration
from app.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    """High-level counts for the executive summary."""
    return {
        "applications": db.query(func.count(Application.id)).scalar(),
        "domains": db.query(func.count(Domain.id)).scalar(),
        "projects": db.query(func.count(Project.id)).scalar(),
        "vendors": db.query(func.count(Vendor.id)).scalar(),
        "demands": db.query(func.count(Demand.id)).scalar(),
        "integrations": db.query(func.count(Integration.id)).scalar(),
        "complianceAssessments": db.query(func.count(ComplianceAssessment.id)).scalar(),
    }


@router.get("/time-distribution")
def time_distribution(
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    """Application count per TIME quadrant (Tolerate/Invest/Migrate/Eliminate)."""
    rows = (
        db.query(Application.time_quadrant, func.count(Application.id))
        .filter(Application.time_quadrant.isnot(None))
        .group_by(Application.time_quadrant)
        .all()
    )
    return {quadrant: count for quadrant, count in rows}


@router.get("/application-categories")
def application_categories(
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    """Application count per category."""
    rows = (
        db.query(Application.category, func.count(Application.id))
        .filter(Application.category.isnot(None))
        .group_by(Application.category)
        .all()
    )
    return {cat: count for cat, count in rows}


@router.get("/criticality-distribution")
def criticality_distribution(
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    """Application count per criticality level."""
    rows = (
        db.query(Application.criticality, func.count(Application.id))
        .filter(Application.criticality.isnot(None))
        .group_by(Application.criticality)
        .all()
    )
    return {crit: count for crit, count in rows}


@router.get("/compliance-status")
def compliance_status(
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    """Compliance assessment count per status."""
    rows = (
        db.query(ComplianceAssessment.status, func.count(ComplianceAssessment.id))
        .filter(ComplianceAssessment.status.isnot(None))
        .group_by(ComplianceAssessment.status)
        .all()
    )
    return {status: count for status, count in rows}
