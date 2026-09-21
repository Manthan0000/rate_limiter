import time
from typing import Dict, Any, List

class FeedbackAgent:
    def __init__(self):
        # client_id -> list of action history entries
        self.action_history: Dict[str, List[Dict[str, Any]]] = {}

    def record_action(self, client_id: str, action: str, risk_score: float, rpm: float) -> Dict[str, Any]:
        now = time.time()
        if client_id not in self.action_history:
            self.action_history[client_id] = []

        history = self.action_history[client_id]
        
        previous_entry = history[-1] if history else None
        
        feedback_result = "STABLE"
        policy_recommendation = "MAINTAIN"

        if previous_entry:
            prev_rpm = previous_entry["rpm"]
            prev_action = previous_entry["action"]

            # If traffic dropped after enforcement
            if rpm < prev_rpm * 0.7:
                feedback_result = "IMPROVED"
                if prev_action in ["RATE_LIMIT", "STRICT_RATE_LIMIT"] and risk_score < 40:
                    policy_recommendation = "RELAX_POLICY"
            # If traffic increased despite enforcement
            elif rpm > prev_rpm * 1.3 and prev_action in ["RATE_LIMIT", "STRICT_RATE_LIMIT"]:
                feedback_result = "ESCALATED"
                policy_recommendation = "ESCALATE_TO_BLOCK"

        entry = {
            "timestamp": now,
            "action": action,
            "risk_score": risk_score,
            "rpm": rpm,
            "feedback_result": feedback_result,
            "policy_recommendation": policy_recommendation
        }
        
        history.append(entry)
        if len(history) > 20:
            history.pop(0)

        return entry

    def get_feedback_summary(self, client_id: str) -> Dict[str, Any]:
        history = self.action_history.get(client_id, [])
        if not history:
            return {"status": "NO_HISTORY"}
        return history[-1]
