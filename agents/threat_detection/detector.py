from typing import Dict, Any, Tuple, List
from .feature_extractor import FeatureExtractor
from .risk_scorer import ConfigurableRiskScorer

class ThreatDetectionAgent:
    def __init__(self, ml_predictor=None):
        self.feature_extractor = FeatureExtractor()
        self.risk_scorer = ConfigurableRiskScorer()
        self.ml_predictor = ml_predictor

    def analyze_client(
        self,
        client_metrics: Dict[str, Any],
        current_endpoint: str
    ) -> Dict[str, Any]:
        features = self.feature_extractor.extract_features(client_metrics, current_endpoint)
        
        ml_score = 0.0
        if self.ml_predictor:
            vector = self.feature_extractor.to_ml_vector(features)
            ml_score = self.ml_predictor.predict_anomaly_score(vector)

        risk_score, risk_level, reasons = self.risk_scorer.calculate_risk(features, ml_anomaly_score=ml_score)

        return {
            "client_id": client_metrics.get("client_id"),
            "risk_score": risk_score,
            "risk_level": risk_level,
            "reasons": reasons,
            "features": features,
            "ml_anomaly_score": ml_score
        }
