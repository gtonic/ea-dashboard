from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.seed_service import seed_database
from app.services.audit_service import write_audit
from app.models.user import User
from app.auth import require_role

router = APIRouter(tags=["seed"])


@router.post("/seed", status_code=200)
def seed_data(db: Session = Depends(get_db), user: User = Depends(require_role("admin"))):
    count = seed_database(db)
    write_audit(db, user, "CREATE", "seed", detail="Database seeded")
    db.commit()
    return {"message": "Database seeded successfully", "counts": count}
