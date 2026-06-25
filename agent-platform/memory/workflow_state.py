from typing import Dict, Any

class WorkflowStateTracker:
    """
    Decoupled Workflow State Tracker.
    """
    def __init__(self):
        self.active_workflows: Dict[str, Any] = {}

    def start_workflow(self, session_id: str, name: str):
        self.active_workflows[session_id] = {
            "name": name,
            "status": "Running"
        }

    def finish_workflow(self, session_id: str):
        if session_id in self.active_workflows:
            self.active_workflows[session_id]["status"] = "Completed"

workflow_state_tracker = WorkflowStateTracker()
