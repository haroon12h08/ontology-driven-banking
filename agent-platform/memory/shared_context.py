from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class AgentMessage(BaseModel):
    sender: str
    receiver: str
    purpose: str
    context: Dict[str, Any] = Field(default_factory=dict)
    confidence: float = 1.0
    evidence: Dict[str, Any] = Field(default_factory=dict)
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class ObservabilityLog(BaseModel):
    action: str
    agent_or_tool: str
    duration_ms: float
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    status: str = "success"

class SharedState(BaseModel):
    customer_id: Optional[str] = None
    current_user_message: str = ""
    conversation_history: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Semantic Shared Memory
    customer_profile: Dict[str, Any] = Field(default_factory=dict)
    financial_health: Dict[str, Any] = Field(default_factory=dict)
    risk_assessment: Dict[str, Any] = Field(default_factory=dict)
    active_recommendations: List[Dict[str, Any]] = Field(default_factory=list)
    policies_consulted: List[Dict[str, str]] = Field(default_factory=list)
    
    # Workflow & Execution State
    workflow_name: str = "Standard Support"
    workflow_steps: List[str] = Field(default_factory=list)
    current_step_index: int = 0
    workflow_state_data: Dict[str, Any] = Field(default_factory=dict)
    
    # Collaboration & Outputs
    messages_sent: List[AgentMessage] = Field(default_factory=list)
    reasoning_chain: List[Dict[str, Any]] = Field(default_factory=list)
    evidence: Dict[str, Any] = Field(default_factory=dict)
    confidence: float = 1.0
    alternative_outcomes: List[str] = Field(default_factory=list)
    
    # Observability
    observability_logs: List[ObservabilityLog] = Field(default_factory=list)
    
    # Output decision
    final_decision: str = ""
    final_output: str = ""
