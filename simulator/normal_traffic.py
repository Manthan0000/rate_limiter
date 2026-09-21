import time
import random
import threading
import httpx

def run_normal_traffic(gateway_url: str = "http://127.0.0.1:8000", client_id: str = "sim-normal-user", endpoint: str = None, duration_sec: int = 30, stop_event: threading.Event = None):
    headers = {"X-Client-ID": client_id}
    end_time = time.time() + duration_sec

    print(f"[SIMULATOR] Starting Normal Traffic for {client_id}...")
    with httpx.Client() as client:
        while time.time() < end_time:
            if stop_event and stop_event.is_set():
                break

            target_ep = endpoint if endpoint else random.choice(["/api/users", "/api/products", "/api/jiohotstar/home", "/api/iiitv/home"])
            try:
                res = client.get(f"{gateway_url}{target_ep}", headers=headers, timeout=5.0)
                print(f"[Normal Traffic] GET {target_ep} -> HTTP {res.status_code}")
            except Exception as e:
                print(f"[Normal Traffic] Error: {e}")
            
            time.sleep(random.uniform(2.5, 4.0))

if __name__ == "__main__":
    run_normal_traffic()
