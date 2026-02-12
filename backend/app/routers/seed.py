from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.seed_service import seed_database

router = APIRouter(tags=["seed"])


@router.post("/seed", status_code=200)
def seed_data(db: Session = Depends(get_db)):
    count = seed_database(db)
    return {"message": "Database seeded successfully", "counts": count}
