from typing import Dict, Any, Tuple, List

class ThreatDetectionAgent:
    def __init__(self, ml_predictor=None):
        self.ml_predictor = ml_predictor

    def analyze_client(self, client_metrics: Dict[str, Any], endpoint: str) -> Dict[str, Any]:
        features = self._extract(client_metrics, endpoint)
        ml_score = self.ml_predictor.predict_anomaly_score(self._to_vector(features)) if self.ml_predictor else 0.0
        risk_score, risk_level, reasons = self._score(features, ml_score)
        return {
            "client_id": client_metrics.get("client_id"),
            "risk_score": risk_score,
            "risk_level": risk_level,
            "is_genuine_burst": any("Genuine event" in r for r in reasons),
            "reasons": reasons,
            "features": features,
            "ml_anomaly_score": ml_score
        }

    def _extract(self, m: Dict, endpoint: str) -> Dict[str, float]:
        sensitivity = 0.2
        if "/login" in endpoint:
            sensitivity = 1.0
        elif "/orders" in endpoint or "/profile" in endpoint:
            sensitivity = 0.6
        return {
            "requests_per_minute": float(m.get("requests_per_minute", 0)),
            "burst_5s": float(m.get("burst_5s", 0)),
            "burst_1s": float(m.get("burst_1s", 0)),
            "avg_interval_sec": float(m.get("avg_interval_sec", 1.0)),
            "login_failures": float(m.get("login_failures", 0)),
            "unique_endpoints": float(m.get("unique_endpoints", 1)),
            "avg_payload_size": float(m.get("avg_payload_size", 0)),
            "endpoint_sensitivity": sensitivity
        }

    def _to_vector(self, f: Dict) -> List[float]:
        return [f["requests_per_minute"], f["burst_5s"], f["login_failures"],
                f["unique_endpoints"], f["avg_payload_size"], f["endpoint_sensitivity"]]

    def _score(self, f: Dict, ml_score: float) -> Tuple[float, str, List[str]]:
        rpm = f["requests_per_minute"]
        burst = f["burst_5s"]
        burst_1s = f["burst_1s"]
        interval = f["avg_interval_sec"]
        login_failures = f["login_failures"]
        sensitivity = f["endpoint_sensitivity"]
        reasons = []

        is_bot_flood = (
            burst_1s >= 5
            or (burst >= 3 and interval < 0.15)
            or (burst >= 4 and interval < 0.20)
            or rpm > 210
            or burst > 18
        )
        is_genuine_burst = (
            login_failures == 0 and not is_bot_flood
            and interval >= 0.20 and (rpm >= 35 or burst >= 3)
        )

        if is_genuine_burst:
            reasons.append(f"Genuine event traffic burst ({int(rpm)} req/min, 0 auth failures, interval {interval}s)")
            return round(min(26.0, 12.0 + rpm / 20.0), 1), "NORMAL", reasons

        # Frequency penalty
        if rpm >= 120:
            freq = 85.0; reasons.append(f"Severe high-frequency attack ({int(rpm)} req/min)")
        elif rpm >= 70:
            freq = 65.0; reasons.append(f"High request frequency ({int(rpm)} req/min)")
        elif rpm >= 35:
            freq = 40.0; reasons.append(f"Elevated request frequency ({int(rpm)} req/min)")
        elif rpm >= 20:
            freq = 15.0
        else:
            freq = 0.0

        # Burst penalty
        if is_bot_flood:
            burst_pen = 92.0
            reasons.append(f"Automated bot flood ({int(burst_1s)} reqs/1s, interval {interval}s)")
        elif burst >= 18:
            burst_pen = 90.0; reasons.append(f"Critical request burst ({int(burst)} reqs/5s)")
        elif burst >= 10:
            burst_pen = 65.0; reasons.append(f"Sudden traffic burst ({int(burst)} reqs/5s)")
        elif burst >= 5:
            burst_pen = 25.0
        else:
            burst_pen = 0.0

        # Auth failure penalty
        auth_pen = min(100.0, login_failures * 25.0)
        if login_failures > 0:
            reasons.append(f"Repeated auth failures ({int(login_failures)})")

        # Endpoint sensitivity
        ep_pen = sensitivity * 30.0
        if sensitivity >= 0.8:
            reasons.append("Accessing sensitive auth endpoint")

        primary = max(freq, burst_pen, auth_pen)
        weighted = freq * 0.35 + burst_pen * 0.25 + auth_pen * 0.3 + ep_pen * 0.1
        heuristic = max(primary, weighted)

        if ml_score > 0:
            blended = heuristic * 0.7 + ml_score * 0.3
            final = max(heuristic, blended)
            if ml_score > 60:
                reasons.append(f"ML anomaly score elevated ({round(ml_score, 1)}/100)")
        else:
            final = heuristic

        final = max(0.0, min(100.0, round(final, 1)))

        if final <= 30: level = "NORMAL"
        elif final <= 60: level = "SUSPICIOUS"
        elif final <= 80: level = "HIGH_RISK"
        else: level = "CRITICAL"

        if not reasons:
            reasons.append("Normal request pattern")
        return final, level, reasons
