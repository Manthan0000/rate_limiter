# Agentic AI-Based API Abuse Detection & Dynamic Rate Limiting System

We are building a real, locally running prototype of an **Agentic AI-Based API Abuse Detection and Dynamic Rate Limiting System**. 
Unlike static rate limiters (e.g., 100 req/min fixed), this system dynamically analyzes client behavior in real-time, calculates contextual risk scores, makes adaptive security decisions, applies dynamic mitigations (ALLOW, RATE_LIMIT, STRICT_RATE_LIMIT, CHALLENGE, BLOCK), and updates security policies through a continuous feedback loop.

## Architectural Flow

```text
Client Request
      ↓
API Gateway
      ↓
Traffic Monitoring Agent (Windowing, IP/Token tracking, Auth failure counter)
      ↓
Threat Detection Agent (Rule-based heuristics + ML Isolation Forest anomaly score)
      ↓
Security Decision Agent (Contextual reasoning & policy engine)
      ↓
Rate Limit / Response Agent (ALLOW / RATE_LIMIT / STRICT_RATE_LIMIT / CHALLENGE / BLOCK)
      ↓ (if allowed/rate-limited within quota)
Backend API (/users, /products, /orders, /login, /profile)
      ↓
Feedback Agent (Post-action behavior analysis & policy adjustment)
      ↺
```

---

## User Review Required

> [!IMPORTANT]
> - **Technology Stack**: Python (FastAPI + Uvicorn) for Gateway/Backend/Agents, SQLite + SQLAlchemy for local storage, scikit-learn for Isolation Forest ML model, React + Vite + Recharts for live Dashboard.
> - **Incremental Implementation**: Build first the Gateway + Backend + Core Agents + DB + Simulator + Dashboard, then integrate ML anomaly detection and the feedback loop.
> - **Execution Mode**: The implementation will run on local ports (`8000` for Gateway, `8001` for Backend, `5173` for Dashboard) and includes built-in simulation buttons for live demonstrations.

---

## Proposed Changes

We will create the project inside `d:\RATE LIMITER` with the exact modular structure specified:

### Project Root Files

#### [NEW] [requirements.txt](file:///d:/RATE%20LIMITER/requirements.txt)
Python dependencies: `fastapi`, `uvicorn`, `httpx`, `sqlalchemy`, `pydantic`, `scikit-learn`, `numpy`, `pandas`, `websockets`, `pytest`.

#### [NEW] [.env.example](file:///d:/RATE%20LIMITER/.env.example)
Configuration environment variables for gateway port, backend URL, DB path, and agent thresholds.

#### [NEW] [README.md](file:///d:/RATE%20LIMITER/README.md)
Setup, architecture guide, start commands, and demonstration workflow instructions.

---

### Backend Component (`/backend`)

#### [NEW] [backend/main.py](file:///d:/RATE%20LIMITER/backend/main.py)
FastAPI application providing protected demo API endpoints:
- `GET /api/users`
- `GET /api/products`
- `GET /api/orders`
- `POST /api/login`
- `GET /api/profile`

#### [NEW] [backend/config.py](file:///d:/RATE%20LIMITER/backend/config.py)
Backend service configuration settings.

---

### Database Layer (`/database`)

#### [NEW] [database/database.py](file:///d:/RATE%20LIMITER/database/database.py)
SQLite connection setup, SQLAlchemy engine & session maker.

#### [NEW] [database/models.py](file:///d:/RATE%20LIMITER/database/models.py)
SQLAlchemy DB models:
- `RequestLog`: Timestamp, client_id, IP, endpoint, status_code, size, latency.
- `ClientBehavior`: Client ID, request counts, requests/min, login failures, current risk, risk level, action.
- `SecurityEvent`: Timestamp, client_id, risk_score, decision, reason, action, result status.
- `FeedbackLog`: Event ID, previous action, traffic before/after, outcome, policy recommendation.

#### [NEW] [database/crud.py](file:///d:/RATE%20LIMITER/database/crud.py)
Database operations for logging requests, events, updating client status, and querying dashboard statistics.

