import time
import httpx

def run_traffic_burst(gateway_url: str = "http://127.0.0.1:8000", client_id: str = "sim-burst-user", duration_sec: int = 15):
    headers = {"X-Client-ID": client_id}
    end_time = time.time() + duration_sec

    print(f"[SIMULATOR] Starting Traffic Burst for {client_id}...")
    with httpx.Client() as client:
        while time.time() < end_time:
            try:
                res = client.get(f"{gateway_url}/api/products", headers=headers, timeout=5.0)
                print(f"[Traffic Burst] GET /api/products -> HTTP {res.status_code}")
            except Exception as e:
                print(f"[Traffic Burst] Error: {e}")
            time.sleep(0.05) # ~20 requests per second

if __name__ == "__main__":
    run_traffic_burst()
