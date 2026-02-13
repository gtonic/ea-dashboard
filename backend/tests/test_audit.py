"""Tests for audit logging."""


def test_audit_log_created_on_entity_create(client, admin_headers):
    client.post("/api/domains", json={"name": "Test Domain"}, headers=admin_headers)
    resp = client.get("/api/admin/audit-log", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1
    entry = data["entries"][0]
    assert entry["action"] == "CREATE"
    assert entry["entityType"] == "domain"


def test_audit_log_created_on_entity_update(client, admin_headers):
    create_resp = client.post("/api/domains", json={"name": "Original"}, headers=admin_headers)
    domain_id = create_resp.json()["id"]
    client.put(f"/api/domains/{domain_id}", json={"name": "Updated"}, headers=admin_headers)
    resp = client.get("/api/admin/audit-log", headers=admin_headers)
    data = resp.json()
    actions = [e["action"] for e in data["entries"]]
    assert "UPDATE" in actions
    assert "CREATE" in actions


def test_audit_log_created_on_entity_delete(client, admin_headers):
    create_resp = client.post("/api/domains", json={"name": "Deletable"}, headers=admin_headers)
    domain_id = create_resp.json()["id"]
    client.delete(f"/api/domains/{domain_id}", headers=admin_headers)
    resp = client.get("/api/admin/audit-log", headers=admin_headers)
    data = resp.json()
    actions = [e["action"] for e in data["entries"]]
    assert "DELETE" in actions


def test_audit_log_filter_by_entity_type(client, admin_headers):
    client.post("/api/domains", json={"name": "D1"}, headers=admin_headers)
    client.post("/api/applications", json={"name": "A1"}, headers=admin_headers)
    resp = client.get("/api/admin/audit-log?entity_type=domain", headers=admin_headers)
    data = resp.json()
    assert all(e["entityType"] == "domain" for e in data["entries"])


def test_audit_log_records_user(client, admin_headers, admin_user):
    client.post("/api/domains", json={"name": "Tracked"}, headers=admin_headers)
    resp = client.get("/api/admin/audit-log", headers=admin_headers)
    data = resp.json()
    assert data["entries"][0]["userEmail"] == admin_user.email


def test_audit_log_requires_admin(client, viewer_headers):
    resp = client.get("/api/admin/audit-log", headers=viewer_headers)
    assert resp.status_code == 403
