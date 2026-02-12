import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import (
    domains, applications, projects, vendors, demands,
    integrations, processes, entities, compliance, kpis,
    seed, export,
)


@asynccontextmanager
async def lifespan(application: FastAPI):
    url = str(engine.url)
    if url.startswith("sqlite") and "/:memory:" not in url:
        db_path = url.replace("sqlite:///", "")
        os.makedirs(os.path.dirname(db_path) or ".", exist_ok=True)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="EA Dashboard API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
app.include_router(compliance.router, prefix="/api")
app.include_router(kpis.router, prefix="/api")
app.include_router(seed.router, prefix="/api")
app.include_router(export.router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
