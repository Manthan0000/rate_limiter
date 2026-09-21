# Agentic AI-Based API Abuse Detection & Dynamic Rate Limiting System

An intelligent API security gateway that continuously observes API traffic, detects abnormal client behavior, calculates contextual risk scores, makes security decisions, dynamically applies rate limits or blocks, and adapts policies using a feedback loop.

## Architectural Flow

```text
Client Request
      ↓
API Gateway
      ↓
Traffic Monitoring Agent (Windowing & metrics gathering)
      ↓
Threat Detection Agent (Rule heuristics + ML Isolation Forest)
      ↓
Security Decision Agent (Context reasoning & explainable policy engine)
      ↓
Rate Limit / Response Agent (ALLOW, RATE_LIMIT, STRICT_RATE_LIMIT, CHALLENGE, BLOCK)
      ↓
Backend API (/users, /products, /orders, /login, /profile)
      ↓
Feedback Agent (Post-action monitoring & policy adaptation)
      ↺
```

## Setup & Running

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Install Backend Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run Backend API
```bash
uvicorn backend.main:app --port 8001 --reload
```

### 3. Run API Gateway
```bash
uvicorn gateway.gateway:app --port 8000 --reload
```

### 4. Run Dashboard Frontend
```bash
cd dashboard
npm install
npm run dev
```

### 5. Run Traffic Simulations
Use the buttons on the dashboard or run CLI generators directly:
```bash
python -m simulator.normal_traffic
python -m simulator.brute_force
```
