import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.application import Application, CapabilityMapping
from app.models.user import User
from app.schemas.application import (
    ApplicationCreate, ApplicationRead, ApplicationUpdate,
    CapabilityMappingCreate, CapabilityMappingRead, CapabilityMappingUpdate,
)
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/applications", tags=["applications"])


def _generate_app_id(db: Session) -> str:
    existing = db.query(Application.id).all()
    nums = []
    for (aid,) in existing:
        if aid.startswith("APP-"):
            try:
                nums.append(int(aid[4:]))
            except ValueError:
                pass
    next_num = max(nums, default=0) + 1
    return f"APP-{next_num:03d}"


@router.get("", response_model=list[ApplicationRead])
def list_applications(
    category: str | None = Query(None),
    criticality: str | None = Query(None),
    lifecycle_status: str | None = Query(None),
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    q = db.query(Application)
    if category:
        q = q.filter(Application.category == category)
    if criticality:
        q = q.filter(Application.criticality == criticality)
    if lifecycle_status:
        q = q.filter(Application.lifecycle_status == lifecycle_status)
    return q.all()


@router.get("/{app_id}", response_model=ApplicationRead)
def get_application(app_id: str, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app


@router.post("", response_model=ApplicationRead, status_code=201)
def create_application(data: ApplicationCreate, db: Session = Depends(get_db), _user: User = Depends(require_role("admin", "editor"))):
    app_dict = data.model_dump()
    if app_dict.get("id") is None:
        app_dict["id"] = _generate_app_id(db)
    application = Application(**app_dict)
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@router.put("/{app_id}", response_model=ApplicationRead)
def update_application(app_id: str, data: ApplicationUpdate, db: Session = Depends(get_db), _user: User = Depends(require_role("admin", "editor"))):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(app, key, value)
    db.commit()
    db.refresh(app)
    return app


@router.delete("/{app_id}", status_code=204)
def delete_application(app_id: str, db: Session = Depends(get_db), _user: User = Depends(require_role("admin"))):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(app)
    db.commit()


# --- Capability Mappings ---

mapping_router = APIRouter(prefix="/capability-mappings", tags=["capability-mappings"])


@mapping_router.get("", response_model=list[CapabilityMappingRead])
def list_mappings(
    application_id: str | None = Query(None),
    capability_id: str | None = Query(None),
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    q = db.query(CapabilityMapping)
    if application_id:
        q = q.filter(CapabilityMapping.application_id == application_id)
    if capability_id:
        q = q.filter(CapabilityMapping.capability_id == capability_id)
    return q.all()


@mapping_router.post("", response_model=CapabilityMappingRead, status_code=201)
def create_mapping(data: CapabilityMappingCreate, db: Session = Depends(get_db), _user: User = Depends(require_role("admin", "editor"))):
    mapping = CapabilityMapping(**data.model_dump())
    db.add(mapping)
    db.commit()
    db.refresh(mapping)
    return mapping


@mapping_router.put("/{capability_id}/{application_id}", response_model=CapabilityMappingRead)
def update_mapping(
    capability_id: str,
    application_id: str,
    data: CapabilityMappingUpdate,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role("admin", "editor")),
):
    m = db.query(CapabilityMapping).filter(
        CapabilityMapping.capability_id == capability_id,
        CapabilityMapping.application_id == application_id,
    ).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mapping not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(m, key, value)
    db.commit()
    db.refresh(m)
    return m


@mapping_router.delete("/{capability_id}/{application_id}", status_code=204)
def delete_mapping(capability_id: str, application_id: str, db: Session = Depends(get_db), _user: User = Depends(require_role("admin"))):
    m = db.query(CapabilityMapping).filter(
        CapabilityMapping.capability_id == capability_id,
        CapabilityMapping.application_id == application_id,
    ).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mapping not found")
    db.delete(m)
    db.commit()
