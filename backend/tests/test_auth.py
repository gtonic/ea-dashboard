def test_login_success(client, admin_user):
    resp = client.post("/api/auth/login", json={
        "email": "admin@test.com",
        "password": "testpass",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, admin_user):
    resp = client.post("/api/auth/login", json={
        "email": "admin@test.com",
        "password": "wrongpass",
    })
    assert resp.status_code == 401


def test_login_unknown_user(client):
    resp = client.post("/api/auth/login", json={
        "email": "unknown@test.com",
        "password": "testpass",
    })
    assert resp.status_code == 401


def test_login_inactive_user(client, db_session):
    from app.models.user import User
    from app.services.auth_service import hash_password
    user = User(
        email="inactive@test.com",
        name="Inactive",
        password_hash=hash_password("testpass"),
        role="viewer",
        is_active=False,
    )
    db_session.add(user)
    db_session.commit()
    resp = client.post("/api/auth/login", json={
        "email": "inactive@test.com",
        "password": "testpass",
    })
    assert resp.status_code == 403


def test_get_me(client, admin_user, admin_headers):
    resp = client.get("/api/auth/me", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "admin@test.com"
    assert data["role"] == "admin"


def test_get_me_no_token(client):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401


def test_update_me(client, admin_user, admin_headers):
    resp = client.put("/api/auth/me", json={"name": "New Name"}, headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["name"] == "New Name"


def test_refresh_token(client, admin_user):
    login_resp = client.post("/api/auth/login", json={
        "email": "admin@test.com",
        "password": "testpass",
    })
    refresh = login_resp.json()["refresh_token"]
    resp = client.post("/api/auth/refresh", json={"refresh_token": refresh})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_refresh_with_invalid_token(client):
    resp = client.post("/api/auth/refresh", json={"refresh_token": "invalid"})
    assert resp.status_code == 401


def test_viewer_cannot_create(client, viewer_headers):
    resp = client.post("/api/domains", json={"name": "Test"}, headers=viewer_headers)
    assert resp.status_code == 403


def test_editor_can_create(client, editor_headers):
    resp = client.post("/api/domains", json={"name": "Test"}, headers=editor_headers)
    assert resp.status_code == 201


def test_editor_cannot_delete(client, editor_headers, admin_headers):
    create_resp = client.post("/api/domains", json={"name": "Test"}, headers=admin_headers)
    domain_id = create_resp.json()["id"]
    resp = client.delete(f"/api/domains/{domain_id}", headers=editor_headers)
    assert resp.status_code == 403


def test_viewer_can_read(client, viewer_headers, admin_headers):
    client.post("/api/domains", json={"name": "Test"}, headers=admin_headers)
    resp = client.get("/api/domains", headers=viewer_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_unauthenticated_request_rejected(client):
    resp = client.get("/api/domains")
    assert resp.status_code == 401


def test_invalid_token_rejected(client):
    resp = client.get("/api/domains", headers={"Authorization": "Bearer invalidtoken"})
    assert resp.status_code == 401
