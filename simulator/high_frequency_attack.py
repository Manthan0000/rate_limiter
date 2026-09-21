import time
import threading
import httpx

def run_high_frequency_attack(gateway_url: str = "http://127.0.0.1:8000", client_id: str = "sim-ddos-bot", endpoint: str = None, duration_sec: int = 15, stop_event: threading.Event = None):
    headers = {"X-Client-ID": client_id}
    end_time = time.time() + duration_sec
    target_ep = endpoint if endpoint else "/api/users"

    print(f"[SIMULATOR] Starting High Frequency Flood Attack for {client_id} on {target_ep}...")

    def worker():
        with httpx.Client() as client:
            while time.time() < end_time:
                if stop_event and stop_event.is_set():
                    break
                try:
                    res = client.get(f"{gateway_url}{target_ep}", headers=headers, timeout=5.0)
                    print(f"[High-Freq Bot] GET {target_ep} -> HTTP {res.status_code}")
                except Exception as e:
                    print(f"[High-Freq Bot] Error: {e}")
                time.sleep(0.01)

    threads = []
    for _ in range(5):
        t = threading.Thread(target=worker, daemon=True)
        threads.append(t)
        t.start()

    for t in threads:
        t.join(timeout=duration_sec)

if __name__ == "__main__":
    run_high_frequency_attack()
