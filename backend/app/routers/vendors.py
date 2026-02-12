from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.vendor import Vendor
from app.models.user import User
from app.auth import get_current_user, require_role
from app.schemas.vendor import VendorCreate, VendorRead, VendorUpdate

router = APIRouter(prefix="/vendors", tags=["vendors"])


def _generate_vendor_id(db: Session) -> str:
    existing = db.query(Vendor.id).all()
    nums = []
    for (vid,) in existing:
        if vid.startswith("VND-"):
            try:
                nums.append(int(vid[4:]))
            except ValueError:
                pass
    next_num = max(nums, default=0) + 1
    return f"VND-{next_num:03d}"


@router.get("", response_model=list[VendorRead])
def list_vendors(
    category: str | None = Query(None),
    status: str | None = Query(None),
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    q = db.query(Vendor)
    if category:
        q = q.filter(Vendor.category == category)
    if status:
        q = q.filter(Vendor.status == status)
    return q.all()


@router.get("/{vendor_id}", response_model=VendorRead)
def get_vendor(vendor_id: str, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor


@router.post("", response_model=VendorRead, status_code=201)
def create_vendor(data: VendorCreate, db: Session = Depends(get_db), _user: User = Depends(require_role("admin", "editor"))):
    vendor_dict = data.model_dump()
    if vendor_dict.get("id") is None:
        vendor_dict["id"] = _generate_vendor_id(db)
    vendor = Vendor(**vendor_dict)
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor


@router.put("/{vendor_id}", response_model=VendorRead)
def update_vendor(vendor_id: str, data: VendorUpdate, db: Session = Depends(get_db), _user: User = Depends(require_role("admin", "editor"))):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(vendor, key, value)
    db.commit()
    db.refresh(vendor)
    return vendor


@router.delete("/{vendor_id}", status_code=204)
def delete_vendor(vendor_id: str, db: Session = Depends(get_db), _user: User = Depends(require_role("admin"))):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    db.delete(vendor)
    db.commit()
