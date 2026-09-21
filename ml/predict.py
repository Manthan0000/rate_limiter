from ml.anomaly_model import AnomalyModel

class MLPredictor:
    def __init__(self):
        self.model = AnomalyModel()

    def predict_anomaly_score(self, feature_vector: list) -> float:
        return self.model.predict_score(feature_vector)
