import time
import httpx

def run_high_frequency_attack(gateway_url: str = "http://127.0.0.1:8000", client_id: str = "sim-ddos-bot", duration_sec: int = 15):
    headers = {"X-Client-ID": client_id}
    end_time = time.time() + duration_sec

    print(f"[SIMULATOR] Starting High Frequency Attack for {client_id}...")
    with httpx.Client() as client:
        while time.time() < end_time:
            try:
                res = client.get(f"{gateway_url}/api/users", headers=headers, timeout=5.0)
                print(f"[High-Freq Bot] GET /api/users -> HTTP {res.status_code}")
            except Exception as e:
                print(f"[High-Freq Bot] Error: {e}")
            time.sleep(0.01) # ~100 requests per second

if __name__ == "__main__":
    run_high_frequency_attack()
