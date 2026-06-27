import time
import logging

logger = logging.getLogger("DemoLatency")

class LatencyTracker:
    def __init__(self, action_name: str, callback=None):
        self.action_name = action_name
        self.callback = callback
        self.start_time = 0.0

    def __enter__(self):
        self.start_time = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        duration_ms = (time.perf_counter() - self.start_time) * 1000.0
        logger.info(f"[Latency] {self.action_name} took {duration_ms:.2f}ms")
        if self.callback:
            self.callback(duration_ms)

# Helper function
def track_latency(action_name: str, callback=None):
    return LatencyTracker(action_name, callback)
