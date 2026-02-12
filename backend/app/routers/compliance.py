from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.compliance import ComplianceAssessment
from app.schemas.compliance import (
    ComplianceAssessmentCreate, ComplianceAssessmentRead, ComplianceAssessmentUpdate,
)

router = APIRouter(prefix="/compliance", tags=["compliance"])


@router.get("", response_model=list[ComplianceAssessmentRead])
def list_assessments(
    app_id: str | None = Query(None),
    regulation: str | None = Query(None),
    status: str | None = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(ComplianceAssessment)
    if app_id:
        q = q.filter(ComplianceAssessment.app_id == app_id)
    if regulation:
        q = q.filter(ComplianceAssessment.regulation == regulation)
    if status:
        q = q.filter(ComplianceAssessment.status == status)
    return q.all()


@router.get("/{assessment_id}", response_model=ComplianceAssessmentRead)
def get_assessment(assessment_id: int, db: Session = Depends(get_db)):
    assessment = db.query(ComplianceAssessment).filter(
        ComplianceAssessment.id == assessment_id
    ).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment


@router.post("", response_model=ComplianceAssessmentRead, status_code=201)
def create_assessment(data: ComplianceAssessmentCreate, db: Session = Depends(get_db)):
    assessment_dict = data.model_dump()
    if assessment_dict.get("id") is None:
        assessment_dict.pop("id", None)
    assessment = ComplianceAssessment(**assessment_dict)
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return assessment


@router.put("/{assessment_id}", response_model=ComplianceAssessmentRead)
def update_assessment(
    assessment_id: int,
    data: ComplianceAssessmentUpdate,
    db: Session = Depends(get_db),
):
    assessment = db.query(ComplianceAssessment).filter(
        ComplianceAssessment.id == assessment_id
    ).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(assessment, key, value)
    db.commit()
    db.refresh(assessment)
    return assessment


@router.delete("/{assessment_id}", status_code=204)
def delete_assessment(assessment_id: int, db: Session = Depends(get_db)):
    assessment = db.query(ComplianceAssessment).filter(
        ComplianceAssessment.id == assessment_id
    ).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    db.delete(assessment)
    db.commit()
