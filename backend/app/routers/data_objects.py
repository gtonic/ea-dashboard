from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.data_object import DataObject
from app.models.user import User
from app.auth import get_current_user, require_role
from app.services.audit_service import write_audit
from app.schemas.data_object import DataObjectCreate, DataObjectRead, DataObjectUpdate

router = APIRouter(prefix="/data-objects", tags=["data-objects"])


def _generate_data_object_id(db: Session) -> str:
    existing = db.query(DataObject.id).all()
    nums = []
    for (did,) in existing:
        if did.startswith("DO-"):
            try:
                nums.append(int(did[3:]))
            except ValueError:
                pass
    next_num = max(nums, default=0) + 1
    return f"DO-{next_num:03d}"


@router.get("", response_model=list[DataObjectRead])
def list_data_objects(
    classification: str | None = Query(None),
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    q = db.query(DataObject)
    if classification:
        q = q.filter(DataObject.classification == classification)
    return q.all()


@router.get("/{data_object_id}", response_model=DataObjectRead)
def get_data_object(data_object_id: str, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    obj = db.query(DataObject).filter(DataObject.id == data_object_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Data object not found")
    return obj


@router.post("", response_model=DataObjectRead, status_code=201)
def create_data_object(data: DataObjectCreate, db: Session = Depends(get_db), user: User = Depends(require_role("admin", "editor"))):
    obj_dict = data.model_dump()
    if obj_dict.get("id") is None:
        obj_dict["id"] = _generate_data_object_id(db)
    obj = DataObject(**obj_dict)
    db.add(obj)
    write_audit(db, user, "CREATE", "data_object", obj.id)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/{data_object_id}", response_model=DataObjectRead)
def update_data_object(data_object_id: str, data: DataObjectUpdate, db: Session = Depends(get_db), user: User = Depends(require_role("admin", "editor"))):
    obj = db.query(DataObject).filter(DataObject.id == data_object_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Data object not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    obj.version += 1
    write_audit(db, user, "UPDATE", "data_object", data_object_id)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{data_object_id}", status_code=204)
def delete_data_object(data_object_id: str, db: Session = Depends(get_db), user: User = Depends(require_role("admin"))):
    obj = db.query(DataObject).filter(DataObject.id == data_object_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Data object not found")
    write_audit(db, user, "DELETE", "data_object", data_object_id)
    db.delete(obj)
    db.commit()
