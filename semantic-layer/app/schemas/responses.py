from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class SemanticReasoning(BaseModel):
    logical_steps: List[str] = Field(default_factory=list, description="Logical inference steps taken to reach the conclusion")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")
    supporting_policies: List[str] = Field(default_factory=list, description="List of policy IDs or rule IDs supporting the reasoning")

class SemanticEvidence(BaseModel):
    graph_path: List[Dict[str, Any]] = Field(default_factory=list, description="Sequence of nodes and edges representing the traversal path")
    metrics: Dict[str, Any] = Field(default_factory=dict, description="Raw supporting data points (e.g. balances, transaction frequency, risk score)")

class SemanticResponse(BaseModel):
    status: str = Field(..., description="API execution status, typically 'success' or 'error'")
    summary: str = Field(..., description="Human-readable business explanation of the query results")
    entities: List[Dict[str, Any]] = Field(default_factory=list, description="Structured representations of retrieved nodes/entities")
    relationships: List[Dict[str, Any]] = Field(default_factory=list, description="Structured representations of retrieved relationships/edges")
    reasoning: Optional[SemanticReasoning] = Field(None, description="Detailed reasoning/explanation behind the query results")
    evidence: Optional[SemanticEvidence] = Field(None, description="Graph path and supporting metrics backing the explanation")
    confidence: float = Field(1.0, description="Overall response confidence based on data completeness")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="UTC timestamp of the query execution")
