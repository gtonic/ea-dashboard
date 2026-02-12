from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project import Project, ProjectDependency
from app.models.user import User
from app.auth import get_current_user, require_role
from app.schemas.project import (
    ProjectCreate, ProjectRead, ProjectUpdate,
    ProjectDependencyCreate, ProjectDependencyRead, ProjectDependencyUpdate,
)

router = APIRouter(prefix="/projects", tags=["projects"])


def _generate_project_id(db: Session) -> str:
    existing = db.query(Project.id).all()
    nums = []
    for (pid,) in existing:
        if pid.startswith("PRJ-"):
            try:
                nums.append(int(pid[4:]))
            except ValueError:
                pass
    next_num = max(nums, default=0) + 1
    return f"PRJ-{next_num:03d}"


@router.get("", response_model=list[ProjectRead])
def list_projects(
    category: str | None = Query(None),
    status: str | None = Query(None),
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    q = db.query(Project)
    if category:
        q = q.filter(Project.category == category)
    if status:
        q = q.filter(Project.status == status)
    return q.all()


@router.get("/{project_id}", response_model=ProjectRead)
def get_project(project_id: str, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("", response_model=ProjectRead, status_code=201)
def create_project(data: ProjectCreate, db: Session = Depends(get_db), _user: User = Depends(require_role("admin", "editor"))):
    project_dict = data.model_dump()
    if project_dict.get("id") is None:
        project_dict["id"] = _generate_project_id(db)
    project = Project(**project_dict)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.put("/{project_id}", response_model=ProjectRead)
def update_project(project_id: str, data: ProjectUpdate, db: Session = Depends(get_db), _user: User = Depends(require_role("admin", "editor"))):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(project, key, value)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: str, db: Session = Depends(get_db), _user: User = Depends(require_role("admin"))):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()


# --- Project Dependencies ---

dep_router = APIRouter(prefix="/project-dependencies", tags=["project-dependencies"])


@dep_router.get("", response_model=list[ProjectDependencyRead])
def list_dependencies(
    source_project_id: str | None = Query(None),
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    q = db.query(ProjectDependency)
    if source_project_id:
        q = q.filter(ProjectDependency.source_project_id == source_project_id)
    return q.all()


@dep_router.post("", response_model=ProjectDependencyRead, status_code=201)
def create_dependency(data: ProjectDependencyCreate, db: Session = Depends(get_db), _user: User = Depends(require_role("admin", "editor"))):
    dep = ProjectDependency(**data.model_dump())
    db.add(dep)
    db.commit()
    db.refresh(dep)
    return dep


@dep_router.put("/{source_id}/{target_id}", response_model=ProjectDependencyRead)
def update_dependency(
    source_id: str,
    target_id: str,
    data: ProjectDependencyUpdate,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role("admin", "editor")),
):
    dep = db.query(ProjectDependency).filter(
        ProjectDependency.source_project_id == source_id,
        ProjectDependency.target_project_id == target_id,
    ).first()
    if not dep:
        raise HTTPException(status_code=404, detail="Dependency not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(dep, key, value)
    db.commit()
    db.refresh(dep)
    return dep


@dep_router.delete("/{source_id}/{target_id}", status_code=204)
def delete_dependency(source_id: str, target_id: str, db: Session = Depends(get_db), _user: User = Depends(require_role("admin"))):
    dep = db.query(ProjectDependency).filter(
        ProjectDependency.source_project_id == source_id,
        ProjectDependency.target_project_id == target_id,
    ).first()
    if not dep:
        raise HTTPException(status_code=404, detail="Dependency not found")
    db.delete(dep)
    db.commit()
