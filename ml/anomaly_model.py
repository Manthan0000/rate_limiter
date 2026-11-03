import os
import pickle
import numpy as np
from sklearn.ensemble import IsolationForest

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "isolation_forest.pkl")

class AnomalyModel:
    def __init__(self, contamination: float = 0.1):
        self.model = IsolationForest(n_estimators=100, contamination=contamination, random_state=42)
        self.is_trained = False
        self._load()

    def train(self, feature_matrix: np.ndarray):
        self.model.fit(feature_matrix)
        self.is_trained = True
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        with open(MODEL_PATH, "wb") as f:
            pickle.dump(self.model, f)

    def predict_score(self, feature_vector: list) -> float:
        if not self.is_trained:
            return 0.0
        raw_score = self.model.decision_function(np.array([feature_vector]))[0]
        return round(float(max(0.0, min(100.0, (0.25 - raw_score) * 150.0))), 1)

    def _load(self):
        if os.path.exists(MODEL_PATH):
            try:
                with open(MODEL_PATH, "rb") as f:
                    self.model = pickle.load(f)
                self.is_trained = True
            except Exception:
                self.is_trained = False
