def test_create_data_object(client, admin_headers):
    resp = client.post("/api/data-objects", json={
        "name": "Kundenstammdaten",
        "classification": "vertraulich",
        "owner": "Thomas Berger",
    }, headers=admin_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Kundenstammdaten"
    assert data["id"].startswith("DO-")
    assert data["version"] == 1


def test_list_data_objects(client, admin_headers):
    client.post("/api/data-objects", json={"name": "DO A", "classification": "intern"}, headers=admin_headers)
    client.post("/api/data-objects", json={"name": "DO B", "classification": "vertraulich"}, headers=admin_headers)
    resp = client.get("/api/data-objects", headers=admin_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 2


def test_filter_data_objects_by_classification(client, admin_headers):
    client.post("/api/data-objects", json={"name": "DO A", "classification": "intern"}, headers=admin_headers)
    client.post("/api/data-objects", json={"name": "DO B", "classification": "vertraulich"}, headers=admin_headers)
    resp = client.get("/api/data-objects?classification=intern", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["classification"] == "intern"


def test_get_data_object(client, admin_headers):
    create_resp = client.post("/api/data-objects", json={"name": "My DO"}, headers=admin_headers)
    do_id = create_resp.json()["id"]
    resp = client.get(f"/api/data-objects/{do_id}", headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["name"] == "My DO"


def test_get_data_object_not_found(client, admin_headers):
    resp = client.get("/api/data-objects/DO-999", headers=admin_headers)
    assert resp.status_code == 404


def test_update_data_object(client, admin_headers):
    create_resp = client.post("/api/data-objects", json={"name": "Old DO"}, headers=admin_headers)
    do_id = create_resp.json()["id"]
    resp = client.put(f"/api/data-objects/{do_id}", json={"name": "New DO"}, headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["name"] == "New DO"
    assert resp.json()["version"] == 2


def test_delete_data_object(client, admin_headers):
    create_resp = client.post("/api/data-objects", json={"name": "To Delete"}, headers=admin_headers)
    do_id = create_resp.json()["id"]
    resp = client.delete(f"/api/data-objects/{do_id}", headers=admin_headers)
    assert resp.status_code == 204
    resp = client.get(f"/api/data-objects/{do_id}", headers=admin_headers)
    assert resp.status_code == 404


def test_create_data_object_with_explicit_id(client, admin_headers):
    resp = client.post("/api/data-objects", json={
        "id": "DO-100",
        "name": "Explicit DO",
    }, headers=admin_headers)
    assert resp.status_code == 201
    assert resp.json()["id"] == "DO-100"


def test_create_data_object_with_app_links(client, admin_headers):
    resp = client.post("/api/data-objects", json={
        "name": "Linked DO",
        "source_app_ids": ["APP-001"],
        "consuming_app_ids": ["APP-002", "APP-003"],
        "personal_data": True,
        "quality_score": 4,
    }, headers=admin_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["source_app_ids"] == ["APP-001"]
    assert data["consuming_app_ids"] == ["APP-002", "APP-003"]
    assert data["personal_data"] is True
    assert data["quality_score"] == 4
