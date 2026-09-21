from agents.decision.decision_agent import SecurityDecisionAgent

def test_decision_allow():
    agent = SecurityDecisionAgent()
    threat_assessment = {"risk_score": 15.0, "risk_level": "NORMAL", "reasons": []}
    client_metrics = {"client_id": "c1", "requests_per_minute": 5, "login_failures": 0}

    res = agent.make_decision(threat_assessment, client_metrics)
    assert res["decision"] == "ALLOW"

def test_decision_block_critical():
    agent = SecurityDecisionAgent()
    threat_assessment = {"risk_score": 92.0, "risk_level": "CRITICAL", "reasons": ["Severe brute force"]}
    client_metrics = {"client_id": "c2", "requests_per_minute": 150, "login_failures": 8}

    res = agent.make_decision(threat_assessment, client_metrics)
    assert res["decision"] == "BLOCK"
