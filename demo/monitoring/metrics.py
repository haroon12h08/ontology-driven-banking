import time
import logging
from typing import Dict, Any, List

logger = logging.getLogger("DemoMonitoring")

class MetricsCollector:
    def __init__(self):
        self.api_latencies: List[float] = []
        self.graph_query_latencies: List[float] = []
        self.agent_execution_latencies: Dict[str, List[float]] = {}
        self.reasoning_latencies: List[float] = []
        self.transaction_counts = 0
        self.policy_evaluations = 0

    def record_api_latency(self, duration_ms: float):
        self.api_latencies.append(duration_ms)
        logger.info(f"[Metrics] API Call Latency: {duration_ms:.2f}ms")

    def record_graph_query(self, duration_ms: float):
        self.graph_query_latencies.append(duration_ms)
        logger.info(f"[Metrics] Neo4j Cypher Exec Latency: {duration_ms:.2f}ms")

    def record_agent_execution(self, agent_name: str, duration_ms: float):
        if agent_name not in self.agent_execution_latencies:
            self.agent_execution_latencies[agent_name] = []
        self.agent_execution_latencies[agent_name].append(duration_ms)
        logger.info(f"[Metrics] Agent {agent_name} Exec Latency: {duration_ms:.2f}ms")

    def get_summary(self) -> Dict[str, Any]:
        avg_api = sum(self.api_latencies) / len(self.api_latencies) if self.api_latencies else 0.0
        avg_graph = sum(self.graph_query_latencies) / len(self.graph_query_latencies) if self.graph_query_latencies else 0.0
        
        agent_summaries = {}
        for k, v in self.agent_execution_latencies.items():
            agent_summaries[k] = sum(v) / len(v) if v else 0.0

        return {
            "average_api_latency_ms": round(avg_api, 2),
            "average_graph_latency_ms": round(avg_graph, 2),
            "average_agent_latencies_ms": {k: round(v, 2) for k, v in agent_summaries.items()},
            "total_transactions_processed": self.transaction_counts,
            "total_policy_evaluations": self.policy_evaluations
        }

metrics_collector = MetricsCollector()
