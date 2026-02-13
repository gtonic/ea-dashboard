from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.entity import LegalEntity
from app.models.user import User
from app.auth import get_current_user, require_role
from app.services.audit_service import write_audit
from app.schemas.entity import LegalEntityCreate, LegalEntityRead, LegalEntityUpdate

router = APIRouter(prefix="/entities", tags=["entities"])


def _generate_entity_id(db: Session) -> str:
    existing = db.query(LegalEntity.id).all()
    nums = []
    for (eid,) in existing:
        if eid.startswith("ENT-"):
            try:
                nums.append(int(eid[4:]))
            except ValueError:
                pass
    next_num = max(nums, default=0) + 1
    return f"ENT-{next_num:03d}"


@router.get("", response_model=list[LegalEntityRead])
def list_entities(
    country: str | None = Query(None),
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    q = db.query(LegalEntity)
    if country:
        q = q.filter(LegalEntity.country == country)
    return q.all()


@router.get("/{entity_id}", response_model=LegalEntityRead)
def get_entity(entity_id: str, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    entity = db.query(LegalEntity).filter(LegalEntity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    return entity


@router.post("", response_model=LegalEntityRead, status_code=201)
def create_entity(data: LegalEntityCreate, db: Session = Depends(get_db), user: User = Depends(require_role("admin", "editor"))):
    entity_dict = data.model_dump()
    if entity_dict.get("id") is None:
        entity_dict["id"] = _generate_entity_id(db)
    entity = LegalEntity(**entity_dict)
    db.add(entity)
    write_audit(db, user, "CREATE", "legal_entity", entity.id)
    db.commit()
    db.refresh(entity)
    return entity


@router.put("/{entity_id}", response_model=LegalEntityRead)
def update_entity(entity_id: str, data: LegalEntityUpdate, db: Session = Depends(get_db), user: User = Depends(require_role("admin", "editor"))):
    entity = db.query(LegalEntity).filter(LegalEntity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(entity, key, value)
    write_audit(db, user, "UPDATE", "legal_entity", entity_id)
    db.commit()
    db.refresh(entity)
    return entity


@router.delete("/{entity_id}", status_code=204)
def delete_entity(entity_id: str, db: Session = Depends(get_db), user: User = Depends(require_role("admin"))):
    entity = db.query(LegalEntity).filter(LegalEntity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    write_audit(db, user, "DELETE", "legal_entity", entity_id)
    db.delete(entity)
    db.commit()
