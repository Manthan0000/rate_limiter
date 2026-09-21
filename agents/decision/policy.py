from typing import Dict, Any, Tuple, List

class SecurityPolicyEngine:
    def __init__(self):
        pass

    def evaluate_policy(
        self,
        threat_assessment: Dict[str, Any],
        client_metrics: Dict[str, Any],
        gateway_load: float = 0.0
    ) -> Tuple[str, str]:
        """
        Evaluates context and decides action:
        ALLOW, RATE_LIMIT, STRICT_RATE_LIMIT, CHALLENGE, BLOCK
        """
        risk_score = threat_assessment.get("risk_score", 0.0)
        risk_level = threat_assessment.get("risk_level", "NORMAL")
        detected_reasons = threat_assessment.get("reasons", [])
        login_failures = client_metrics.get("login_failures", 0)
        rpm = client_metrics.get("requests_per_minute", 0)
        hist_risk = client_metrics.get("historical_max_risk", 0.0)

        action = "ALLOW"
        decision_reasons = list(detected_reasons)

        if risk_score >= 85.0 or login_failures >= 6:
            action = "BLOCK"
            decision_reasons.append("Critical risk score threshold exceeded or severe login failures")
        elif risk_score >= 65.0 or login_failures >= 3:
            # Check client history: if client has been previously trustworthy, rate limit instead of block
            if hist_risk < 40.0 and login_failures < 3 and rpm < 90:
                action = "STRICT_RATE_LIMIT"
                decision_reasons.append("High risk detected, applying strict rate limiting (preserving clean history)")
            else:
                action = "STRICT_RATE_LIMIT" if login_failures < 4 else "BLOCK"
                decision_reasons.append("High risk combined with suspicious pattern or multiple login failures")
        elif risk_score >= 35.0 or rpm > 45:
            action = "RATE_LIMIT"
            decision_reasons.append("Moderate risk or elevated request rate detected")
        else:
            action = "ALLOW"
            decision_reasons.append("Request within normal baseline thresholds")

        explanation = "; ".join(decision_reasons)
        return action, explanation
