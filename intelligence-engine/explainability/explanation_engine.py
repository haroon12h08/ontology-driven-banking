from typing import List, Dict, Any, Optional
from datetime import datetime

class Explanation:
    def __init__(
        self,
        decision: str,
        evidence: Dict[str, Any],
        supporting_policies: List[Dict[str, str]],
        reasoning_steps: List[str],
        confidence: float,
        graph_path: Optional[List[Dict[str, Any]]] = None,
        alternative_outcomes: Optional[List[str]] = None
    ):
        self.decision = decision
        self.evidence = evidence
        self.supporting_policies = supporting_policies
        self.reasoning_steps = reasoning_steps
        self.confidence = confidence
        self.graph_path = graph_path or []
        self.alternative_outcomes = alternative_outcomes or []
        self.timestamp = datetime.utcnow().isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "decision": self.decision,
            "evidence": self.evidence,
            "supporting_policies": self.supporting_policies,
            "reasoning_steps": self.reasoning_steps,
            "confidence": self.confidence,
            "graph_path": self.graph_path,
            "alternative_outcomes": self.alternative_outcomes,
            "timestamp": self.timestamp
        }

class ExplanationEngine:
    def create_explanation(
        self,
        decision: str,
        evidence: Dict[str, Any],
        supporting_policies: List[Dict[str, str]],
        reasoning_steps: List[str],
        confidence: float,
        graph_path: Optional[List[Dict[str, Any]]] = None,
        alternative_outcomes: Optional[List[str]] = None
    ) -> Explanation:
        """Helper to construct an Explanation object."""
        return Explanation(
            decision=decision,
            evidence=evidence,
            supporting_policies=supporting_policies,
            reasoning_steps=reasoning_steps,
            confidence=confidence,
            graph_path=graph_path,
            alternative_outcomes=alternative_outcomes
        )

# Global ExplanationEngine instance
explanation_engine = ExplanationEngine()
