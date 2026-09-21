import threading
import time
from typing import Dict, Any

from simulator.normal_traffic import run_normal_traffic
from simulator.traffic_burst import run_traffic_burst
from simulator.brute_force import run_brute_force
from simulator.high_frequency_attack import run_high_frequency_attack

class SimulatorManager:
    def __init__(self, gateway_url: str = "http://127.0.0.1:8000"):
        self.gateway_url = gateway_url
        self.active_threads: Dict[str, threading.Thread] = {}
        self.stop_event = threading.Event()

    def start_simulation(self, scenario: str, client_id: str = "demo-client-1", endpoint: str = None, duration_sec: int = 25) -> Dict[str, Any]:
        self.stop_all()

        target_func = None
        if scenario == "normal":
            target_func = run_normal_traffic
        elif scenario == "burst":
            target_func = run_traffic_burst
        elif scenario == "brute_force":
            target_func = run_brute_force
        elif scenario == "high_frequency":
            target_func = run_high_frequency_attack
        else:
            return {"status": "error", "message": f"Unknown scenario: {scenario}"}

        thread_key = f"{scenario}_{client_id}"
        self.stop_event = threading.Event()

        def worker():
            target_func(
                gateway_url=self.gateway_url,
                client_id=client_id,
                endpoint=endpoint,
                duration_sec=duration_sec,
                stop_event=self.stop_event
            )

        thread = threading.Thread(target=worker, daemon=True)
        self.active_threads[thread_key] = thread
        thread.start()

        return {
            "status": "success",
            "message": f"Started simulation scenario: {scenario} for client {client_id} targeting {endpoint or 'default'}",
            "scenario": scenario,
            "client_id": client_id,
            "endpoint": endpoint
        }

    def stop_all(self) -> Dict[str, Any]:
        self.stop_event.set()
        count = len(self.active_threads)
        self.active_threads.clear()
        return {"status": "success", "message": f"Stopped {count} active simulations"}
