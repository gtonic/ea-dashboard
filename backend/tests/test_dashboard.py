"""Tests for dashboard aggregation endpoints."""


def test_dashboard_summary_empty(client, admin_headers):
    resp = client.get("/api/dashboard/summary", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["applications"] == 0
    assert data["domains"] == 0
    assert data["projects"] == 0


def test_dashboard_summary_with_data(client, admin_headers):
    client.post("/api/applications", json={"name": "App A", "category": "ERP"}, headers=admin_headers)
    client.post("/api/applications", json={"name": "App B", "category": "CRM"}, headers=admin_headers)
    client.post("/api/domains", json={"name": "Domain 1"}, headers=admin_headers)
    resp = client.get("/api/dashboard/summary", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["applications"] == 2
    assert data["domains"] == 1


def test_time_distribution(client, admin_headers):
    client.post("/api/applications", json={"name": "App A", "time_quadrant": "Invest"}, headers=admin_headers)
    client.post("/api/applications", json={"name": "App B", "time_quadrant": "Invest"}, headers=admin_headers)
    client.post("/api/applications", json={"name": "App C", "time_quadrant": "Tolerate"}, headers=admin_headers)
    resp = client.get("/api/dashboard/time-distribution", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["Invest"] == 2
    assert data["Tolerate"] == 1


def test_application_categories(client, admin_headers):
    client.post("/api/applications", json={"name": "A1", "category": "ERP"}, headers=admin_headers)
    client.post("/api/applications", json={"name": "A2", "category": "ERP"}, headers=admin_headers)
    client.post("/api/applications", json={"name": "A3", "category": "CRM"}, headers=admin_headers)
    resp = client.get("/api/dashboard/application-categories", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["ERP"] == 2
    assert data["CRM"] == 1


def test_dashboard_requires_auth(client):
    resp = client.get("/api/dashboard/summary")
    assert resp.status_code == 401
