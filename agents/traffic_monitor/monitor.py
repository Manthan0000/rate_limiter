import time
from collections import defaultdict, deque
from typing import Dict, Any, List

class TrafficMonitoringAgent:
    def __init__(self, window_seconds: int = 60):
        self.window_seconds = window_seconds
        # client_id -> deque of timestamps
        self.request_timestamps: Dict[str, deque] = defaultdict(deque)
        # client_id -> deque of (timestamp, endpoint, status_code, is_login_failure, payload_size)
        self.request_history: Dict[str, deque] = defaultdict(deque)
        # client_id -> login failure timestamps
        self.login_failures: Dict[str, deque] = defaultdict(deque)
        # client_id -> Dict[endpoint, count]
        self.endpoint_counts: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
        # client_id -> client IP
        self.client_ips: Dict[str, str] = {}
        # Historical max risk recorded
        self.historical_risk: Dict[str, float] = defaultdict(float)

    def record_request(self, client_id: str, ip: str, endpoint: str, method: str, payload_size: int = 0, is_login_attempt: bool = False, is_auth_failure: bool = False) -> Dict[str, Any]:
        now = time.time()
        self.client_ips[client_id] = ip

        # Add timestamp
        self.request_timestamps[client_id].append(now)
        self.request_history[client_id].append({
            "timestamp": now,
            "endpoint": endpoint,
            "method": method,
            "payload_size": payload_size,
            "is_auth_failure": is_auth_failure
        })
        self.endpoint_counts[client_id][endpoint] += 1

        if is_auth_failure:
            self.login_failures[client_id].append(now)

        # Cleanup old entries outside window_seconds
        self._cleanup_old_records(client_id, now)

        # Compute current window metrics
        return self.get_client_metrics(client_id)

    def _cleanup_old_records(self, client_id: str, now: float):
        cutoff = now - self.window_seconds

        # Clean request timestamps
        while self.request_timestamps[client_id] and self.request_timestamps[client_id][0] < cutoff:
            self.request_timestamps[client_id].popleft()

        # Clean request history
        while self.request_history[client_id] and self.request_history[client_id][0]["timestamp"] < cutoff:
            self.request_history[client_id].popleft()

        # Clean login failures
        while self.login_failures[client_id] and self.login_failures[client_id][0] < cutoff:
            self.login_failures[client_id].popleft()

    def get_client_metrics(self, client_id: str) -> Dict[str, Any]:
        now = time.time()
        self._cleanup_old_records(client_id, now)

        total_in_window = len(self.request_timestamps[client_id])
        
        # Calculate short-term burst (last 5 seconds)
        short_cutoff = now - 5.0
        burst_5s = sum(1 for t in self.request_timestamps[client_id] if t >= short_cutoff)

        # Calculate projected requests per minute (extrapolated from burst if high)
        projected_rpm = max(total_in_window, int((burst_5s / 5.0) * 60))
        requests_per_sec = round(burst_5s / 5.0, 2)

        login_failure_count = len(self.login_failures[client_id])
        unique_endpoints = len(set(req["endpoint"] for req in self.request_history[client_id]))

        # Calculate average payload size
        history = self.request_history[client_id]
        avg_payload_size = (sum(r["payload_size"] for r in history) / len(history)) if history else 0.0

        return {
            "client_id": client_id,
            "ip": self.client_ips.get(client_id, "127.0.0.1"),
            "request_count": total_in_window,
            "requests_per_second": requests_per_sec,
            "requests_per_minute": projected_rpm,
            "burst_5s": burst_5s,
            "login_failures": login_failure_count,
            "unique_endpoints": unique_endpoints,
            "avg_payload_size": avg_payload_size,
            "endpoint_distribution": dict(self.endpoint_counts[client_id]),
            "historical_max_risk": self.historical_risk.get(client_id, 0.0)
        }

    def update_historical_risk(self, client_id: str, risk: float):
        if risk > self.historical_risk[client_id]:
            self.historical_risk[client_id] = risk

    def reset_client(self, client_id: str):
        self.request_timestamps[client_id].clear()
        self.request_history[client_id].clear()
        self.login_failures[client_id].clear()
        self.endpoint_counts[client_id].clear()
        self.historical_risk[client_id] = 0.0
