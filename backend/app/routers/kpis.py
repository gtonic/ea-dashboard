from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.kpi import ManagementKPI
from app.schemas.kpi import ManagementKPICreate, ManagementKPIRead, ManagementKPIUpdate

router = APIRouter(prefix="/kpis", tags=["kpis"])


def _generate_kpi_id(db: Session) -> str:
    existing = db.query(ManagementKPI.id).all()
    nums = []
    for (kid,) in existing:
        if kid.startswith("KPI-"):
            try:
                nums.append(int(kid[4:]))
            except ValueError:
                pass
    next_num = max(nums, default=0) + 1
    return f"KPI-{next_num:03d}"


@router.get("", response_model=list[ManagementKPIRead])
def list_kpis(
    category: str | None = Query(None),
    trend: str | None = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(ManagementKPI)
    if category:
        q = q.filter(ManagementKPI.category == category)
    if trend:
        q = q.filter(ManagementKPI.trend == trend)
    return q.all()


@router.get("/{kpi_id}", response_model=ManagementKPIRead)
def get_kpi(kpi_id: str, db: Session = Depends(get_db)):
    kpi = db.query(ManagementKPI).filter(ManagementKPI.id == kpi_id).first()
    if not kpi:
        raise HTTPException(status_code=404, detail="KPI not found")
    return kpi


@router.post("", response_model=ManagementKPIRead, status_code=201)
def create_kpi(data: ManagementKPICreate, db: Session = Depends(get_db)):
    kpi_dict = data.model_dump()
    if kpi_dict.get("id") is None:
        kpi_dict["id"] = _generate_kpi_id(db)
    kpi = ManagementKPI(**kpi_dict)
    db.add(kpi)
    db.commit()
    db.refresh(kpi)
    return kpi


@router.put("/{kpi_id}", response_model=ManagementKPIRead)
def update_kpi(kpi_id: str, data: ManagementKPIUpdate, db: Session = Depends(get_db)):
    kpi = db.query(ManagementKPI).filter(ManagementKPI.id == kpi_id).first()
    if not kpi:
        raise HTTPException(status_code=404, detail="KPI not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(kpi, key, value)
    db.commit()
    db.refresh(kpi)
    return kpi


@router.delete("/{kpi_id}", status_code=204)
def delete_kpi(kpi_id: str, db: Session = Depends(get_db)):
    kpi = db.query(ManagementKPI).filter(ManagementKPI.id == kpi_id).first()
    if not kpi:
        raise HTTPException(status_code=404, detail="KPI not found")
    db.delete(kpi)
    db.commit()
