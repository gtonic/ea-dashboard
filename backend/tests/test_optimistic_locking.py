"""Tests for optimistic locking (version field + If-Match header)."""


def test_application_has_version_field(client, admin_headers):
    resp = client.post("/api/applications", json={"name": "Versioned App"}, headers=admin_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["version"] == 1


def test_application_version_increments_on_update(client, admin_headers):
    resp = client.post("/api/applications", json={"name": "App V1"}, headers=admin_headers)
    app_id = resp.json()["id"]
    resp = client.put(f"/api/applications/{app_id}", json={"name": "App V2"}, headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["version"] == 2


def test_optimistic_locking_conflict(client, admin_headers):
    resp = client.post("/api/applications", json={"name": "Concurrent"}, headers=admin_headers)
    app_id = resp.json()["id"]

    # First update with correct version (1) succeeds
    resp = client.put(
        f"/api/applications/{app_id}",
        json={"name": "Updated by user A"},
        headers={**admin_headers, "If-Match": "1"},
    )
    assert resp.status_code == 200
    assert resp.json()["version"] == 2

    # Second update with stale version (1) fails with 409
    resp = client.put(
        f"/api/applications/{app_id}",
        json={"name": "Updated by user B"},
        headers={**admin_headers, "If-Match": "1"},
    )
    assert resp.status_code == 409


def test_optimistic_locking_without_header_succeeds(client, admin_headers):
    """When If-Match header is omitted, update proceeds without version check."""
    resp = client.post("/api/applications", json={"name": "No Lock"}, headers=admin_headers)
    app_id = resp.json()["id"]
    resp = client.put(f"/api/applications/{app_id}", json={"name": "Still OK"}, headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["version"] == 2
