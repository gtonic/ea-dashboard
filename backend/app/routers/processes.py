from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.process import E2EProcess
from app.schemas.process import E2EProcessCreate, E2EProcessRead, E2EProcessUpdate

router = APIRouter(prefix="/processes", tags=["processes"])


def _generate_process_id(db: Session) -> str:
    existing = db.query(E2EProcess.id).all()
    nums = []
    for (pid,) in existing:
        if pid.startswith("PRC-"):
            try:
                nums.append(int(pid[4:]))
            except ValueError:
                pass
    next_num = max(nums, default=0) + 1
    return f"PRC-{next_num:03d}"


@router.get("", response_model=list[E2EProcessRead])
def list_processes(
    status: str | None = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(E2EProcess)
    if status:
        q = q.filter(E2EProcess.status == status)
    return q.all()


@router.get("/{process_id}", response_model=E2EProcessRead)
def get_process(process_id: str, db: Session = Depends(get_db)):
    process = db.query(E2EProcess).filter(E2EProcess.id == process_id).first()
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")
    return process


@router.post("", response_model=E2EProcessRead, status_code=201)
def create_process(data: E2EProcessCreate, db: Session = Depends(get_db)):
    process_dict = data.model_dump()
    if process_dict.get("id") is None:
        process_dict["id"] = _generate_process_id(db)
    process = E2EProcess(**process_dict)
    db.add(process)
    db.commit()
    db.refresh(process)
    return process


@router.put("/{process_id}", response_model=E2EProcessRead)
def update_process(process_id: str, data: E2EProcessUpdate, db: Session = Depends(get_db)):
    process = db.query(E2EProcess).filter(E2EProcess.id == process_id).first()
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(process, key, value)
    db.commit()
    db.refresh(process)
    return process


@router.delete("/{process_id}", status_code=204)
def delete_process(process_id: str, db: Session = Depends(get_db)):
    process = db.query(E2EProcess).filter(E2EProcess.id == process_id).first()
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")
    db.delete(process)
    db.commit()
