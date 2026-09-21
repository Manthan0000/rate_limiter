from typing import Dict, Any
from .policy import SecurityPolicyEngine

class SecurityDecisionAgent:
    def __init__(self):
        self.policy_engine = SecurityPolicyEngine()

    def make_decision(
        self,
        threat_assessment: Dict[str, Any],
        client_metrics: Dict[str, Any],
        gateway_load: float = 0.0
    ) -> Dict[str, Any]:
        action, explanation = self.policy_engine.evaluate_policy(
            threat_assessment,
            client_metrics,
            gateway_load
        )

        return {
            "client_id": client_metrics.get("client_id"),
            "risk_score": threat_assessment.get("risk_score"),
            "risk_level": threat_assessment.get("risk_level"),
            "decision": action,
            "reason": explanation,
            "gateway_load": gateway_load
        }
