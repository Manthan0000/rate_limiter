from agents.response.response_agent import ResponseAgent

def test_response_agent_allow():
    agent = ResponseAgent()
    decision = {"decision": "ALLOW", "risk_score": 10.0, "reason": "Normal"}
    client_metrics = {"requests_per_minute": 20}

    allow, status_code, body = agent.execute_response(decision, client_metrics)
    assert allow is True
    assert status_code == 200

def test_response_agent_block():
    agent = ResponseAgent()
    decision = {"decision": "BLOCK", "risk_score": 90.0, "reason": "High risk"}
    client_metrics = {"requests_per_minute": 200}

    allow, status_code, body = agent.execute_response(decision, client_metrics)
    assert allow is False
    assert status_code == 403
    assert body["code"] == "CLIENT_BLOCKED"
