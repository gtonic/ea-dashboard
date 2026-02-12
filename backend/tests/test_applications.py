def test_create_application(client):
    resp = client.post("/api/applications", json={
        "name": "Test App",
        "vendor": "Test Vendor",
        "category": "ERP",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Test App"
    assert data["id"].startswith("APP-")


def test_list_applications(client):
    client.post("/api/applications", json={"name": "App A", "category": "ERP"})
    client.post("/api/applications", json={"name": "App B", "category": "CRM"})
    resp = client.get("/api/applications")
    assert resp.status_code == 200
    assert len(resp.json()) == 2


def test_filter_applications_by_category(client):
    client.post("/api/applications", json={"name": "App A", "category": "ERP"})
    client.post("/api/applications", json={"name": "App B", "category": "CRM"})
    resp = client.get("/api/applications?category=ERP")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["category"] == "ERP"


def test_get_application(client):
    create_resp = client.post("/api/applications", json={"name": "My App"})
    app_id = create_resp.json()["id"]
    resp = client.get(f"/api/applications/{app_id}")
    assert resp.status_code == 200
    assert resp.json()["name"] == "My App"


def test_get_application_not_found(client):
    resp = client.get("/api/applications/APP-999")
    assert resp.status_code == 404


def test_update_application(client):
    create_resp = client.post("/api/applications", json={"name": "Old App"})
    app_id = create_resp.json()["id"]
    resp = client.put(f"/api/applications/{app_id}", json={"name": "New App"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "New App"


def test_delete_application(client):
    create_resp = client.post("/api/applications", json={"name": "To Delete"})
    app_id = create_resp.json()["id"]
    resp = client.delete(f"/api/applications/{app_id}")
    assert resp.status_code == 204
    resp = client.get(f"/api/applications/{app_id}")
    assert resp.status_code == 404


def test_create_application_with_explicit_id(client):
    resp = client.post("/api/applications", json={
        "id": "APP-100",
        "name": "Explicit App",
    })
    assert resp.status_code == 201
    assert resp.json()["id"] == "APP-100"


def test_create_application_with_scores(client):
    resp = client.post("/api/applications", json={
        "name": "Scored App",
        "scores": {"functional": 85, "technical": 80, "strategic": 90},
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["scores"]["functional"] == 85
    assert data["scores"]["technical"] == 80
