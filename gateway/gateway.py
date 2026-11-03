import time
import json
import asyncio
import httpx
from fastapi import FastAPI, Request, Response, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from database.database import init_db, SessionLocal
from database import crud
from agents.traffic_monitor.monitor import TrafficMonitoringAgent
from agents.threat_detection.detector import ThreatDetectionAgent
from agents.decision.policy import SecurityDecisionAgent
from agents.response.response_agent import ResponseAgent
from agents.feedback.feedback_agent import FeedbackAgent
from ml.predict import MLPredictor
from simulator.manager import SimulatorManager

BACKEND_URL = "http://127.0.0.1:8001"
CURRENT_SECURITY_MODE = "DYNAMIC"
STATIC_RATE_LIMIT_QUOTA = 50

app = FastAPI(title="Agentic Security Gateway", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])

init_db()

monitor_agent = TrafficMonitoringAgent()
detector_agent = ThreatDetectionAgent(ml_predictor=MLPredictor())
decision_agent = SecurityDecisionAgent()
response_agent = ResponseAgent()
feedback_agent = FeedbackAgent()
simulator_manager = SimulatorManager(gateway_url="http://127.0.0.1:8000")


class ConnectionManager:
    def __init__(self):
        self.connections: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.connections.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.connections:
            self.connections.remove(ws)

    async def broadcast(self, msg: dict):
        for ws in self.connections:
            try:
                await ws.send_json(msg)
            except Exception:
                pass

