from typing import Dict, Any, List

class FeatureExtractor:
    @staticmethod
    def extract_features(client_metrics: Dict[str, Any], current_endpoint: str) -> Dict[str, float]:
        """
        Transforms raw client monitoring metrics into standardized numerical features.
        """
        rpm = float(client_metrics.get("requests_per_minute", 0))
        burst = float(client_metrics.get("burst_5s", 0))
        login_failures = float(client_metrics.get("login_failures", 0))
        unique_endpoints = float(client_metrics.get("unique_endpoints", 1))
        avg_payload_size = float(client_metrics.get("avg_payload_size", 0))
        
        # Endpoint sensitivity weighting
        endpoint_sensitivity = 0.2
        if "/login" in current_endpoint:
            endpoint_sensitivity = 1.0
        elif "/orders" in current_endpoint or "/profile" in current_endpoint:
            endpoint_sensitivity = 0.6

        return {
            "requests_per_minute": rpm,
            "burst_5s": burst,
            "login_failures": login_failures,
            "unique_endpoints": unique_endpoints,
            "avg_payload_size": avg_payload_size,
            "endpoint_sensitivity": endpoint_sensitivity
        }

    @staticmethod
    def to_ml_vector(features: Dict[str, float]) -> List[float]:
        """
        Converts feature dict to a ordered list vector for ML model inference.
        """
        return [
            features["requests_per_minute"],
            features["burst_5s"],
            features["login_failures"],
            features["unique_endpoints"],
            features["avg_payload_size"],
            features["endpoint_sensitivity"]
        ]
