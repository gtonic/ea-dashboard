import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.domain import Domain, Capability, SubCapability
from app.models.user import User
from app.auth import get_current_user, require_role
from app.services.audit_service import write_audit
from app.schemas.domain import (
    DomainCreate, DomainRead, DomainUpdate,
    CapabilityCreate, CapabilityRead, CapabilityUpdate,
    SubCapabilityCreate, SubCapabilityRead, SubCapabilityUpdate,
)

router = APIRouter(prefix="/domains", tags=["domains"])


@router.get("", response_model=list[DomainRead])
def list_domains(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return db.query(Domain).all()


@router.get("/{domain_id}", response_model=DomainRead)
def get_domain(domain_id: int, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    domain = db.query(Domain).filter(Domain.id == domain_id).first()
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    return domain


@router.post("", response_model=DomainRead, status_code=201)
def create_domain(data: DomainCreate, db: Session = Depends(get_db), user: User = Depends(require_role("admin", "editor"))):
    caps_data = data.capabilities or []
    domain_dict = data.model_dump(exclude={"capabilities"})
    if domain_dict.get("id") is None:
        max_id = db.query(Domain.id).order_by(Domain.id.desc()).first()
        domain_dict["id"] = (max_id[0] + 1) if max_id else 1
    domain = Domain(**domain_dict)
    db.add(domain)
    db.flush()
    for cap in caps_data:
        sub_caps_data = cap.sub_capabilities or []
        cap_dict = cap.model_dump(exclude={"sub_capabilities"})
        cap_dict["domain_id"] = domain.id
        if cap_dict.get("id") is None:
            cap_dict["id"] = f"{domain.id}.{uuid.uuid4().hex[:4]}"
        capability = Capability(**cap_dict)
        db.add(capability)
        db.flush()
        for sc in sub_caps_data:
            sc_dict = sc.model_dump()
            sc_dict["capability_id"] = capability.id
            if sc_dict.get("id") is None:
                sc_dict["id"] = f"{capability.id}.{uuid.uuid4().hex[:4]}"
            db.add(SubCapability(**sc_dict))
    write_audit(db, user, "CREATE", "domain", str(domain.id))
    db.commit()
    db.refresh(domain)
    return domain


@router.put("/{domain_id}", response_model=DomainRead)
def update_domain(domain_id: int, data: DomainUpdate, db: Session = Depends(get_db), user: User = Depends(require_role("admin", "editor"))):
    domain = db.query(Domain).filter(Domain.id == domain_id).first()
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(domain, key, value)
    write_audit(db, user, "UPDATE", "domain", str(domain_id))
    db.commit()
    db.refresh(domain)
    return domain


@router.delete("/{domain_id}", status_code=204)
def delete_domain(domain_id: int, db: Session = Depends(get_db), user: User = Depends(require_role("admin"))):
    domain = db.query(Domain).filter(Domain.id == domain_id).first()
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    write_audit(db, user, "DELETE", "domain", str(domain_id))
    db.delete(domain)
    db.commit()


# --- Capability sub-routes ---

@router.get("/{domain_id}/capabilities", response_model=list[CapabilityRead])
def list_capabilities(domain_id: int, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return db.query(Capability).filter(Capability.domain_id == domain_id).all()


@router.post("/{domain_id}/capabilities", response_model=CapabilityRead, status_code=201)
def create_capability(domain_id: int, data: CapabilityCreate, db: Session = Depends(get_db), user: User = Depends(require_role("admin", "editor"))):
    domain = db.query(Domain).filter(Domain.id == domain_id).first()
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    sub_caps_data = data.sub_capabilities or []
    cap_dict = data.model_dump(exclude={"sub_capabilities"})
    cap_dict["domain_id"] = domain_id
    if cap_dict.get("id") is None:
        cap_dict["id"] = f"{domain_id}.{uuid.uuid4().hex[:4]}"
    capability = Capability(**cap_dict)
    db.add(capability)
    db.flush()
    for sc in sub_caps_data:
        sc_dict = sc.model_dump()
        sc_dict["capability_id"] = capability.id
        if sc_dict.get("id") is None:
            sc_dict["id"] = f"{capability.id}.{uuid.uuid4().hex[:4]}"
        db.add(SubCapability(**sc_dict))
    write_audit(db, user, "CREATE", "capability", capability.id)
    db.commit()
    db.refresh(capability)
    return capability


@router.put("/capabilities/{capability_id}", response_model=CapabilityRead)
def update_capability(capability_id: str, data: CapabilityUpdate, db: Session = Depends(get_db), user: User = Depends(require_role("admin", "editor"))):
    cap = db.query(Capability).filter(Capability.id == capability_id).first()
    if not cap:
        raise HTTPException(status_code=404, detail="Capability not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(cap, key, value)
    write_audit(db, user, "UPDATE", "capability", capability_id)
    db.commit()
    db.refresh(cap)
    return cap


@router.delete("/capabilities/{capability_id}", status_code=204)
def delete_capability(capability_id: str, db: Session = Depends(get_db), user: User = Depends(require_role("admin"))):
    cap = db.query(Capability).filter(Capability.id == capability_id).first()
    if not cap:
        raise HTTPException(status_code=404, detail="Capability not found")
    write_audit(db, user, "DELETE", "capability", capability_id)
    db.delete(cap)
    db.commit()
