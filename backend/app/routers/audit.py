"""Admin-accessible audit log endpoint."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.audit_log import AuditLog
from app.auth import require_role

router = APIRouter(prefix="/admin/audit-log", tags=["admin"])


@router.get("")
def list_audit_log(
    entity_type: str | None = Query(None),
    action: str | None = Query(None),
    user_email: str | None = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role("admin")),
):
    q = db.query(AuditLog).order_by(AuditLog.timestamp.desc())
    if entity_type:
        q = q.filter(AuditLog.entity_type == entity_type)
    if action:
        q = q.filter(AuditLog.action == action)
    if user_email:
        q = q.filter(AuditLog.user_email == user_email)
    total = q.count()
    entries = q.offset(offset).limit(limit).all()
    return {
        "total": total,
        "entries": [
            {
                "id": e.id,
                "timestamp": e.timestamp.isoformat() if e.timestamp else None,
                "userId": e.user_id,
                "userEmail": e.user_email,
                "action": e.action,
                "entityType": e.entity_type,
                "entityId": e.entity_id,
                "detail": e.detail,
            }
            for e in entries
        ],
    }
