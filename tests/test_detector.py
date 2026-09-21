from agents.traffic_monitor.monitor import TrafficMonitoringAgent
from agents.threat_detection.detector import ThreatDetectionAgent

def test_threat_detection_normal():
    monitor = TrafficMonitoringAgent()
    detector = ThreatDetectionAgent()

    # Record 2 normal requests
    metrics = monitor.record_request("test-client-1", "127.0.0.1", "/api/products", "GET")
    result = detector.analyze_client(metrics, "/api/products")

    assert result["risk_score"] < 30.0
    assert result["risk_level"] == "NORMAL"

def test_threat_detection_brute_force():
    monitor = TrafficMonitoringAgent()
    detector = ThreatDetectionAgent()

    # Record 5 failed logins
    for _ in range(5):
        metrics = monitor.record_request("test-client-attacker", "127.0.0.1", "/api/login", "POST", is_login_attempt=True, is_auth_failure=True)

    result = detector.analyze_client(metrics, "/api/login")

    assert result["risk_score"] >= 50.0
    assert result["risk_level"] in ["SUSPICIOUS", "HIGH_RISK", "CRITICAL"]
