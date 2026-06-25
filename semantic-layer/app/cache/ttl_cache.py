import time
from typing import Dict, Any, Optional

class TTLCache:
    def __init__(self, default_ttl: int = 300):
        self.default_ttl = default_ttl
        self.cache: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        if key not in self.cache:
            return None
        item = self.cache[key]
        if time.time() > item["expiry"]:
            del self.cache[key]
            return None
        return item["value"]

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        duration = ttl if ttl is not None else self.default_ttl
        self.cache[key] = {
            "value": value,
            "expiry": time.time() + duration
        }

    def delete(self, key: str) -> None:
        if key in self.cache:
            del self.cache[key]

    def clear(self) -> None:
        self.cache.clear()

# Caching singletons as per requirements
customer_cache = TTLCache(default_ttl=300)
policy_cache = TTLCache(default_ttl=600)
product_cache = TTLCache(default_ttl=600)
recommendation_cache = TTLCache(default_ttl=300)
