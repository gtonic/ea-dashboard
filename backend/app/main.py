import os
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy import text

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.logging_config import RequestLoggingMiddleware, setup_logging
from app.models.user import User
from app.services.auth_service import hash_password
from app.routers import (
    domains, applications, projects, vendors, demands,
    integrations, processes, entities, compliance, kpis,
    data_objects, seed, export, dashboard, audit,
)
from app.routers import auth as auth_router
from app.routers import admin as admin_router

setup_logging()

_start_time = time.time()


def _ensure_admin(db):
    """Create default admin user if no users exist."""
    if db.query(User).count() == 0:
        admin = User(
            email=settings.ADMIN_EMAIL,
            name=settings.ADMIN_NAME,
            password_hash=hash_password(settings.ADMIN_PASSWORD),
            role="admin",
            is_active=True,
        )
        db.add(admin)
        db.commit()


@asynccontextmanager
async def lifespan(application: FastAPI):
    url = str(engine.url)
    if url.startswith("sqlite") and "/:memory:" not in url:
        db_path = url.replace("sqlite:///", "")
        os.makedirs(os.path.dirname(db_path) or ".", exist_ok=True)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        _ensure_admin(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="EA Dashboard API",
    version="0.5.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# Rate limiter (used by auth endpoints)
from app.routers.auth import limiter  # noqa: E402
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Structured request logging (adds X-Request-ID header)
app.add_middleware(RequestLoggingMiddleware)

# Auth & Admin
app.include_router(auth_router.router, prefix="/api")
app.include_router(admin_router.router, prefix="/api")

# Dashboard
app.include_router(dashboard.router, prefix="/api")

# Entity CRUD
app.include_router(domains.router, prefix="/api")
app.include_router(applications.router, prefix="/api")
app.include_router(applications.mapping_router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(projects.dep_router, prefix="/api")
app.include_router(vendors.router, prefix="/api")
app.include_router(demands.router, prefix="/api")
app.include_router(integrations.router, prefix="/api")
app.include_router(processes.router, prefix="/api")
app.include_router(entities.router, prefix="/api")
app.include_router(data_objects.router, prefix="/api")
app.include_router(compliance.router, prefix="/api")
app.include_router(kpis.router, prefix="/api")
app.include_router(seed.router, prefix="/api")
app.include_router(export.router, prefix="/api")

# Audit log (admin-only)
app.include_router(audit.router, prefix="/api")


@app.get("/api/health")
def health_check():
    """Enhanced health check with DB connectivity and uptime."""
    db_ok = True
    db_type = "sqlite" if settings.DATABASE_URL.startswith("sqlite") else "postgresql"
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
    except Exception:
        db_ok = False
    return {
        "status": "healthy" if db_ok else "degraded",
        "database": {"type": db_type, "connected": db_ok},
        "uptime_seconds": round(time.time() - _start_time),
        "version": "0.5.0",
    }
