import logging
from typing import Dict, Any, List
from datetime import datetime
from app.services.graph_service import graph_service
from app.schemas.responses import SemanticResponse

logger = logging.getLogger("OperationsService")

class OperationsService:
    async def get_pending_service_requests(self) -> SemanticResponse:
        query = """
        MATCH (sr:ServiceRequest)
        WHERE sr.status <> 'Resolved' AND sr.status <> 'Closed'
        OPTIONAL MATCH (c:Customer)-[:SUBMITTED_REQUEST]->(sr)
        OPTIONAL MATCH (sr)-[:ASSIGNED_TO]->(e:Employee)
        RETURN sr {
            .requestId,
            .category,
            .priority,
            .status
        } AS serviceRequest,
        c {
            .customerId,
            .firstName,
            .lastName
        } AS customer,
        e {
            .employeeId,
            .fullName,
            .role
        } AS assignee
        ORDER BY sr.priority DESC, sr.requestId ASC
        """
        records, _ = graph_service.run_read_query(query)

        entities = []
        relationships = []
        for row in records:
            sr = row["serviceRequest"]
            cust = row.get("customer") or {}
            emp = row.get("assignee") or {}

            entities.append({"type": "ServiceRequest", "id": sr["requestId"], "properties": sr})
            
            if cust:
                entities.append({"type": "Customer", "id": cust["customerId"], "properties": cust})
                relationships.append({
                    "type": "SUBMITTED_REQUEST",
                    "source": cust["customerId"],
                    "target": sr["requestId"]
                })
            
            if emp:
                entities.append({"type": "Employee", "id": emp["employeeId"], "properties": emp})
                relationships.append({
                    "type": "ASSIGNED_TO",
                    "source": sr["requestId"],
                    "target": emp["employeeId"]
                })

        summary = f"Retrieved {len(records)} pending service requests requiring operator intervention."

        return SemanticResponse(
            status="success",
            summary=summary,
            entities=entities,
            relationships=relationships,
            confidence=1.0,
            timestamp=datetime.utcnow()
        )

    async def get_branches(self) -> SemanticResponse:
        query = """
        MATCH (b:Branch)
        RETURN b {
            .branchId,
            .branchName,
            .streetAddress,
            .city,
            .cashReserves
        } AS branch
        ORDER BY b.branchName ASC
        """
        records, _ = graph_service.run_read_query(query)
        entities = [{"type": "Branch", "id": row["branch"]["branchId"], "properties": row["branch"]} for row in records]

        return SemanticResponse(
            status="success",
            summary=f"Retrieved {len(entities)} active physical banking branches.",
            entities=entities,
            relationships=[],
            confidence=1.0,
            timestamp=datetime.utcnow()
        )

    async def get_rm_assignments(self, employee_id: str) -> SemanticResponse:
        query = """
        MATCH (rm:RelationshipManager {employeeId: $employeeId})
        OPTIONAL MATCH (rm)-[:MANAGES]->(c:Customer)
        RETURN rm {
            .employeeId,
            .fullName,
            .email,
            .role
        } AS rm,
        collect(c {
            .customerId,
            .firstName,
            .lastName,
            .segment
        }) AS managedCustomers
        """
        records, _ = graph_service.run_read_query(query, {"employeeId": employee_id})
        
        if not records:
            return SemanticResponse(status="error", summary=f"Relationship Manager {employee_id} not found", confidence=0.0)

        row = records[0]
        rm = row["rm"]
        customers = row.get("managedCustomers") or []

        entities = [
            {"type": "RelationshipManager", "id": rm["employeeId"], "properties": rm}
        ]
        relationships = []

        for cust in customers:
            entities.append({"type": "Customer", "id": cust["customerId"], "properties": cust})
            relationships.append({
                "type": "MANAGES",
                "source": rm["employeeId"],
                "target": cust["customerId"]
            })

        summary = f"RM {rm['fullName']} manages {len(customers)} retail banking customers."

        return SemanticResponse(
            status="success",
            summary=summary,
            entities=entities,
            relationships=relationships,
            confidence=1.0,
            timestamp=datetime.utcnow()
        )

operations_service = OperationsService()
