import time
import json
import asyncio
import httpx
from fastapi import FastAPI, Request, Response, WebSocket, WebSocketDisconnect, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from database.database import init_db, SessionLocal
from database import crud
from agents.traffic_monitor.monitor import TrafficMonitoringAgent
from agents.threat_detection.detector import ThreatDetectionAgent
from agents.decision.decision_agent import SecurityDecisionAgent
from agents.response.response_agent import ResponseAgent
from agents.feedback.feedback_agent import FeedbackAgent
from ml.predict import MLPredictor
from simulator.manager import SimulatorManager

BACKEND_URL = "http://127.0.0.1:8001"
CURRENT_SECURITY_MODE = "DYNAMIC" # "DYNAMIC" or "STATIC"
STATIC_RATE_LIMIT_QUOTA = 50

app = FastAPI(
    title="Agentic Security API Gateway",
    description="Intelligent Reverse Proxy Gateway protecting backend APIs with Agentic AI Security Loop",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database schema
init_db()

# Initialize Agents
monitor_agent = TrafficMonitoringAgent()
ml_predictor = MLPredictor()
detector_agent = ThreatDetectionAgent(ml_predictor=ml_predictor)
decision_agent = SecurityDecisionAgent()
response_agent = ResponseAgent()
feedback_agent = FeedbackAgent()
simulator_manager = SimulatorManager(gateway_url="http://127.0.0.1:8000")

# WebSocket Connection Manager for Live Dashboard
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

ws_manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

def extract_client_id(request: Request) -> str:
    custom_id = request.headers.get("X-Client-ID")
    if custom_id:
        return custom_id
    client_host = request.client.host if request.client else "127.0.0.1"
    return client_host

# Core Request Processing Pipeline
@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_gateway(request: Request, path: str):
    start_time = time.time()
    client_id = extract_client_id(request)
    ip = request.client.host if request.client else "127.0.0.1"
    target_endpoint = f"/api/{path}"
    method = request.method

    # Read body payload size
    body_bytes = await request.body()
    payload_size = len(body_bytes)

    # Check if request is a login attempt with potential auth failure simulation
    is_login_attempt = ("/login" in target_endpoint)
    is_auth_failure = False

    if is_login_attempt and method == "POST" and payload_size > 0:
        try:
            body_json = json.loads(body_bytes)
            if body_json.get("username") not in ["admin", "subscriber", "student"] or body_json.get("password") not in ["secret123", "hotstar123", "iiitv2026"]:
                is_auth_failure = True
        except Exception:
            pass

    # Step 1: Traffic Monitoring Agent (Metrics gathering)
    client_metrics = monitor_agent.record_request(
        client_id=client_id,
        ip=ip,
        endpoint=target_endpoint,
        method=method,
        payload_size=payload_size,
        is_login_attempt=is_login_attempt,
        is_auth_failure=is_auth_failure
    )

    if CURRENT_SECURITY_MODE == "STATIC":
        # Static Rate Limiting Mode: Fixed 50 req/min rule, no AI risk scoring
        rpm = client_metrics["requests_per_minute"]
        if rpm > STATIC_RATE_LIMIT_QUOTA:
            should_allow = False
            backend_status = 429
            action = "STATIC_RATE_LIMIT"
            reason = f"Static rule triggered: fixed limit exceeded ({int(rpm)} req/min > {STATIC_RATE_LIMIT_QUOTA} quota)"
            response_data = {"status": "error", "code": "STATIC_RATE_LIMIT_EXCEEDED", "message": reason}
        else:
            should_allow = True
            backend_status = 200
            action = "ALLOW"
            reason = f"Static rule allowed: count within fixed {STATIC_RATE_LIMIT_QUOTA} req/min quota"
            response_data = {"status": "allowed"}

        risk_score = 0.0
        risk_level = "STATIC_MODE"
        threat_assessment = {"ml_anomaly_score": 0.0}
        feedback_entry = {"feedback_result": "N/A (STATIC)", "policy_recommendation": "STATIC"}

    else:
        # Agentic AI Dynamic Security Mode: Full 5-Agent pipeline
        threat_assessment = detector_agent.analyze_client(client_metrics, target_endpoint)
        risk_score = threat_assessment["risk_score"]
        risk_level = threat_assessment["risk_level"]
        monitor_agent.update_historical_risk(client_id, risk_score)

        decision_result = decision_agent.make_decision(threat_assessment, client_metrics)
        action = decision_result["decision"]
        reason = decision_result["reason"]

        should_allow, backend_status, response_data = response_agent.execute_response(
            decision_result,
            client_metrics
        )

        feedback_entry = feedback_agent.record_action(
            client_id=client_id,
            action=action,
            risk_score=risk_score,
            rpm=client_metrics["requests_per_minute"]
        )

    # Step 5: Execute or Block
    latency_ms = round((time.time() - start_time) * 1000.0, 2)
    response_body = response_data

    if should_allow:
        # Forward request to Backend service
        async with httpx.AsyncClient() as client:
            try:
                headers = dict(request.headers)
                headers.pop("host", None)
                
                target_url = f"{BACKEND_URL}{target_endpoint}"
                backend_res = await client.request(
                    method=method,
                    url=target_url,
                    headers=headers,
                    content=body_bytes,
                    timeout=5.0
                )
                backend_status = backend_res.status_code
                try:
                    response_body = backend_res.json()
                except Exception:
                    response_body = {"raw": backend_res.text}

                if backend_status == 401:
                    monitor_agent.record_request(
                        client_id, ip, target_endpoint, method, payload_size, True, True
                    )

            except httpx.RequestError as exc:
                backend_status = 503
                response_body = {"status": "error", "message": f"Backend unreachable: {str(exc)}"}

    # Database Persistence
    db = SessionLocal()
    try:
        crud.log_request(
            db, client_id, ip, target_endpoint, method, backend_status, payload_size, len(str(response_body)), latency_ms
        )
        crud.upsert_client_behavior(
            db, client_id, ip, client_metrics["request_count"], client_metrics["requests_per_minute"],
            client_metrics["login_failures"], risk_score, risk_level, action
        )
        sec_event = crud.log_security_event(
            db, client_id, target_endpoint, risk_score, action, reason, action, backend_status
        )
        crud.log_feedback(
            db, client_id, action, client_metrics["requests_per_minute"], client_metrics["requests_per_minute"],
            feedback_entry["feedback_result"], feedback_entry["policy_recommendation"], sec_event.id
        )
    finally:
        db.close()

    # Broadcast Event to Live Dashboard WebSocket
    event_payload = {
        "timestamp": time.strftime("%H:%M:%S"),
        "client_id": client_id,
        "ip": ip,
        "endpoint": target_endpoint,
        "method": method,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "action": action,
        "status_code": backend_status,
        "reason": reason,
        "mode": CURRENT_SECURITY_MODE,
        "metrics": client_metrics,
        "agent_trace": [
            {"agent": "Traffic Monitoring Agent", "status": "Request analyzed", "details": f"{int(client_metrics['requests_per_minute'])} req/min, {client_metrics['login_failures']} auth fails"},
            {"agent": "Threat Detection Agent", "status": f"Mode = {CURRENT_SECURITY_MODE}", "details": f"Risk = {risk_score}, Level = {risk_level}"},
            {"agent": "Security Decision Agent", "status": f"Decision = {action}", "details": reason},
            {"agent": "Response Agent", "status": f"Enforced HTTP {backend_status}", "details": f"Allowed = {should_allow}"},
            {"agent": "Feedback Agent", "status": f"Feedback = {feedback_entry['feedback_result']}", "details": f"Recommendation = {feedback_entry['policy_recommendation']}"}
        ]
    }
    
    asyncio.create_task(ws_manager.broadcast(event_payload))

    return Response(
        content=json.dumps(response_body),
        status_code=backend_status,
        media_type="application/json"
    )

# --- Admin & Dashboard REST APIs ---
@app.get("/admin/mode")
def get_security_mode():
    return {"mode": CURRENT_SECURITY_MODE, "static_quota": STATIC_RATE_LIMIT_QUOTA}

@app.post("/admin/mode")
def set_security_mode(mode: str):
    global CURRENT_SECURITY_MODE
    if mode.upper() in ["STATIC", "DYNAMIC"]:
        CURRENT_SECURITY_MODE = mode.upper()
        return {"status": "success", "mode": CURRENT_SECURITY_MODE}
    raise HTTPException(status_code=400, detail="Invalid mode. Must be STATIC or DYNAMIC")

@app.get("/admin/stats")
def get_admin_stats():
    db = SessionLocal()
    try:
        return crud.get_top_stats(db)
    finally:
        db.close()

@app.get("/admin/requests")
def get_admin_requests(limit: int = 50):
    db = SessionLocal()
    try:
        reqs = crud.get_recent_requests(db, limit=limit)
        return [
            {
                "id": r.id,
                "timestamp": r.timestamp.strftime("%Y-%m-%d %H:%M:%S") if r.timestamp else "",
                "client_id": r.client_id,
                "ip": r.ip,
                "endpoint": r.endpoint,
                "method": r.method,
                "status_code": r.status_code,
                "latency_ms": r.latency_ms
            } for r in reqs
        ]
    finally:
        db.close()

@app.get("/admin/events")
def get_admin_events(limit: int = 50):
    db = SessionLocal()
    try:
        events = crud.get_recent_events(db, limit=limit)
        return [
            {
                "id": e.id,
                "timestamp": e.timestamp.strftime("%Y-%m-%d %H:%M:%S") if e.timestamp else "",
                "client_id": e.client_id,
                "endpoint": e.endpoint,
                "risk_score": e.risk_score,
                "decision": e.decision,
                "reason": e.reason,
                "action": e.action,
                "result": e.result
            } for e in events
        ]
    finally:
        db.close()

@app.get("/admin/clients")
def get_admin_clients():
    db = SessionLocal()
    try:
        clients = crud.get_all_client_behaviors(db)
        return [
            {
                "client_id": c.client_id,
                "ip": c.ip,
                "request_count": c.request_count,
                "requests_per_minute": c.requests_per_minute,
                "login_failures": c.login_failures,
                "current_risk": c.current_risk,
                "risk_level": c.risk_level,
                "current_action": c.current_action,
                "last_seen": c.last_seen.strftime("%Y-%m-%d %H:%M:%S") if c.last_seen else ""
            } for c in clients
        ]
    finally:
        db.close()

@app.post("/admin/reset")
def reset_all():
    db = SessionLocal()
    try:
        crud.reset_db_data(db)
        simulator_manager.stop_all()
        return {"status": "success", "message": "System state & database reset successfully"}
    finally:
        db.close()

@app.post("/admin/simulator/start")
def start_simulator(scenario: str = "normal", client_id: str = "demo-client-1", endpoint: str = "/api/products"):
    res = simulator_manager.start_simulation(scenario, client_id, endpoint=endpoint)
    return res

@app.post("/admin/simulator/stop")
def stop_simulator():
    res = simulator_manager.stop_all()
    return res

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
