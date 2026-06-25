from typing import Dict, Any

class CustomerContext:
    """
    Decoupled Customer Context store.
    """
    def __init__(self):
        self.context_cache: Dict[str, Any] = {}

    def set_context(self, customer_id: str, data: Dict[str, Any]):
        self.context_cache[customer_id] = data

    def get_context(self, customer_id: str) -> Dict[str, Any]:
        return self.context_cache.get(customer_id, {})

customer_context = CustomerContext()
