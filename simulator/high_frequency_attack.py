import time
import threading
import httpx

def run_high_frequency_attack(gateway_url: str = "http://127.0.0.1:8000", client_id: str = "sim-ddos-bot",
                              endpoint: str = None, duration_sec: int = 15, stop_event: threading.Event = None):
    headers = {"X-Client-ID": client_id}
    end_time = time.time() + duration_sec
    target = endpoint or "/api/users"

    def worker():
        with httpx.Client() as client:
            while time.time() < end_time:
                if stop_event and stop_event.is_set():
                    break
                try:
                    client.get(f"{gateway_url}{target}", headers=headers, timeout=5.0)
                except Exception:
                    pass
                time.sleep(0.01)

    threads = [threading.Thread(target=worker, daemon=True) for _ in range(5)]
    for t in threads:
        t.start()
    for t in threads:
        t.join(timeout=duration_sec)

if __name__ == "__main__":
    run_high_frequency_attack()
