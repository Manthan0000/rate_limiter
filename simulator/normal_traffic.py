import time
import random
import httpx

def run_normal_traffic(gateway_url: str = "http://127.0.0.1:8000", client_id: str = "sim-normal-user", duration_sec: int = 30):
    endpoints = ["/api/users", "/api/products", "/api/orders"]
    headers = {"X-Client-ID": client_id}
    end_time = time.time() + duration_sec

    print(f"[SIMULATOR] Starting Normal Traffic for {client_id}...")
    with httpx.Client() as client:
        while time.time() < end_time:
            ep = random.choice(endpoints)
            try:
                res = client.get(f"{gateway_url}{ep}", headers=headers, timeout=5.0)
                print(f"[Normal Traffic] GET {ep} -> HTTP {res.status_code}")
            except Exception as e:
                print(f"[Normal Traffic] Error: {e}")
            time.sleep(random.uniform(0.5, 1.5))

if __name__ == "__main__":
    run_normal_traffic()
