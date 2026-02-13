"""Helper to write audit log entries."""
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.user import User


def write_audit(
    db: Session,
    user: User | None,
    action: str,
    entity_type: str,
    entity_id: str | None = None,
    detail: str | None = None,
):
    entry = AuditLog(
        user_id=user.id if user else None,
        user_email=user.email if user else None,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        detail=detail,
    )
    db.add(entry)
    # Don't commit here — let the caller's transaction handle it.
