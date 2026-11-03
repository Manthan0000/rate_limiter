import time
import random
import threading
import httpx

def run_normal_traffic(gateway_url: str = "http://127.0.0.1:8000", client_id: str = "sim-normal-user",
                       endpoint: str = None, duration_sec: int = 30, stop_event: threading.Event = None):
    end_time = time.time() + duration_sec
    headers = {"X-Client-ID": client_id}
    with httpx.Client() as client:
        while time.time() < end_time:
            if stop_event and stop_event.is_set():
                break
            target = endpoint or random.choice(["/api/users", "/api/products", "/api/jiohotstar/home", "/api/iiitv/home"])
            try:
                client.get(f"{gateway_url}{target}", headers=headers, timeout=5.0)
            except Exception:
                pass
            time.sleep(random.uniform(2.5, 4.0))

if __name__ == "__main__":
    run_normal_traffic()
