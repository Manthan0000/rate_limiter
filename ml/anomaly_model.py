import os
import pickle
import numpy as np
from sklearn.ensemble import IsolationForest

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "isolation_forest.pkl")

class AnomalyModel:
    def __init__(self, contamination: float = 0.1):
        self.model = IsolationForest(
            n_estimators=100,
            contamination=contamination,
            random_state=42
        )
        self.is_trained = False
        self._load_if_exists()

    def train(self, feature_matrix: np.ndarray):
        """
        Trains the IsolationForest model on a 2D array of normal & synthetic attack traffic features.
        Features order: [requests_per_minute, burst_5s, login_failures, unique_endpoints, avg_payload_size, endpoint_sensitivity]
        """
        self.model.fit(feature_matrix)
        self.is_trained = True
        self._save_model()

    def predict_score(self, feature_vector: list) -> float:
        """
        Predicts anomaly score scaled between 0.0 (normal) and 100.0 (highly anomalous).
        """
        if not self.is_trained:
            return 0.0

        vector_2d = np.array([feature_vector])
        # decision_function returns negative values for anomalies, positive for normal
        raw_score = self.model.decision_function(vector_2d)[0]
        
        # Transform raw_score (approx -0.5 to 0.5) into 0..100 anomaly index
        # Lower decision function = more anomalous
        anomaly_index = max(0.0, min(100.0, (0.25 - raw_score) * 150.0))
        return round(float(anomaly_index), 1)

    def _save_model(self):
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        with open(MODEL_PATH, "wb") as f:
            pickle.dump(self.model, f)

    def _load_if_exists(self):
        if os.path.exists(MODEL_PATH):
            try:
                with open(MODEL_PATH, "rb") as f:
                    self.model = pickle.load(f)
                self.is_trained = True
            except Exception:
                self.is_trained = False
