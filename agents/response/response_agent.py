from typing import Dict, Any, Tuple

class ResponseAgent:
    def __init__(self):
        # Quota limits per action
        self.quotas = {
            "ALLOW": 100,
            "RATE_LIMIT": 30,
            "STRICT_RATE_LIMIT": 10,
            "CHALLENGE": 5,
            "BLOCK": 0
        }

    def execute_response(
        self,
        decision_result: Dict[str, Any],
        client_metrics: Dict[str, Any]
    ) -> Tuple[bool, int, Dict[str, Any]]:
        """
        Executes decision against current client metrics.
        Returns: (should_allow: bool, http_status_code: int, response_details: dict)
        """
        action = decision_result.get("decision", "ALLOW")
        rpm = client_metrics.get("requests_per_minute", 0)
        risk_score = decision_result.get("risk_score", 0.0)
        reason = decision_result.get("reason", "")

        quota = self.quotas.get(action, 100)

        if action == "BLOCK":
            return False, 403, {
                "status": "error",
                "code": "CLIENT_BLOCKED",
                "message": "Access blocked by Agentic Security Gateway",
                "risk_score": risk_score,
                "reason": reason
            }

        if action == "CHALLENGE":
            return False, 403, {
                "status": "error",
                "code": "CHALLENGE_REQUIRED",
                "message": "Security verification challenge required",
                "risk_score": risk_score,
                "reason": reason
            }

        if rpm > quota:
            return False, 429, {
                "status": "error",
                "code": "RATE_LIMIT_EXCEEDED",
                "message": f"Rate limit exceeded ({int(rpm)} req/min > allowed {quota} req/min for action {action})",
                "risk_score": risk_score,
                "quota": quota,
                "current_rpm": rpm,
                "reason": reason
            }

        return True, 200, {
            "status": "allowed",
            "action": action,
            "quota": quota,
            "current_rpm": rpm,
            "risk_score": risk_score
        }
