import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.database import Base, get_db
from app.main import app
from app.models.user import User
from app.services.auth_service import hash_password, create_access_token

TEST_ENGINE = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=TEST_ENGINE)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=TEST_ENGINE)
    yield
    Base.metadata.drop_all(bind=TEST_ENGINE)


@pytest.fixture()
def db_session(setup_db):
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()


def _create_test_user(session, role="admin"):
    user = User(
        email=f"{role}@test.com",
        name=f"Test {role.title()}",
        password_hash=hash_password("testpass"),
        role=role,
        is_active=True,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def _auth_headers(user):
    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def admin_user(db_session):
    return _create_test_user(db_session, "admin")


@pytest.fixture()
def editor_user(db_session):
    return _create_test_user(db_session, "editor")


@pytest.fixture()
def viewer_user(db_session):
    return _create_test_user(db_session, "viewer")


@pytest.fixture()
def admin_headers(admin_user):
    return _auth_headers(admin_user)


@pytest.fixture()
def editor_headers(editor_user):
    return _auth_headers(editor_user)


@pytest.fixture()
def viewer_headers(viewer_user):
    return _auth_headers(viewer_user)
