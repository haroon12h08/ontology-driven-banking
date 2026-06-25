from typing import Dict, Any
from memory.shared_context import SharedState

class MemoryManager:
    """
    Decoupled Memory Manager.
    Synchronizes contexts and ensures no agent maintains isolated memory.
    """
    def reset_state(self, customer_id: str, prompt: str) -> SharedState:
        return SharedState(
            customer_id=customer_id,
            current_user_message=prompt
        )

memory_manager = MemoryManager()
