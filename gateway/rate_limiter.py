from typing import Dict, Any

class DynamicRateLimiter:
    def __init__(self):
        # client_id -> current quota
        self.active_quotas: Dict[str, int] = {}

    def set_client_quota(self, client_id: str, quota: int):
        self.active_quotas[client_id] = quota

    def get_client_quota(self, client_id: str, default: int = 100) -> int:
        return self.active_quotas.get(client_id, default)
