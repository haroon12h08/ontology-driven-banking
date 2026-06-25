from typing import List
from memory.shared_context import SharedState

class TaskRouter:
    """
    Decoupled Task Router.
    Analyzes steps progress and routes messages to active destinations.
    """
    def route_next(self, state: SharedState) -> str:
        steps = state.workflow_steps
        idx = state.current_step_index
        if idx >= len(steps):
            return "END"
        return steps[idx]

task_router = TaskRouter()
