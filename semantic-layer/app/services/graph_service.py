import os
import time
import logging
from neo4j import GraphDatabase
from typing import List, Dict, Any, Tuple

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("GraphService")

class GraphService:
    def __init__(self):
        self.uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        self.username = os.getenv("NEO4J_USERNAME", "neo4j")
        self.password = os.getenv("NEO4J_PASSWORD", "sbi_banking_password")
        self.driver = None
        
    def connect(self):
        """Initialize the Neo4j driver connection pool."""
        try:
            logger.info(f"Connecting to Neo4j database at {self.uri}")
            self.driver = GraphDatabase.driver(self.uri, auth=(self.username, self.password))
            self.driver.verify_connectivity()
            logger.info("Successfully connected to Neo4j.")
        except Exception as e:
            logger.error(f"Failed to connect to Neo4j: {e}")
            raise e

    def close(self):
        """Close the Neo4j driver connection pool."""
        if self.driver:
            logger.info("Closing Neo4j connection pool...")
            self.driver.close()
            logger.info("Neo4j connection closed.")

    def convert_neo4j_types(self, data: Any) -> Any:
        """Recursively converts neo4j.time types to standard ISO string formats."""
        import neo4j.time
        import datetime

        if isinstance(data, dict):
            return {k: self.convert_neo4j_types(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [self.convert_neo4j_types(x) for x in data]
        elif isinstance(data, (neo4j.time.Date, neo4j.time.DateTime, neo4j.time.Time)):
            return data.isoformat()
        elif isinstance(data, datetime.datetime):
            return data.isoformat()
        elif isinstance(data, datetime.date):
            return data.isoformat()
        return data

    def run_read_query(self, query: str, parameters: Dict[str, Any] = None) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Executes a read query in a single transaction session.
        Returns a tuple: (list of record dicts, performance metrics dict).
        """
        if not self.driver:
            self.connect()
            
        parameters = parameters or {}
        start_time = time.perf_counter()
        
        try:
            with self.driver.session(default_access_mode="READ") as session:
                result = session.run(query, parameters)
                # Fetch all records and convert custom Neo4j types
                records = [self.convert_neo4j_types(record.data()) for record in result]
                summary = result.consume()
                
                execution_time_ms = (time.perf_counter() - start_time) * 1000
                metrics = {
                    "execution_time_ms": round(execution_time_ms, 2),
                    "db_hits": summary.profile.get("dbHits", 0) if summary.profile else None,
                    "records_returned": len(records),
                    "constraints_added": summary.counters.constraints_added,
                    "indexes_added": summary.counters.indexes_added
                }
                
                logger.info(f"Executed Cypher query in {execution_time_ms:.2f}ms. Returned {len(records)} records.")
                return records, metrics
                
        except Exception as e:
            execution_time_ms = (time.perf_counter() - start_time) * 1000
            logger.error(f"Query execution failed: {e}\nQuery: {query}\nParams: {parameters}")
            raise e

    def verify_health(self) -> Dict[str, Any]:
        """Checks connection status and returns system metadata."""
        if not self.driver:
            try:
                self.connect()
            except Exception as e:
                return {"status": "unhealthy", "error": str(e)}
        try:
            with self.driver.session() as session:
                # Query DBMS info
                result = session.run("CALL dbms.components() YIELD name, versions, edition")
                record = result.single()
                if record:
                    return {
                        "status": "healthy",
                        "database": record["name"],
                        "version": record["versions"][0],
                        "edition": record["edition"]
                    }
                return {"status": "healthy", "details": "Connected, DBMS components returned empty."}
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)}

# Global GraphService singleton instance
graph_service = GraphService()
