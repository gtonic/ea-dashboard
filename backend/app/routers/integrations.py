from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.integration import Integration
from app.models.user import User
from app.auth import get_current_user, require_role
from app.schemas.integration import IntegrationCreate, IntegrationRead, IntegrationUpdate

router = APIRouter(prefix="/integrations", tags=["integrations"])


def _generate_integration_id(db: Session) -> str:
    existing = db.query(Integration.id).all()
    nums = []
    for (iid,) in existing:
        if iid.startswith("INT-"):
            try:
                nums.append(int(iid[4:]))
            except ValueError:
                pass
    next_num = max(nums, default=0) + 1
    return f"INT-{next_num:03d}"


@router.get("", response_model=list[IntegrationRead])
def list_integrations(
    source_app_id: str | None = Query(None),
    target_app_id: str | None = Query(None),
    status: str | None = Query(None),
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    q = db.query(Integration)
    if source_app_id:
        q = q.filter(Integration.source_app_id == source_app_id)
    if target_app_id:
        q = q.filter(Integration.target_app_id == target_app_id)
    if status:
        q = q.filter(Integration.status == status)
    return q.all()


@router.get("/{integration_id}", response_model=IntegrationRead)
def get_integration(integration_id: str, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    integration = db.query(Integration).filter(Integration.id == integration_id).first()
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    return integration


@router.post("", response_model=IntegrationRead, status_code=201)
def create_integration(data: IntegrationCreate, db: Session = Depends(get_db), _user: User = Depends(require_role("admin", "editor"))):
    integration_dict = data.model_dump()
    if integration_dict.get("id") is None:
        integration_dict["id"] = _generate_integration_id(db)
    integration = Integration(**integration_dict)
    db.add(integration)
    db.commit()
    db.refresh(integration)
    return integration


@router.put("/{integration_id}", response_model=IntegrationRead)
def update_integration(integration_id: str, data: IntegrationUpdate, db: Session = Depends(get_db), _user: User = Depends(require_role("admin", "editor"))):
    integration = db.query(Integration).filter(Integration.id == integration_id).first()
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(integration, key, value)
    db.commit()
    db.refresh(integration)
    return integration


@router.delete("/{integration_id}", status_code=204)
def delete_integration(integration_id: str, db: Session = Depends(get_db), _user: User = Depends(require_role("admin"))):
    integration = db.query(Integration).filter(Integration.id == integration_id).first()
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    db.delete(integration)
    db.commit()
