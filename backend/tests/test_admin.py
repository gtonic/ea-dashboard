def test_admin_list_users(client, admin_headers, admin_user):
    resp = client.get("/api/admin/users", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert data[0]["email"] == "admin@test.com"


def test_admin_create_user(client, admin_headers, admin_user):
    resp = client.post("/api/admin/users", json={
        "email": "new@test.com",
        "name": "New User",
        "password": "newpass",
        "role": "editor",
    }, headers=admin_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "new@test.com"
    assert data["role"] == "editor"
    assert "password_hash" not in data
    assert "password" not in data


def test_admin_create_user_duplicate_email(client, admin_headers, admin_user):
    resp = client.post("/api/admin/users", json={
        "email": "admin@test.com",
        "name": "Dup",
        "password": "pass",
    }, headers=admin_headers)
    assert resp.status_code == 409


def test_admin_create_user_invalid_role(client, admin_headers, admin_user):
    resp = client.post("/api/admin/users", json={
        "email": "x@test.com",
        "name": "X",
        "password": "pass",
        "role": "superadmin",
    }, headers=admin_headers)
    assert resp.status_code == 400


def test_admin_update_user(client, admin_headers, admin_user):
    create_resp = client.post("/api/admin/users", json={
        "email": "upd@test.com",
        "name": "Old",
        "password": "pass",
    }, headers=admin_headers)
    user_id = create_resp.json()["id"]
    resp = client.put(f"/api/admin/users/{user_id}", json={"name": "Updated"}, headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["name"] == "Updated"


def test_admin_delete_user(client, admin_headers, admin_user):
    create_resp = client.post("/api/admin/users", json={
        "email": "del@test.com",
        "name": "Deletable",
        "password": "pass",
    }, headers=admin_headers)
    user_id = create_resp.json()["id"]
    resp = client.delete(f"/api/admin/users/{user_id}", headers=admin_headers)
    assert resp.status_code == 204


def test_admin_cannot_delete_self(client, admin_headers, admin_user):
    resp = client.delete(f"/api/admin/users/{admin_user.id}", headers=admin_headers)
    assert resp.status_code == 400


def test_viewer_cannot_access_admin(client, viewer_headers):
    resp = client.get("/api/admin/users", headers=viewer_headers)
    assert resp.status_code == 403


def test_editor_cannot_access_admin(client, editor_headers):
    resp = client.get("/api/admin/users", headers=editor_headers)
    assert resp.status_code == 403
