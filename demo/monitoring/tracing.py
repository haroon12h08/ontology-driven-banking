import time
import functools
import logging
from typing import Callable, Any

logger = logging.getLogger("DemoTracing")

class ExecutionTracer:
    @staticmethod
    def trace_action(layer: str, action_name: str):
        """Decorator to trace latency and logs for a function execution."""
        def decorator(func: Callable[..., Any]):
            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                start = time.perf_counter()
                logger.info(f"[Trace] [Layer: {layer}] Entering {action_name}...")
                try:
                    result = func(*args, **kwargs)
                    return result
                finally:
                    duration = (time.perf_counter() - start) * 1000.0
                    logger.info(f"[Trace] [Layer: {layer}] Exited {action_name} | Duration: {duration:.2f}ms")
            return wrapper
        return decorator

    @staticmethod
    def trace_async_action(layer: str, action_name: str):
        """Async version of the execution tracer decorator."""
        def decorator(func: Callable[..., Any]):
            @functools.wraps(func)
            async def wrapper(*args, **kwargs):
                start = time.perf_counter()
                logger.info(f"[Trace] [Layer: {layer}] Entering Async {action_name}...")
                try:
                    result = await func(*args, **kwargs)
                    return result
                finally:
                    duration = (time.perf_counter() - start) * 1000.0
                    logger.info(f"[Trace] [Layer: {layer}] Exited Async {action_name} | Duration: {duration:.2f}ms")
            return wrapper
        return decorator

tracer = ExecutionTracer()
