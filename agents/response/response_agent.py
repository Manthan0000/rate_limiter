import time
from typing import Dict, Any, Tuple, List, Optional

class ResponseAgent:
    def __init__(self):
        self.quotas = {
            "BOOST_RATE_LIMIT": 250, "ALLOW": 100,
            "RATE_LIMIT": 30, "STRICT_RATE_LIMIT": 10,
            "CHALLENGE": 5, "BLOCK": 0
        }
        self.client_quotas: Dict[str, int] = {}
        self.client_actions: Dict[str, str] = {}
        self.notifications: List[Dict[str, Any]] = []

    def reset(self):
        self.client_quotas.clear()
        self.client_actions.clear()
        self.notifications.clear()

    def execute_response(self, decision: Dict[str, Any], metrics: Dict[str, Any]) -> Tuple[bool, int, Dict]:
        action = decision.get("decision", "ALLOW")
        client_id = metrics.get("client_id", "unknown")
        rpm = metrics.get("requests_per_minute", 0)
        risk = decision.get("risk_score", 0.0)
        reason = decision.get("reason", "")

        prev_quota = self.client_quotas.get(client_id, 100)
        prev_action = self.client_actions.get(client_id, "ALLOW")
        quota = self.quotas.get(action, 100)

        rate_limit_change = "UNCHANGED"
        notification: Optional[Dict] = None

        if quota > prev_quota:
            rate_limit_change = "INCREASED"
            notification = self._make_notif(client_id, "INCREASED", prev_quota, quota, prev_action, action, risk, reason)
        elif quota < prev_quota:
            rate_limit_change = "DECREASED"
            notification = self._make_notif(client_id, "DECREASED", prev_quota, quota, prev_action, action, risk, reason)

        self.client_quotas[client_id] = quota
        self.client_actions[client_id] = action

        if notification:
            self.notifications.insert(0, notification)
            if len(self.notifications) > 50:
                self.notifications.pop()

        base = {"quota": quota, "previous_quota": prev_quota, "rate_limit_change": rate_limit_change,
                "notification": notification, "risk_score": risk}

        if action == "BLOCK":
            return False, 403, {**base, "status": "error", "code": "CLIENT_BLOCKED",
                                "message": "Access blocked by Agentic Security Gateway", "reason": reason}
        if action == "CHALLENGE":
            return False, 403, {**base, "status": "error", "code": "CHALLENGE_REQUIRED",
                                "message": "Security challenge required", "reason": reason}
        if rpm > quota:
            return False, 429, {**base, "status": "error", "code": "RATE_LIMIT_EXCEEDED",
                                "message": f"Rate limit exceeded ({int(rpm)} rpm > {quota} allowed)", "reason": reason}

        return True, 200, {**base, "status": "allowed", "action": action, "current_rpm": rpm}

    def _make_notif(self, client_id, change_type, prev_quota, new_quota, prev_action, new_action, risk, reason):
        title = (f"Rate Limit {'Increased' if change_type == 'INCREASED' else 'Decreased'} "
                 f"({prev_quota} → {new_quota} RPM)")
        if change_type == "DECREASED" and new_quota == 0:
            title = f"Client Blocked (0 RPM) — {prev_quota} → 0 RPM"
        msg = (f"Genuine traffic surge for '{client_id}'. AI increased limit {prev_quota}→{new_quota} rpm."
               if change_type == "INCREASED"
               else f"Attack from '{client_id}'. AI reduced limit {prev_quota}→{new_quota} rpm.")
        return {
            "id": f"notif-{int(time.time()*1000)}-{client_id}",
            "timestamp": time.strftime("%H:%M:%S"),
            "client_id": client_id,
            "change_type": change_type,
            "previous_quota": prev_quota,
            "new_quota": new_quota,
            "previous_action": prev_action,
            "new_action": new_action,
            "risk_score": risk,
            "title": title,
            "message": msg,
            "reason": reason
        }
