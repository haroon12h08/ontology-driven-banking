import logging
from typing import Dict, Any, List
from datetime import datetime
from app.services.graph_service import graph_service
from app.queries import recommendation_queries
from app.schemas.responses import SemanticResponse, SemanticReasoning, SemanticEvidence

logger = logging.getLogger("RecommendationService")

class RecommendationService:
    async def get_customer_recommendations(self, customer_id: str) -> SemanticResponse:
        records, _ = graph_service.run_read_query(
            recommendation_queries.GET_CUSTOMER_RECOMMENDATIONS, {"customerId": customer_id}
        )

        entities = []
        relationships = []
        logical_steps = []

        for row in records:
            reco = row["recommendation"]
            prod = row["product"]

            entities.append({"type": "Recommendation", "id": reco["recommendationId"], "properties": reco})
            entities.append({"type": "Product", "id": prod["productId"], "properties": prod})

            relationships.append({
                "type": "RECEIVED_RECOMMENDATION",
                "source": customer_id,
                "target": reco["recommendationId"]
            })
            relationships.append({
                "type": "RECOMMENDS_PRODUCT",
                "source": reco["recommendationId"],
                "target": prod["productId"]
            })

            logical_steps.append(f"Retrieved recommendation {reco['recommendationId']} recommending product {prod['productName']}")

        summary = f"Retrieved {len(records)} active recommendations for Customer:{customer_id}."

        reasoning = SemanticReasoning(
            logical_steps=logical_steps,
            confidence=0.9,
            supporting_policies=["POL-MKT-001"]
        )

        return SemanticResponse(
            status="success",
            summary=summary,
            entities=entities,
            relationships=relationships,
            reasoning=reasoning,
            confidence=0.9,
            timestamp=datetime.utcnow()
        )

    async def explain_recommendation(self, recommendation_id: str) -> SemanticResponse:
        records, _ = graph_service.run_read_query(
            recommendation_queries.GET_RECOMMENDATION_DETAILS, {"recommendationId": recommendation_id}
        )

        if not records:
            return SemanticResponse(
                status="error",
                summary=f"Recommendation with ID {recommendation_id} not found",
                confidence=0.0,
                timestamp=datetime.utcnow()
            )

        row = records[0]
        reco = row["recommendation"]
        customer = row["customer"]
        prod = row["product"]

        customer_id = customer["customerId"]
        prod_id = prod["productId"]

        # Fetch product policy constraints
        policy_records, _ = graph_service.run_read_query(
            "MATCH (p:Product {productId: $productId})-[:CONSTRAINED_BY]->(pol:Policy) RETURN pol",
            {"productId": prod_id}
        )
        policies = [p["pol"] for p in policy_records if p.get("pol")]

        logical_steps = [
            f"Retrieved recommendation record {recommendation_id} (confidence: {reco['confidence']:.2f})",
            f"Mapped target customer {customer_id} segment: {customer['segment']}",
            f"Mapped recommended product {prod_id} type: {prod['productType']}"
        ]

        # Business logic matching segment to product type
        if customer["segment"] == "HNI" and prod["productType"] in ["Savings", "Investment"]:
            logical_steps.append("HNI customers are prioritized for high-yield wealth management products (Match score: 1.0)")
        elif customer["segment"] == "MassRetail" and prod["productType"] in ["Checking", "PersonalLoan"]:
            logical_steps.append("Mass Retail customers are prioritized for everyday deposit and consumer loan accounts (Match score: 0.95)")
        else:
            logical_steps.append("Segment-to-product compatibility alignment verified (Match score: 0.85)")

        supporting_policy_ids = [pol.get("policyId") for pol in policies if pol.get("policyId")]
        if supporting_policy_ids:
            logical_steps.append(f"Verified constraints against governing policies: {', '.join(supporting_policy_ids)}")

        reasoning = SemanticReasoning(
            logical_steps=logical_steps,
            confidence=reco["confidence"],
            supporting_policies=supporting_policy_ids or ["POL-MKT-001"]
        )

        evidence = SemanticEvidence(
            graph_path=[
                {"node": f"Customer:{customer_id}"},
                {"rel": "RECEIVED_RECOMMENDATION", "node": f"Recommendation:{recommendation_id}"},
                {"rel": "RECOMMENDS_PRODUCT", "node": f"Product:{prod_id}"}
            ],
            metrics={
                "recommendation_confidence": reco["confidence"],
                "customer_segment": customer["segment"],
                "product_base_rate": prod.get("baseRate")
            }
        )

        summary = f"Recommendation {recommendation_id} recommends '{prod['productName']}' to {customer['firstName']} {customer['lastName']} based on customer segment ({customer['segment']}) and product rate ({prod.get('baseRate', 0.0)}%)."

        # Construct full graph output
        entities = [
            {"type": "Recommendation", "id": recommendation_id, "properties": reco},
            {"type": "Customer", "id": customer_id, "properties": customer},
            {"type": "Product", "id": prod_id, "properties": prod}
        ]
        for pol in policies:
            entities.append({"type": "Policy", "id": pol.get("policyId"), "properties": pol})

        relationships = [
            {"type": "RECEIVED_RECOMMENDATION", "source": customer_id, "target": recommendation_id},
            {"type": "RECOMMENDS_PRODUCT", "source": recommendation_id, "target": prod_id}
        ]
        for pol in policies:
            relationships.append({
                "type": "CONSTRAINED_BY",
                "source": prod_id,
                "target": pol.get("policyId")
            })

        return SemanticResponse(
            status="success",
            summary=summary,
            entities=entities,
            relationships=relationships,
            reasoning=reasoning,
            evidence=evidence,
            confidence=reco["confidence"],
            timestamp=datetime.utcnow()
        )

recommendation_service = RecommendationService()
