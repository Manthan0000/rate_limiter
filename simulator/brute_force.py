import time
import threading
import httpx

def run_brute_force(gateway_url: str = "http://127.0.0.1:8000", client_id: str = "sim-brute-attacker",
                    endpoint: str = None, duration_sec: int = 15, stop_event: threading.Event = None):
    headers = {"X-Client-ID": client_id, "Content-Type": "application/json"}
    end_time = time.time() + duration_sec
    target = endpoint if (endpoint and "login" in endpoint) else "/api/login"
    attempt = 1
    with httpx.Client() as client:
        while time.time() < end_time:
            if stop_event and stop_event.is_set():
                break
            try:
                client.post(f"{gateway_url}{target}",
                            json={"username": "admin", "password": f"wrongpass_{attempt}"},
                            headers=headers, timeout=5.0)
            except Exception:
                pass
            attempt += 1
            time.sleep(0.5)

if __name__ == "__main__":
    run_brute_force()