---

### API Gateway (`/gateway`)

#### [NEW] [gateway/gateway.py](file:///d:/RATE%20LIMITER/gateway/gateway.py)
Main FastAPI Gateway entrypoint forwarding requests to Backend while invoking the agentic pipeline. Includes WebSocket support for real-time dashboard events.

#### [NEW] [gateway/middleware.py](file:///d:/RATE%20LIMITER/gateway/middleware.py)
Gateway middleware extracting client IP, Headers, Body sizes, and routing requests through agents before forwarding.

#### [NEW] [gateway/rate_limiter.py](file:///d:/RATE%20LIMITER/gateway/rate_limiter.py)
Dynamic sliding-window rate limit state enforcer.

#### [NEW] [gateway/access_control.py](file:///d:/RATE%20LIMITER/gateway/access_control.py)
IP/Client blocking list manager.

---

### Agentic Pipeline (`/agents`)

#### [NEW] [agents/traffic_monitor/monitor.py](file:///d:/RATE%20LIMITER/agents/traffic_monitor/monitor.py)
**Traffic Monitoring Agent**: Maintains sliding-window request statistics per client IP/ID (requests/sec, requests/min, endpoint distribution, auth failure counts, payload sizes).

#### [NEW] [agents/threat_detection/detector.py](file:///d:/RATE%20LIMITER/agents/threat_detection/detector.py)
#### [NEW] [agents/threat_detection/feature_extractor.py](file:///d:/RATE%20LIMITER/agents/threat_detection/feature_extractor.py)
#### [NEW] [agents/threat_detection/risk_scorer.py](file:///d:/RATE%20LIMITER/agents/threat_detection/risk_scorer.py)
**Threat Detection Agent**: Extracts numerical behavioral features, computes configurable rule-based penalty scores, incorporates ML anomaly scores, and outputs a normalized risk score (0-100) with risk categories (NORMAL, SUSPICIOUS, HIGH_RISK, CRITICAL).

#### [NEW] [agents/decision/decision_agent.py](file:///d:/RATE%20LIMITER/agents/decision/decision_agent.py)
#### [NEW] [agents/decision/policy.py](file:///d:/RATE%20LIMITER/agents/decision/policy.py)
**Security Decision Agent**: Evaluates risk score + historical client trustworthiness + endpoint sensitivity + current gateway load to select optimal mitigation (`ALLOW`, `RATE_LIMIT`, `STRICT_RATE_LIMIT`, `CHALLENGE`, `BLOCK`) with explicit human-readable reasons.

#### [NEW] [agents/response/response_agent.py](file:///d:/RATE%20LIMITER/agents/response/response_agent.py)
**Rate Limit / Response Agent**: Executes security decisions dynamically without server restarts (updating rate limits, issuing 429/403 responses, or setting challenge flags).

#### [NEW] [agents/feedback/feedback_agent.py](file:///d:/RATE%20LIMITER/agents/feedback/feedback_agent.py)
**Feedback Agent**: Monitors post-mitigation traffic to evaluate effectiveness, de-escalating relaxed limits when traffic normalizes or escalating to blocks if abuse persists.

---

### Machine Learning Engine (`/ml`)

#### [NEW] [ml/feature_extractor.py](file:///d:/RATE%20LIMITER/ml/feature_extractor.py)
Converts request logs & client metrics into feature vectors for ML models.

#### [NEW] [ml/anomaly_model.py](file:///d:/RATE%20LIMITER/ml/anomaly_model.py)
Isolation Forest model wrapper for detecting abnormal traffic patterns.

#### [NEW] [ml/train.py](file:///d:/RATE%20LIMITER/ml/train.py)
Script to train Isolation Forest model on synthetic/historical traffic logs.

#### [NEW] [ml/predict.py](file:///d:/RATE%20LIMITER/ml/predict.py)
Inference wrapper for real-time risk score integration.

---

### Traffic Simulator & Demo Panel (`/simulator`)

#### [NEW] [simulator/normal_traffic.py](file:///d:/RATE%20LIMITER/simulator/normal_traffic.py)
Generates normal user requests (1-5 req/s across public endpoints).

