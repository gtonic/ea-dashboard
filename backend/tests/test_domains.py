def test_create_domain(client):
    resp = client.post("/api/domains", json={"name": "Test Domain", "color": "#ff0000"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Test Domain"
    assert data["color"] == "#ff0000"
    assert "id" in data


def test_list_domains(client):
    client.post("/api/domains", json={"name": "Domain A"})
    client.post("/api/domains", json={"name": "Domain B"})
    resp = client.get("/api/domains")
    assert resp.status_code == 200
    assert len(resp.json()) == 2


def test_get_domain(client):
    create_resp = client.post("/api/domains", json={"name": "My Domain"})
    domain_id = create_resp.json()["id"]
    resp = client.get(f"/api/domains/{domain_id}")
    assert resp.status_code == 200
    assert resp.json()["name"] == "My Domain"


def test_get_domain_not_found(client):
    resp = client.get("/api/domains/9999")
    assert resp.status_code == 404


def test_update_domain(client):
    create_resp = client.post("/api/domains", json={"name": "Old Name"})
    domain_id = create_resp.json()["id"]
    resp = client.put(f"/api/domains/{domain_id}", json={"name": "New Name"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "New Name"


def test_delete_domain(client):
    create_resp = client.post("/api/domains", json={"name": "To Delete"})
    domain_id = create_resp.json()["id"]
    resp = client.delete(f"/api/domains/{domain_id}")
    assert resp.status_code == 204
    resp = client.get(f"/api/domains/{domain_id}")
    assert resp.status_code == 404


def test_create_domain_with_capabilities(client):
    resp = client.post("/api/domains", json={
        "name": "Production",
        "capabilities": [
            {
                "id": "1.1",
                "name": "Planning",
                "maturity": 3,
                "sub_capabilities": [{"id": "1.1.1", "name": "Sub Planning"}],
            }
        ],
    })
    assert resp.status_code == 201
    data = resp.json()
    assert len(data["capabilities"]) == 1
    assert data["capabilities"][0]["name"] == "Planning"
    assert len(data["capabilities"][0]["sub_capabilities"]) == 1


def test_create_domain_with_explicit_id(client):
    resp = client.post("/api/domains", json={"id": 42, "name": "Explicit ID"})
    assert resp.status_code == 201
    assert resp.json()["id"] == 42
