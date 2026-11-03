import time
import threading
import httpx

def run_traffic_burst(gateway_url: str = "http://127.0.0.1:8000", client_id: str = "sim-burst-user",
                      endpoint: str = None, duration_sec: int = 15, stop_event: threading.Event = None):
    end_time = time.time() + duration_sec
    headers = {"X-Client-ID": client_id}
    target = endpoint or "/api/products"
    with httpx.Client() as client:
        while time.time() < end_time:
            if stop_event and stop_event.is_set():
                break
            try:
                client.get(f"{gateway_url}{target}", headers=headers, timeout=5.0)
            except Exception:
                pass
            time.sleep(0.4)

if __name__ == "__main__":
    run_traffic_burst()
