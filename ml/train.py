import numpy as np
from ml.anomaly_model import AnomalyModel

def train_and_save(n_samples: int = 1000):
    np.random.seed(42)
    n_normal = int(n_samples * 0.85)
    normal = np.column_stack([
        np.random.uniform(1.0, 25.0, n_normal),
        np.random.uniform(0.0, 4.0, n_normal),
        np.random.choice([0, 1], size=n_normal, p=[0.95, 0.05]),
        np.random.uniform(1.0, 5.0, n_normal),
        np.random.uniform(100, 1500, n_normal),
        np.random.choice([0.2, 0.6, 1.0], size=n_normal, p=[0.6, 0.3, 0.1])
    ])
    n_anomaly = n_samples - n_normal
    anomaly = np.column_stack([
        np.random.uniform(70.0, 250.0, n_anomaly),
        np.random.uniform(12.0, 40.0, n_anomaly),
        np.random.randint(3, 15, size=n_anomaly),
        np.random.uniform(1.0, 2.0, n_anomaly),
        np.random.uniform(50, 500, n_anomaly),
        np.random.choice([0.6, 1.0], size=n_anomaly, p=[0.3, 0.7])
    ])
    model = AnomalyModel(contamination=0.15)
    model.train(np.vstack([normal, anomaly]))
    print("Model trained and saved.")

if __name__ == "__main__":
    train_and_save()
