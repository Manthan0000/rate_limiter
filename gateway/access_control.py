from typing import Set

class AccessControlList:
    def __init__(self):
        self.blocked_clients: Set[str] = set()

    def block_client(self, client_id: str):
        self.blocked_clients.add(client_id)

    def unblock_client(self, client_id: str):
        self.blocked_clients.discard(client_id)

    def is_blocked(self, client_id: str) -> bool:
        return client_id in self.blocked_clients

    def clear(self):
        self.blocked_clients.clear()
