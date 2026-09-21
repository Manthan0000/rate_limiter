import numpy as np
from ml.anomaly_model import AnomalyModel

def generate_synthetic_training_data(n_samples: int = 1000) -> np.ndarray:
    """
    Generates synthetic feature vectors representing normal web traffic patterns.
    Features: [requests_per_minute, burst_5s, login_failures, unique_endpoints, avg_payload_size, endpoint_sensitivity]
    """
    np.random.seed(42)

    # 1. Normal Traffic (85% of data)
    n_normal = int(n_samples * 0.85)
    rpm_normal = np.random.uniform(1.0, 25.0, n_normal)
    burst_normal = np.random.uniform(0.0, 4.0, n_normal)
    login_fail_normal = np.random.choice([0, 1], size=n_normal, p=[0.95, 0.05])
    unique_ep_normal = np.random.uniform(1.0, 5.0, n_normal)
    payload_normal = np.random.uniform(100, 1500, n_normal)
    sensitivity_normal = np.random.choice([0.2, 0.6, 1.0], size=n_normal, p=[0.6, 0.3, 0.1])

    normal_data = np.column_stack([
        rpm_normal, burst_normal, login_fail_normal, unique_ep_normal, payload_normal, sensitivity_normal
    ])

    # 2. Anomalous Traffic (15% of data)
    n_anomaly = n_samples - n_normal
    rpm_anomaly = np.random.uniform(70.0, 250.0, n_anomaly)
    burst_anomaly = np.random.uniform(12.0, 40.0, n_anomaly)
    login_fail_anomaly = np.random.randint(3, 15, size=n_anomaly)
    unique_ep_anomaly = np.random.uniform(1.0, 2.0, n_anomaly)
    payload_anomaly = np.random.uniform(50, 500, n_anomaly)
    sensitivity_anomaly = np.random.choice([0.6, 1.0], size=n_anomaly, p=[0.3, 0.7])

    anomaly_data = np.column_stack([
        rpm_anomaly, burst_anomaly, login_fail_anomaly, unique_ep_anomaly, payload_anomaly, sensitivity_anomaly
    ])

    return np.vstack([normal_data, anomaly_data])

def train_and_save():
    print("Generating synthetic dataset for Isolation Forest training...")
    data = generate_synthetic_training_data()
    print(f"Dataset shape: {data.shape}")

    model = AnomalyModel(contamination=0.15)
    model.train(data)
    print("Isolation Forest ML model trained and saved successfully!")

if __name__ == "__main__":
    train_and_save()
