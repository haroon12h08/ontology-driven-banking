import logging
from typing import Dict, Any, List
from datetime import datetime
from app.services.graph_service import graph_service
from app.cache.ttl_cache import customer_cache
from app.queries import customer_queries
from app.schemas.responses import SemanticResponse, SemanticReasoning, SemanticEvidence

logger = logging.getLogger("CustomerService")

class CustomerService:
    async def get_profile(self, customer_id: str) -> SemanticResponse:
        cache_key = f"profile:{customer_id}"
        cached = customer_cache.get(cache_key)
        if cached:
            logger.info(f"Cache hit for customer profile: {customer_id}")
            return SemanticResponse(**cached)

        # Run queries
        records, metrics = graph_service.run_read_query(
            customer_queries.GET_CUSTOMER_PROFILE, {"customerId": customer_id}
        )

        if not records or not records[0]["customer"]:
            return SemanticResponse(
                status="error",
                summary=f"Customer with ID {customer_id} not found",
                entities=[],
                relationships=[],
                confidence=0.0,
                timestamp=datetime.utcnow()
            )

        row = records[0]
        customer = row["customer"]
        risk_profile = row.get("riskProfile") or {}
        rm = row.get("relationshipManager") or {}

        # Prepare entities
        entities = [
            {"type": "Customer", "id": customer_id, "properties": customer}
        ]
        if risk_profile:
            entities.append({"type": "RiskProfile", "id": risk_profile.get("riskProfileId"), "properties": risk_profile})
        if rm:
            entities.append({"type": "RelationshipManager", "id": rm.get("employeeId"), "properties": rm})

        # Prepare relationships
        relationships = []
        if risk_profile:
            relationships.append({
                "type": "HAS_RISK_PROFILE",
                "source": customer_id,
                "target": risk_profile.get("riskProfileId")
            })
        if rm:
            relationships.append({
                "type": "MANAGES",
                "source": rm.get("employeeId"),
                "target": customer_id
            })

        # Compute logical steps and confidence
        logical_steps = [
            f"Retrieved core profile properties for customer {customer_id}",
            "Linked active Relationship Manager and Risk Profile configuration"
        ]
        
        # Calculate confidence based on profile completeness
        score_component = 1.0 if customer.get("creditScore") else 0.8
        confidence = score_component

        reasoning = SemanticReasoning(
            logical_steps=logical_steps,
            confidence=confidence,
            supporting_policies=["POL-KYC-001"] # Reference standard KYC policy
        )

        evidence = SemanticEvidence(
            graph_path=[
                {"node": f"Customer:{customer_id}"},
                {"rel": "HAS_RISK_PROFILE", "node": f"RiskProfile:{risk_profile.get('riskProfileId', '')}"},
                {"rel": "MANAGES", "node": f"RelationshipManager:{rm.get('employeeId', '')}"}
            ],
            metrics={"credit_score": customer.get("creditScore", 0)}
        )

        res = SemanticResponse(
            status="success",
            summary=f"Customer profile retrieved for {customer.get('firstName')} {customer.get('lastName')} ({customer.get('segment')}) managed by RM {rm.get('fullName', 'N/A')}.",
            entities=entities,
            relationships=relationships,
            reasoning=reasoning,
            evidence=evidence,
            confidence=confidence,
            timestamp=datetime.utcnow()
        )
        
        customer_cache.set(cache_key, res.model_dump(), ttl=60)
        return res

    async def get_accounts(self, customer_id: str) -> SemanticResponse:
        records, metrics = graph_service.run_read_query(
            customer_queries.GET_CUSTOMER_ACCOUNTS, {"customerId": customer_id}
        )

        entities = []
        relationships = []
        logical_steps = []

        total_balance = 0.0
        for row in records:
            acc = row["account"]
            prod = row.get("product") or {}
            loan = row.get("loan") or {}

            total_balance += acc.get("balance", 0.0)
            
            entities.append({"type": "Account", "id": acc.get("accountId"), "properties": acc})
            relationships.append({
                "type": "OWNS",
                "source": customer_id,
                "target": acc.get("accountId")
            })

            if prod:
                entities.append({"type": "Product", "id": prod.get("productId"), "properties": prod})
                relationships.append({
                    "type": "INSTANTIATES_PRODUCT",
                    "source": acc.get("accountId"),
                    "target": prod.get("productId")
                })
            
            if loan:
                entities.append({"type": "Loan", "id": loan.get("loanId"), "properties": loan})
                relationships.append({
                    "type": "REPRESENTS_LOAN",
                    "source": acc.get("accountId"),
                    "target": loan.get("loanId")
                })

        summary = f"Retrieved {len(records)} accounts owned by customer {customer_id} with aggregate balance of INR {total_balance:,.2f}."
        
        logical_steps.append(f"Discovered {len(records)} accounts associated with Customer:{customer_id}")
        if total_balance > 0:
            logical_steps.append(f"Summed total balance of INR {total_balance:,.2f} across accounts")

        reasoning = SemanticReasoning(
            logical_steps=logical_steps,
            confidence=1.0,
            supporting_policies=["POL-ACC-002"]
        )

        res = SemanticResponse(
            status="success",
            summary=summary,
            entities=entities,
            relationships=relationships,
            reasoning=reasoning,
            confidence=1.0,
            timestamp=datetime.utcnow()
        )
        return res

    async def get_financial_health(self, customer_id: str) -> SemanticResponse:
        records, metrics = graph_service.run_read_query(
            customer_queries.GET_FINANCIAL_HEALTH, {"customerId": customer_id}
        )

        if not records:
            return SemanticResponse(
                status="error",
                summary="Could not compute financial health metrics.",
                confidence=0.0,
                timestamp=datetime.utcnow()
            )

        row = records[0]
        total_balance = row.get("totalBalance") or 0.0
        savings_balance = row.get("savingsBalance") or 0.0
        checking_balance = row.get("checkingBalance") or 0.0
        debt_balance = row.get("debtBalance") or 0.0
        tx_volume = row.get("txVolume") or 0.0
        tx_count = row.get("txCount") or 0
        annual_income = row.get("annualIncome") or 0.0

        # Calculations
        dti_ratio = (debt_balance / annual_income * 100) if annual_income > 0 else 0.0
        savings_rate = (savings_balance / annual_income * 100) if annual_income > 0 else 0.0

        # Compute logical health score
        # 100 points: DTI < 30 (30 pts), savings rate > 10% (30 pts), positive asset balance (40 pts)
        score = 0.0
        logical_steps = []
        
        if total_balance > 0:
            score += 40.0
            logical_steps.append("Liquid wealth buffer is positive (+40 points)")
        else:
            logical_steps.append("Liquid wealth buffer is zero or negative (0 points)")

        if dti_ratio < 30:
            score += 30.0
            logical_steps.append(f"Debt-to-Income ratio is excellent at {dti_ratio:.2f}% (+30 points)")
        elif dti_ratio < 50:
            score += 15.0
            logical_steps.append(f"Debt-to-Income ratio is moderate at {dti_ratio:.2f}% (+15 points)")
        else:
            logical_steps.append(f"Debt-to-Income ratio is critical at {dti_ratio:.2f}% (0 points)")

        if savings_rate >= 15:
            score += 30.0
            logical_steps.append(f"Savings rate is high at {savings_rate:.2f}% (+30 points)")
        elif savings_rate >= 5:
            score += 15.0
            logical_steps.append(f"Savings rate is healthy at {savings_rate:.2f}% (+15 points)")
        else:
            logical_steps.append(f"Savings rate is low at {savings_rate:.2f}% (0 points)")

        health_rating = "Excellent" if score >= 80 else "Good" if score >= 50 else "Poor"

        reasoning = SemanticReasoning(
            logical_steps=logical_steps,
            confidence=0.9,
            supporting_policies=["POL-CRD-004", "POL-ADV-001"]
        )

        evidence = SemanticEvidence(
            graph_path=[
                {"node": f"Customer:{customer_id}"},
                {"rel": "OWNS", "node": "Account(s)"}
            ],
            metrics={
                "total_balance": total_balance,
                "savings_balance": savings_balance,
                "checking_balance": checking_balance,
                "debt_balance": debt_balance,
                "transaction_volume": tx_volume,
                "transaction_count": tx_count,
                "annual_income": annual_income,
                "dti_ratio_pct": round(dti_ratio, 2),
                "savings_rate_pct": round(savings_rate, 2),
                "financial_health_score": score
            }
        )

        return SemanticResponse(
            status="success",
            summary=f"Financial health rating is {health_rating} (Score: {score:.0f}/100). Total Assets: INR {savings_balance + checking_balance:,.2f}, Total Liabilities: INR {debt_balance:,.2f}.",
            entities=[{"type": "FinancialHealthReport", "id": f"FH-{customer_id}", "properties": {"rating": health_rating, "score": score}}],
            relationships=[],
            reasoning=reasoning,
            evidence=evidence,
            confidence=0.9,
            timestamp=datetime.utcnow()
        )

    async def get_journey(self, customer_id: str) -> SemanticResponse:
        records, metrics = graph_service.run_read_query(
            customer_queries.GET_CUSTOMER_JOURNEY, {"customerId": customer_id}
        )

        if not records:
            return SemanticResponse(status="success", summary="No journey data found.", entities=[], relationships=[])

        row = records[0]
        events = row.get("events") or []
        requests = row.get("requests") or []
        accounts = row.get("accounts") or []

        # Chronologically sort all timeline entries
        timeline = []
        for e in events:
            timeline.append({
                "type": "SystemEvent",
                "timestamp": str(e["timestamp"]),
                "description": f"Triggered system event: {e['eventName']} (Severity: {e['severity']})"
            })
        for r in requests:
            timeline.append({
                "type": "ServiceRequest",
                "timestamp": datetime.utcnow().isoformat(),  # Use dummy for missing date
                "description": f"Submitted service request for category '{r['category']}' (Priority: {r['priority']}, Status: {r['status']})"
            })
        for a in accounts:
            timeline.append({
                "type": "AccountOpened",
                "timestamp": str(a["dateOpened"]),
                "description": f"Opened Account {a['accountNumber']} with starting balance of INR {a['balance']}"
            })

        timeline.sort(key=lambda x: x["timestamp"])

        return SemanticResponse(
            status="success",
            summary=f"Retrieved banking lifecycle journey for customer {customer_id} containing {len(timeline)} timeline milestones.",
            entities=[{"type": "CustomerJourneyTimeline", "id": f"CJ-{customer_id}", "properties": {"timeline": timeline}}],
            relationships=[],
            confidence=1.0,
            timestamp=datetime.utcnow()
        )

    async def get_goals(self, customer_id: str) -> SemanticResponse:
        records, metrics = graph_service.run_read_query(
            customer_queries.GET_CUSTOMER_GOALS, {"customerId": customer_id}
        )

        entities = []
        relationships = []
        for row in records:
            g = row["goal"]
            entities.append({"type": "Goal", "id": g["goalId"], "properties": g})
            relationships.append({
                "type": "HAS_GOAL",
                "source": customer_id,
                "target": g["goalId"]
            })
            if g.get("fundingAccountId"):
                relationships.append({
                    "type": "FUNDED_BY",
                    "source": g["goalId"],
                    "target": g["fundingAccountId"]
                })

        return SemanticResponse(
            status="success",
            summary=f"Retrieved {len(entities)} savings and investment goals for Customer:{customer_id}.",
            entities=entities,
            relationships=relationships,
            confidence=1.0,
            timestamp=datetime.utcnow()
        )

customer_service = CustomerService()
