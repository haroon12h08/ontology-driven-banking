import logging
from typing import Dict, Any, List
from datetime import datetime
from app.services.graph_service import graph_service
from app.schemas.responses import SemanticResponse

logger = logging.getLogger("OntologyService")

class OntologyService:
    async def get_ontology_classes(self) -> SemanticResponse:
        # Retrieve Neosemantics imported Class nodes
        query = """
        MATCH (c:n4sch__Class)
        RETURN c.uri AS uri, c.comment AS comment, labels(c) AS labels
        ORDER BY c.uri ASC
        """
        records, _ = graph_service.run_read_query(query)

        entities = []
        for row in records:
            uri = row["uri"]
            # Extract local name from URI (e.g. http://www.sbi.co.in/ontology/banking#Customer -> Customer)
            local_name = uri.split("#")[-1] if "#" in uri else uri.split("/")[-1]
            entities.append({
                "type": "OntologyClass",
                "id": local_name,
                "properties": {
                    "uri": uri,
                    "description": row.get("comment") or f"Formal OWL Class representation of {local_name}."
                }
            })

        summary = f"Retrieved {len(entities)} semantic ontology classes imported from the owl schema via neosemantics."

        return SemanticResponse(
            status="success",
            summary=summary,
            entities=entities,
            relationships=[],
            confidence=1.0,
            timestamp=datetime.utcnow()
        )

    async def get_ontology_properties(self) -> SemanticResponse:
        # Retrieve Object and Datatype properties
        query = """
        MATCH (p)
        WHERE "n4sch__Property" IN labels(p) OR "n4sch__Relationship" IN labels(p)
        RETURN p.uri AS uri, p.comment AS comment, labels(p) AS propertyTypes
        ORDER BY p.uri ASC
        """
        records, _ = graph_service.run_read_query(query)

        entities = []
        for row in records:
            uri = row["uri"]
            local_name = uri.split("#")[-1] if "#" in uri else uri.split("/")[-1]
            prop_type = "Relationship" if "n4sch__Relationship" in row["propertyTypes"] else "Property"
            entities.append({
                "type": "OntologyProperty",
                "id": local_name,
                "properties": {
                    "uri": uri,
                    "propertyType": prop_type,
                    "description": row.get("comment") or f"Formal OWL property representing {local_name}."
                }
            })

        summary = f"Retrieved {len(entities)} semantic properties from the OWL ontology."

        return SemanticResponse(
            status="success",
            summary=summary,
            entities=entities,
            relationships=[],
            confidence=1.0,
            timestamp=datetime.utcnow()
        )

ontology_service = OntologyService()
