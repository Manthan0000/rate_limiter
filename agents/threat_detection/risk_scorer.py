from typing import Dict, Any, Tuple, List

class ConfigurableRiskScorer:
    def __init__(
        self,
        freq_weight: float = 0.4,
        auth_weight: float = 0.35,
        endpoint_weight: float = 0.15,
        burst_weight: float = 0.1,
        normal_max: float = 30.0,
        suspicious_max: float = 60.0,
        high_max: float = 80.0
    ):
        self.freq_weight = freq_weight
        self.auth_weight = auth_weight
        self.endpoint_weight = endpoint_weight
        self.burst_weight = burst_weight
        self.normal_max = normal_max
        self.suspicious_max = suspicious_max
        self.high_max = high_max

    def calculate_risk(
        self,
        features: Dict[str, float],
        ml_anomaly_score: float = 0.0
    ) -> Tuple[float, str, List[str]]:
        rpm = features.get("requests_per_minute", 0)
        burst = features.get("burst_5s", 0)
        login_failures = features.get("login_failures", 0)
        sensitivity = features.get("endpoint_sensitivity", 0.2)

        reasons = []

        # 1. Frequency Score (0 to 100)
        # Normal < 30 rpm; Suspicious 30-90 rpm; Excessive > 100 rpm
        freq_score = min(100.0, (rpm / 80.0) * 100.0)
        if rpm > 60:
            reasons.append(f"High request frequency ({int(rpm)} req/min)")
        elif rpm > 30:
            reasons.append(f"Elevated request frequency ({int(rpm)} req/min)")

        # 2. Authentication Failure Score (0 to 100)
        # 1 failure = 25, 3 failures = 75, 4+ = 100
        auth_score = min(100.0, login_failures * 25.0)
        if login_failures > 0:
            reasons.append(f"Repeated authentication failures ({int(login_failures)} failures)")

        # 3. Burst Score (0 to 100)
        # > 15 requests in 5 sec
        burst_score = min(100.0, (burst / 15.0) * 100.0)
        if burst > 10:
            reasons.append(f"Sudden traffic burst ({int(burst)} reqs/5s)")

        # 4. Sensitive Endpoint Score (0 to 100)
        endpoint_score = sensitivity * 100.0
        if sensitivity >= 0.8:
            reasons.append("Accessing sensitive authentication endpoint")

        # Combine heuristic score
        heuristic_score = (
            freq_score * self.freq_weight +
            auth_score * self.auth_weight +
            burst_score * self.burst_weight +
            endpoint_score * self.endpoint_weight
        )

        # Blend ML anomaly score if available (ML score 0 to 100)
        if ml_anomaly_score > 0:
            final_score = (heuristic_score * 0.7) + (ml_anomaly_score * 0.3)
            if ml_anomaly_score > 60:
                reasons.append(f"ML Anomaly score elevated ({round(ml_anomaly_score, 1)}/100)")
        else:
            final_score = heuristic_score

        # Clamp between 0 and 100
        final_score = max(0.0, min(100.0, round(final_score, 1)))

        # Categorize
        if final_score <= self.normal_max:
            level = "NORMAL"
        elif final_score <= self.suspicious_max:
            level = "SUSPICIOUS"
        elif final_score <= self.high_max:
            level = "HIGH_RISK"
        else:
            level = "CRITICAL"

        if not reasons:
            reasons.append("Normal request behavior pattern")

        return final_score, level, reasons
