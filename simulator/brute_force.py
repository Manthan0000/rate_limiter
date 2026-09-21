import time
import httpx

def run_brute_force(gateway_url: str = "http://127.0.0.1:8000", client_id: str = "sim-brute-attacker", duration_sec: int = 15):
    headers = {"X-Client-ID": client_id, "Content-Type": "application/json"}
    end_time = time.time() + duration_sec
    attempt = 1

    print(f"[SIMULATOR] Starting Brute Force Login Attack for {client_id}...")
    with httpx.Client() as client:
        while time.time() < end_time:
            payload = {"username": "admin", "password": f"wrongpass_{attempt}"}
            try:
                res = client.post(f"{gateway_url}/api/login", json=payload, headers=headers, timeout=5.0)
                print(f"[Brute Force #{attempt}] POST /api/login -> HTTP {res.status_code}")
            except Exception as e:
                print(f"[Brute Force] Error: {e}")
            attempt += 1
            time.sleep(0.3)

if __name__ == "__main__":
    run_brute_force()