#### [NEW] [simulator/traffic_burst.py](file:///d:/RATE%20LIMITER/simulator/traffic_burst.py)
Generates high-frequency traffic spikes to trigger `RATE_LIMIT`.

#### [NEW] [simulator/brute_force.py](file:///d:/RATE%20LIMITER/simulator/brute_force.py)
Generates repeated failed `/api/login` requests to trigger `STRICT_RATE_LIMIT` and `BLOCK`.

#### [NEW] [simulator/high_frequency_attack.py](file:///d:/RATE%20LIMITER/simulator/high_frequency_attack.py)
Generates aggressive scraping/DDoS pattern to trigger immediate `BLOCK`.

#### [NEW] [simulator/manager.py](file:///d:/RATE%20LIMITER/simulator/manager.py)
REST controller allowing the dashboard to trigger and stop simulations programmatically.

---

### Dashboard Frontend (`/dashboard`)

#### [NEW] [dashboard/package.json](file:///d:/RATE%20LIMITER/dashboard/package.json)
Vite + React setup with Tailwind CSS, Lucide icons, and Recharts.

#### [NEW] [dashboard/src/App.jsx](file:///d:/RATE%20LIMITER/dashboard/src/App.jsx)
#### [NEW] [dashboard/src/components/StatsOverview.jsx](file:///d:/RATE%20LIMITER/dashboard/src/components/StatsOverview.jsx)
#### [NEW] [dashboard/src/components/LiveTrafficStream.jsx](file:///d:/RATE%20LIMITER/dashboard/src/components/LiveTrafficStream.jsx)
#### [NEW] [dashboard/src/components/CurrentThreatPanel.jsx](file:///d:/RATE%20LIMITER/dashboard/src/components/CurrentThreatPanel.jsx)
#### [NEW] [dashboard/src/components/AgentActivityTrace.jsx](file:///d:/RATE%20LIMITER/dashboard/src/components/AgentActivityTrace.jsx)
#### [NEW] [dashboard/src/components/RiskChart.jsx](file:///d:/RATE%20LIMITER/dashboard/src/components/RiskChart.jsx)
#### [NEW] [dashboard/src/components/DemoControlPanel.jsx](file:///d:/RATE%20LIMITER/dashboard/src/components/DemoControlPanel.jsx)
Real-time dashboard visualizer consuming Gateway REST & WebSocket APIs.

---

### Unit & End-to-End Tests (`/tests`)

#### [NEW] [tests/test_gateway.py](file:///d:/RATE%20LIMITER/tests/test_gateway.py)
#### [NEW] [tests/test_detector.py](file:///d:/RATE%20LIMITER/tests/test_detector.py)
#### [NEW] [tests/test_decision.py](file:///d:/RATE%20LIMITER/tests/test_decision.py)
#### [NEW] [tests/test_rate_limiter.py](file:///d:/RATE%20LIMITER/tests/test_rate_limiter.py)
#### [NEW] [tests/test_end_to_end.py](file:///d:/RATE%20LIMITER/tests/test_end_to_end.py)
Pytest test suite verifying request flow, agent risk calculation, rate-limiting escalation, and feedback loop adaptation.

---

## Verification Plan

### Automated Tests
1. Run pytest test suite:
   ```bash
   pytest tests/
   ```
2. Verify feature extraction & ML anomaly detection training:
   ```bash
   python -m ml.train
   ```

### Manual & Interactive Demonstration
1. Start Gateway & Backend server on local ports.
2. Launch React Dashboard at `http://localhost:5173`.
3. Use Demo Panel buttons:
   - **Normal Traffic**: Observe low risk (~10-25) & `ALLOW` status.
   - **Traffic Burst**: Observe risk jump to ~50-65 & status `RATE_LIMIT` (HTTP 429).
   - **Brute Force**: Observe login failure accumulation, risk score jumping to ~80+ & status `BLOCK` (HTTP 403).
   - **Reset Client**: Clear client history and watch feedback agent restore status to `ALLOW`.
