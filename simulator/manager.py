import threading
from typing import Dict, Any
from simulator.normal_traffic import run_normal_traffic
from simulator.traffic_burst import run_traffic_burst
from simulator.brute_force import run_brute_force
from simulator.high_frequency_attack import run_high_frequency_attack

SCENARIOS = {
    "normal": run_normal_traffic,
    "burst": run_traffic_burst,
    "brute_force": run_brute_force,
    "high_frequency": run_high_frequency_attack
}

class SimulatorManager:
    def __init__(self, gateway_url: str = "http://127.0.0.1:8000"):
        self.gateway_url = gateway_url
        self.active_threads: Dict[str, threading.Thread] = {}
        self.stop_event = threading.Event()

    def start_simulation(self, scenario: str, client_id: str = "demo-client-1",
                         endpoint: str = None, duration_sec: int = 25) -> Dict[str, Any]:
        self.stop_all()
        target_func = SCENARIOS.get(scenario)
        if not target_func:
            return {"status": "error", "message": f"Unknown scenario: {scenario}"}

        self.stop_event = threading.Event()
        thread = threading.Thread(
            target=target_func,
            kwargs={
                "gateway_url": self.gateway_url,
                "client_id": client_id,
                "endpoint": endpoint,
                "duration_sec": duration_sec,
                "stop_event": self.stop_event
            },
            daemon=True
        )
        self.active_threads[f"{scenario}_{client_id}"] = thread
        thread.start()
        return {"status": "success", "scenario": scenario, "client_id": client_id}

    def stop_all(self) -> Dict[str, Any]:
        self.stop_event.set()
        count = len(self.active_threads)
        self.active_threads.clear()
        return {"status": "success", "stopped": count}