ws_manager = ConnectionManager()


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws_manager.connect(ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(ws)


def get_client_id(request: Request) -> str:
    return request.headers.get("X-Client-ID") or (request.client.host if request.client else "127.0.0.1")


@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_gateway(request: Request, path: str):
    start = time.time()
    client_id = get_client_id(request)
    ip = request.client.host if request.client else "127.0.0.1"
    endpoint = f"/api/{path}"
    method = request.method
    body = await request.body()
    payload_size = len(body)

    is_login = "/login" in endpoint
    is_auth_failure = False
    if is_login and method == "POST" and payload_size > 0:
        try:
            data = json.loads(body)
            if data.get("username") not in ["admin", "subscriber", "student"] or \
               data.get("password") not in ["secret123", "hotstar123", "iiitv2026"]:
                is_auth_failure = True
        except Exception:
            pass

    metrics = monitor_agent.record_request(client_id, ip, endpoint, method, payload_size, is_login, is_auth_failure)

    if CURRENT_SECURITY_MODE == "STATIC":
        rpm = metrics["requests_per_minute"]
        quota = STATIC_RATE_LIMIT_QUOTA
        should_allow = rpm <= quota
        backend_status = 200 if should_allow else 429
        action = "ALLOW" if should_allow else "STATIC_RATE_LIMIT"
        reason = f"Static {'allowed' if should_allow else 'blocked'}: {int(rpm)} rpm vs {quota} limit"
        response_data = {"status": "allowed" if should_allow else "error", "quota": quota,
                         "previous_quota": quota, "rate_limit_change": "STATIC_FIXED",
                         "notification": None, "risk_score": 0.0}
        risk_score, risk_level = 0.0, "STATIC_MODE"
        feedback_entry = {"feedback_result": "N/A", "policy_recommendation": "STATIC"}
    else:
        threat = detector_agent.analyze_client(metrics, endpoint)
        risk_score = threat["risk_score"]
        risk_level = threat["risk_level"]
        monitor_agent.update_historical_risk(client_id, risk_score)

        decision = decision_agent.make_decision(threat, metrics)
        action = decision["decision"]
        reason = decision["reason"]

        should_allow, backend_status, response_data = response_agent.execute_response(decision, metrics)

        quota = response_data.get("quota", 100)
        if response_data.get("notification"):
            response_data["notification"]["endpoint"] = endpoint

        feedback_entry = feedback_agent.record_action(client_id, action, risk_score, metrics["requests_per_minute"])

    latency_ms = round((time.time() - start) * 1000.0, 2)
    response_body = response_data

    if should_allow:
        async with httpx.AsyncClient() as client:
            try:
                headers = {k: v for k, v in request.headers.items() if k.lower() != "host"}
                res = await client.request(method, f"{BACKEND_URL}{endpoint}",
                                           headers=headers, content=body, timeout=5.0)
                backend_status = res.status_code
                try:
                    response_body = res.json()
                except Exception:
                    response_body = {"raw": res.text}
                if backend_status == 401:
                    monitor_agent.record_request(client_id, ip, endpoint, method, payload_size, True, True)
            except httpx.RequestError as e:
                backend_status = 503
                response_body = {"status": "error", "message": f"Backend unreachable: {e}"}

    db = SessionLocal()
    try:
        crud.log_request(db, client_id, ip, endpoint, method, backend_status, payload_size,
                         len(str(response_body)), latency_ms)
        crud.upsert_client_behavior(db, client_id, ip, metrics["request_count"],
                                    metrics["requests_per_minute"], metrics["login_failures"],
                                    risk_score, risk_level, action)
        ev = crud.log_security_event(db, client_id, endpoint, risk_score, action, reason, action, backend_status)
        crud.log_feedback(db, client_id, action, metrics["requests_per_minute"],
                          metrics["requests_per_minute"], feedback_entry["feedback_result"],
                          feedback_entry["policy_recommendation"], ev.id)
    finally:
        db.close()

    asyncio.create_task(ws_manager.broadcast({
        "timestamp": time.strftime("%H:%M:%S"),
        "client_id": client_id, "ip": ip, "endpoint": endpoint, "method": method,
        "risk_score": risk_score, "risk_level": risk_level, "action": action,
        "quota": response_data.get("quota", 100),
        "previous_quota": response_data.get("previous_quota", 100),
        "rate_limit_change": response_data.get("rate_limit_change", "UNCHANGED"),
        "rate_limit_notification": response_data.get("notification"),
        "status_code": backend_status, "reason": reason, "mode": CURRENT_SECURITY_MODE,
        "metrics": metrics,
        "agent_trace": [
            {"agent": "Traffic Monitoring Agent", "status": "Analyzed",
             "details": f"{int(metrics['requests_per_minute'])} rpm, {metrics['login_failures']} auth fails"},
            {"agent": "Threat Detection Agent", "status": f"Mode={CURRENT_SECURITY_MODE}",
             "details": f"Risk={risk_score}, Level={risk_level}"},
            {"agent": "Security Decision Agent", "status": f"Decision={action}", "details": reason},
            {"agent": "Response Agent", "status": f"HTTP {backend_status} (Quota:{response_data.get('quota',100)} RPM)",
             "details": f"Allowed={should_allow} | {response_data.get('previous_quota',100)}→{response_data.get('quota',100)} RPM"},
            {"agent": "Feedback Agent", "status": feedback_entry['feedback_result'],
             "details": feedback_entry['policy_recommendation']}
        ]
    }))

    return Response(content=json.dumps(response_body), status_code=backend_status, media_type="application/json")


@app.get("/admin/mode")
def get_mode():
    return {"mode": CURRENT_SECURITY_MODE, "static_quota": STATIC_RATE_LIMIT_QUOTA}

@app.post("/admin/mode")
def set_mode(mode: str):
    global CURRENT_SECURITY_MODE
    if mode.upper() in ["STATIC", "DYNAMIC"]:
        CURRENT_SECURITY_MODE = mode.upper()
        return {"status": "success", "mode": CURRENT_SECURITY_MODE}
    raise HTTPException(status_code=400, detail="Mode must be STATIC or DYNAMIC")

@app.get("/admin/stats")
def get_stats():
    db = SessionLocal()
    try:
        return crud.get_top_stats(db)
    finally:
        db.close()

@app.get("/admin/notifications")
def get_notifications():
    return {"notifications": response_agent.notifications,
            "client_quotas": response_agent.client_quotas,
            "quotas_config": response_agent.quotas}

@app.post("/admin/reset")
def reset_all():
    db = SessionLocal()
    try:
        crud.reset_db_data(db)
        simulator_manager.stop_all()
        monitor_agent.request_timestamps.clear()
        monitor_agent.request_history.clear()
        monitor_agent.login_failures.clear()
        monitor_agent.endpoint_counts.clear()
        monitor_agent.historical_risk.clear()
        response_agent.reset()
        feedback_agent.action_history.clear()
        return {"status": "success", "message": "System reset"}
    finally:
        db.close()

@app.post("/admin/simulator/start")
def start_sim(scenario: str = "normal", client_id: str = "demo-client-1", endpoint: str = "/api/products"):
    return simulator_manager.start_simulation(scenario, client_id, endpoint=endpoint)

@app.post("/admin/simulator/stop")
def stop_sim():
    return simulator_manager.stop_all()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
