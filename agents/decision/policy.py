from typing import Dict, Any, Tuple

class SecurityDecisionAgent:
    def make_decision(self, threat: Dict[str, Any], metrics: Dict[str, Any]) -> Dict[str, Any]:
        risk = threat.get("risk_score", 0.0)
        is_genuine_burst = threat.get("is_genuine_burst", False)
        reasons = list(threat.get("reasons", []))
        login_failures = metrics.get("login_failures", 0)
        rpm = metrics.get("requests_per_minute", 0)
        hist_risk = metrics.get("historical_max_risk", 0.0)
        features = threat.get("features", {})

        is_bot_flood = (
            features.get("burst_1s", 0) >= 5
            or (features.get("burst_5s", 0) >= 3 and features.get("avg_interval_sec", 1.0) < 0.15)
            or rpm >= 150
        )

        if risk >= 85.0 or login_failures >= 6 or is_bot_flood:
            action = "BLOCK"
            reasons.append("Critical attack — quota reduced to 0 RPM (BLOCK)")
        elif risk >= 65.0 or login_failures >= 3:
            if hist_risk < 40.0 and login_failures < 3 and rpm < 90:
                action = "STRICT_RATE_LIMIT"
                reasons.append("High risk — quota reduced to 10 RPM (Strict Rate Limit)")
            elif login_failures >= 4:
                action = "BLOCK"
                reasons.append("Repeated login failures — quota reduced to 0 RPM (BLOCK)")
            else:
                action = "STRICT_RATE_LIMIT"
                reasons.append("High risk attack pattern — quota reduced to 10 RPM (Strict Rate Limit)")
        elif risk >= 35.0:
            action = "RATE_LIMIT"
            reasons.append("Suspicious activity — quota reduced to 30 RPM (Rate Limit)")
        elif is_genuine_burst or (rpm >= 35 and login_failures == 0 and risk < 35.0):
            action = "BOOST_RATE_LIMIT"
            reasons.append("Genuine traffic surge — quota increased to 250 RPM (Boost)")
        else:
            action = "ALLOW"
            reasons.append("Normal baseline — 100 RPM standard quota")

        return {
            "client_id": metrics.get("client_id"),
            "risk_score": risk,
            "risk_level": threat.get("risk_level"),
            "decision": action,
            "reason": "; ".join(reasons)
        }
