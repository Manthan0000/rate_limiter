import time
import threading
import httpx

def run_traffic_burst(gateway_url: str = "http://127.0.0.1:8000", client_id: str = "sim-burst-user", endpoint: str = None, duration_sec: int = 15, stop_event: threading.Event = None):
    headers = {"X-Client-ID": client_id}
    end_time = time.time() + duration_sec
    target_ep = endpoint if endpoint else "/api/products"

    print(f"[SIMULATOR] Starting Traffic Burst for {client_id} on {target_ep}...")
    with httpx.Client() as client:
        while time.time() < end_time:
            if stop_event and stop_event.is_set():
                break

            try:
                res = client.get(f"{gateway_url}{target_ep}", headers=headers, timeout=5.0)
                print(f"[Traffic Burst] GET {target_ep} -> HTTP {res.status_code}")
            except Exception as e:
                print(f"[Traffic Burst] Error: {e}")
            
            time.sleep(0.4)

if __name__ == "__main__":
    run_traffic_burst()
