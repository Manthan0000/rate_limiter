import time
from typing import Dict, Any, List

class FeedbackAgent:
    def __init__(self):
        self.action_history: Dict[str, List[Dict]] = {}

    def record_action(self, client_id: str, action: str, risk_score: float, rpm: float) -> Dict[str, Any]:
        history = self.action_history.setdefault(client_id, [])
        prev = history[-1] if history else None

        feedback_result = "STABLE"
        policy_rec = "MAINTAIN"

        if prev:
            if action == "BOOST_RATE_LIMIT":
                feedback_result, policy_rec = "SCALED_UP", "BOOST_QUOTA_250_RPM"
            elif rpm < prev["rpm"] * 0.7:
                feedback_result = "IMPROVED"
                if prev["action"] in ["RATE_LIMIT", "STRICT_RATE_LIMIT"] and risk_score < 40:
                    policy_rec = "RELAX_POLICY"
            elif rpm > prev["rpm"] * 1.3 and prev["action"] in ["RATE_LIMIT", "STRICT_RATE_LIMIT"]:
                feedback_result, policy_rec = "ESCALATED", "ESCALATE_TO_BLOCK"
            elif action in ["RATE_LIMIT", "STRICT_RATE_LIMIT", "BLOCK"]:
                feedback_result, policy_rec = "THROTTLED", "DECREASE_QUOTA"

        entry = {"timestamp": time.time(), "action": action, "risk_score": risk_score,
                 "rpm": rpm, "feedback_result": feedback_result, "policy_recommendation": policy_rec}
        history.append(entry)
        if len(history) > 20:
            history.pop(0)
        return entry
