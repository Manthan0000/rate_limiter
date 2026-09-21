from typing import Dict, Any, Tuple, List

class ConfigurableRiskScorer:
    def __init__(
        self,
        normal_max: float = 30.0,
        suspicious_max: float = 60.0,
        high_max: float = 80.0
    ):
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

        # 1. Frequency Penalty (0 to 100)
        freq_penalty = 0.0
        if rpm >= 120:
            freq_penalty = 85.0
            reasons.append(f"Severe high-frequency attack detected ({int(rpm)} req/min)")
        elif rpm >= 70:
            freq_penalty = 65.0
            reasons.append(f"High request frequency ({int(rpm)} req/min)")
        elif rpm >= 35:
            freq_penalty = 40.0
            reasons.append(f"Elevated request frequency ({int(rpm)} req/min)")
        elif rpm >= 20:
            freq_penalty = 15.0

        # 2. Burst Penalty (requests in last 5 seconds)
        burst_penalty = 0.0
        if burst >= 18:
            burst_penalty = 90.0
            reasons.append(f"Critical request burst ({int(burst)} reqs/5s)")
        elif burst >= 10:
            burst_penalty = 65.0
            reasons.append(f"Sudden traffic burst ({int(burst)} reqs/5s)")
        elif burst >= 5:
            burst_penalty = 25.0

        # 3. Authentication Failure Penalty
        auth_penalty = min(100.0, login_failures * 25.0)
        if login_failures > 0:
            reasons.append(f"Repeated authentication failures ({int(login_failures)} failures)")

        # 4. Sensitive Endpoint Penalty
        endpoint_penalty = sensitivity * 30.0
        if sensitivity >= 0.8:
            reasons.append("Accessing sensitive authentication endpoint")

        # Dynamic max threat assessment
        primary_threat = max(freq_penalty, burst_penalty, auth_penalty)
        weighted_score = (freq_penalty * 0.35) + (burst_penalty * 0.25) + (auth_penalty * 0.3) + (endpoint_penalty * 0.1)

        heuristic_score = max(primary_threat, weighted_score)

        # Blend ML anomaly score if available
        if ml_anomaly_score > 0:
            final_score = (heuristic_score * 0.7) + (ml_anomaly_score * 0.3)
            if ml_anomaly_score > 60:
                reasons.append(f"ML Anomaly score elevated ({round(ml_anomaly_score, 1)}/100)")
        else:
            final_score = heuristic_score

        # Clamp between 0 and 100
        final_score = max(0.0, min(100.0, round(final_score, 1)))

        # Categorize Level
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
