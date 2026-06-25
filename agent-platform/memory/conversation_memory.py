from typing import List, Dict, Any

class ConversationMemory:
    """
    Decoupled Conversation Memory store.
    """
    def __init__(self):
        self.history: List[Dict[str, Any]] = []

    def add_message(self, role: str, content: str):
        self.history.append({"role": role, "content": content})

    def get_history(self) -> List[Dict[str, Any]]:
        return self.history

conversation_memory = ConversationMemory()
