import sys
import os
from typing import Dict, Any

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from orchestrator.workflow_manager import workflow_manager
from memory.shared_context import SharedState

class CentralOrchestrator:
    """
    Central Orchestrator.
    Handles the entrance gateway to the agent platform, initiating agent pipelines,
    and compiling explainability, confidence scores, and latency metrics.
    """
    async def process_user_intent(self, customer_id: str, message: str) -> Dict[str, Any]:
        # Invoke compiled StateGraph workflow
        final_state = await workflow_manager.execute_workflow(customer_id, message)
        
        # Consolidate explainability reports
        policies = []
        for p in final_state.get("policies_consulted", []):
            if isinstance(p, dict) and "id" in p:
                policies.append(f"{p['id']}: {p.get('name', '')}")
            else:
                policies.append(str(p))

        # Record agent contributions
        contributions = {}
        for log in final_state.get("observability_logs", []):
            action = log.get("action") if isinstance(log, dict) else getattr(log, "action", "")
            agent_or_tool = log.get("agent_or_tool") if isinstance(log, dict) else getattr(log, "agent_or_tool", "")
            duration_ms = log.get("duration_ms") if isinstance(log, dict) else getattr(log, "duration_ms", 0.0)
            
            if action == "execute_agent":
                contributions[agent_or_tool] = f"{duration_ms:.2f} ms"

        # Calculate average agent confidence
        messages = final_state.get("messages_sent", [])
        conf_scores = []
        for m in messages:
            conf = m.get("confidence") if isinstance(m, dict) else getattr(m, "confidence", 1.0)
            if conf > 0:
                conf_scores.append(conf)
        avg_confidence = sum(conf_scores) / len(conf_scores) if conf_scores else 1.0

        execution_logs = []
        for log in final_state.get("observability_logs", []):
            action = log.get("action") if isinstance(log, dict) else getattr(log, "action", "")
            agent_or_tool = log.get("agent_or_tool") if isinstance(log, dict) else getattr(log, "agent_or_tool", "")
            duration_ms = log.get("duration_ms") if isinstance(log, dict) else getattr(log, "duration_ms", 0.0)
            execution_logs.append({
                "action": action,
                "resource": agent_or_tool,
                "latency_ms": f"{duration_ms:.2f} ms"
            })

        return {
            "customer_id": customer_id,
            "workflow_name": final_state.get("workflow_name"),
            "final_output": final_state.get("final_output"),
            "explainability": {
                "reasoning_chain": final_state.get("reasoning_chain", []),
                "evidence": {
                    "financial_health": final_state.get("financial_health", {}),
                    "risk_assessment": final_state.get("risk_assessment", {}),
                    "recommendations_count": len(final_state.get("active_recommendations", []))
                },
                "policies_used": policies,
                "confidence_score": f"{avg_confidence * 100:.1f}%",
                "agent_contributions": contributions
            },
            "observability": {
                "total_steps": len(final_state.get("workflow_steps", [])),
                "execution_logs": execution_logs
            }
        }

# Global singleton
orchestrator = CentralOrchestrator()
