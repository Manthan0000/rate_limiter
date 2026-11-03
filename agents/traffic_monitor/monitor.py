import time
from collections import defaultdict, deque
from typing import Dict, Any

class TrafficMonitoringAgent:
    def __init__(self, window_seconds: int = 60):
        self.window_seconds = window_seconds
        self.request_timestamps: Dict[str, deque] = defaultdict(deque)
        self.request_history: Dict[str, deque] = defaultdict(deque)
        self.login_failures: Dict[str, deque] = defaultdict(deque)
        self.endpoint_counts: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
        self.client_ips: Dict[str, str] = {}
        self.historical_risk: Dict[str, float] = defaultdict(float)

    def record_request(self, client_id, ip, endpoint, method, payload_size=0, is_login_attempt=False, is_auth_failure=False):
        now = time.time()
        self.client_ips[client_id] = ip
        self.request_timestamps[client_id].append(now)
        self.request_history[client_id].append({
            "timestamp": now, "endpoint": endpoint,
            "method": method, "payload_size": payload_size, "is_auth_failure": is_auth_failure
        })
        self.endpoint_counts[client_id][endpoint] += 1
        if is_auth_failure:
            self.login_failures[client_id].append(now)
        self._cleanup(client_id, now)
        return self.get_metrics(client_id)

    def _cleanup(self, client_id, now):
        cutoff = now - self.window_seconds
        for dq in [self.request_timestamps[client_id], self.login_failures[client_id]]:
            while dq and dq[0] < cutoff:
                dq.popleft()
        while self.request_history[client_id] and self.request_history[client_id][0]["timestamp"] < cutoff:
            self.request_history[client_id].popleft()

    def get_metrics(self, client_id) -> Dict[str, Any]:
        now = time.time()
        self._cleanup(client_id, now)
        total = len(self.request_timestamps[client_id])
        recent_5s = [t for t in self.request_timestamps[client_id] if t >= now - 5.0]
        burst_5s = len(recent_5s)
        burst_1s = sum(1 for t in recent_5s if t >= now - 1.0)
        avg_interval = round(
            sum(recent_5s[i] - recent_5s[i-1] for i in range(1, len(recent_5s))) / (len(recent_5s) - 1), 3
        ) if len(recent_5s) >= 2 else 1.0
        projected_rpm = max(total, int((burst_5s / 5.0) * 60))
        history = self.request_history[client_id]
        return {
            "client_id": client_id,
            "ip": self.client_ips.get(client_id, "127.0.0.1"),
            "request_count": total,
            "requests_per_second": round(burst_5s / 5.0, 2),
            "requests_per_minute": projected_rpm,
            "burst_5s": burst_5s,
            "burst_1s": burst_1s,
            "avg_interval_sec": avg_interval,
            "login_failures": len(self.login_failures[client_id]),
            "unique_endpoints": len(set(r["endpoint"] for r in history)),
            "avg_payload_size": (sum(r["payload_size"] for r in history) / len(history)) if history else 0.0,
            "endpoint_distribution": dict(self.endpoint_counts[client_id]),
            "historical_max_risk": self.historical_risk.get(client_id, 0.0)
        }

    def update_historical_risk(self, client_id, risk):
        if risk > self.historical_risk[client_id]:
            self.historical_risk[client_id] = risk
