from fastapi.testclient import TestClient
from gateway.gateway import app

client = TestClient(app)

def test_gateway_health_proxy():
    # Admin stats endpoint
    res = client.get("/admin/stats")
    assert res.status_code == 200
    data = res.json()
    assert "total_requests" in data
    assert "active_clients" in data

def test_gateway_normal_flow():
    res = client.get("/api/products", headers={"X-Client-ID": "e2e-test-user-1"})
    assert res.status_code in [200, 503] # 200 if backend running, 503 if backend server offline
