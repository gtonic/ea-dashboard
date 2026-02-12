from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.demand import Demand
from app.models.user import User
from app.auth import get_current_user, require_role
from app.schemas.demand import DemandCreate, DemandRead, DemandUpdate

router = APIRouter(prefix="/demands", tags=["demands"])


def _generate_demand_id(db: Session) -> str:
    existing = db.query(Demand.id).all()
    nums = []
    for (did,) in existing:
        if did.startswith("DEM-"):
            try:
                nums.append(int(did[4:]))
            except ValueError:
                pass
    next_num = max(nums, default=0) + 1
    return f"DEM-{next_num:03d}"


@router.get("", response_model=list[DemandRead])
def list_demands(
    category: str | None = Query(None),
    status: str | None = Query(None),
    priority: str | None = Query(None),
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    q = db.query(Demand)
    if category:
        q = q.filter(Demand.category == category)
    if status:
        q = q.filter(Demand.status == status)
    if priority:
        q = q.filter(Demand.priority == priority)
    return q.all()


@router.get("/{demand_id}", response_model=DemandRead)
def get_demand(demand_id: str, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    demand = db.query(Demand).filter(Demand.id == demand_id).first()
    if not demand:
        raise HTTPException(status_code=404, detail="Demand not found")
    return demand


@router.post("", response_model=DemandRead, status_code=201)
def create_demand(data: DemandCreate, db: Session = Depends(get_db), _user: User = Depends(require_role("admin", "editor"))):
    demand_dict = data.model_dump()
    if demand_dict.get("id") is None:
        demand_dict["id"] = _generate_demand_id(db)
    demand = Demand(**demand_dict)
    db.add(demand)
    db.commit()
    db.refresh(demand)
    return demand


@router.put("/{demand_id}", response_model=DemandRead)
def update_demand(demand_id: str, data: DemandUpdate, db: Session = Depends(get_db), _user: User = Depends(require_role("admin", "editor"))):
    demand = db.query(Demand).filter(Demand.id == demand_id).first()
    if not demand:
        raise HTTPException(status_code=404, detail="Demand not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(demand, key, value)
    db.commit()
    db.refresh(demand)
    return demand


@router.delete("/{demand_id}", status_code=204)
def delete_demand(demand_id: str, db: Session = Depends(get_db), _user: User = Depends(require_role("admin"))):
    demand = db.query(Demand).filter(Demand.id == demand_id).first()
    if not demand:
        raise HTTPException(status_code=404, detail="Demand not found")
    db.delete(demand)
    db.commit()
