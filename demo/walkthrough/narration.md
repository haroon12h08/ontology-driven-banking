# Presentation Narration Script
**Title:** Decoupling Banking Logic: The OWL & Multi-Agent Semantic Graph Platform  
**Target Audience:** Hackathon Judges, AI Architects, and Banking Executives  
**Presenter:** Chief Demo Engineer

---

## Slide 1: Introduction (The Core Problem)
> "Good morning, judges. Today, banking software is bloated with hardcoded business rules buried in thousands of lines of microservices. When a policy changes—like raising a credit score requirement—engineers have to modify, test, and redeploy code across ten different services. 
> 
> Today, we present a radical alternative: **SBI Enterprise Semantic Graph Platform**. 
> By combining an OWL Ontology, a Neo4j Knowledge Graph, and a coordinated Multi-Agent Orchestrator, we decouple business logic from application code. Our agents share a single semantic memory, and they make decisions dynamically based on live graph state and declarative policies."

---

## Slide 2: Demo Scenario 1 — Home Loan Journey
> "Let's start by clicking our first scenario on the Judge Dashboard: **Scenario 1: Home Loan Journey**.
> 
> As we run this, watch the live architecture animator. The query first hits our LangGraph Planner. The Planner understands the intent and spins up a chain of agents: Customer -> Advisor -> Risk -> Knowledge -> Engagement.
> 
> The Advisor Agent evaluates eligibility. Instead of hardcoding checks, it consults our OWL Ontology and dynamic YAML policies. It retrieves Customer 006's details from Neo4j. The customer's income is INR 480k. The policy requires INR 500k. The system instantly rejects the loan, generates a precise logical explanation of the failure, and suggests a high-yield mutual fund savings plan instead. All of this happens under 300ms, and it is fully observable in our telemetry charts."

---

## Slide 3: Demo Scenario 4 — Policy Parameter Hot-Swap (The 'Wow' Factor)
> "But what happens if SBI risk management changes the policy threshold? In a traditional bank, this means a two-week sprint. In our platform, let's look at **Scenario 4: Policy Hot-Swap**.
> 
> With a single click, we update the minimum credit score requirement from 720 to 760. This writes directly to our rules repository and clears the intelligence cache. Now, let's replay our Home Loan Scenario.
> 
> Notice how the decision explanation immediately shifts: the customer now fails the credit rating threshold! **Zero code changes, zero container builds, and zero service restarts.** The system's logical reasoning engine read the new rule schema and adapted instantaneously."

---

## Slide 4: Realtime Events & Operations (Scenarios 2, 3, 5, & 6)
> "Our platform isn't just a search copilot—it processes asynchronous banking events. 
> 
> In **Scenario 3**, we simulate a Salary Credit event. The ledger records the transaction, the Risk agent recalculates liquidity, and the Advisor generates investment recommendations in real-time.
> 
> In **Scenario 2**, a foreign login combined with a large transaction triggers our Fraud policy. The card is instantly locked, and notification triggers are routed.
> 
> In **Scenario 5**, a KYC expiry triggers compliance tasks, automatically assigned to Relationship Managers based on branch directories loaded in Neo4j."

---

## Slide 5: Summary & Conclusion
> "This architecture is superior because:
> 1. **Explainable AI:** Every decision has a traceable path of nodes, relationships, and consulted policies.
> 2. **Decoupled Logic:** Business parameters are defined in schemas, not compiled code.
> 3. **Autonomous Collaboration:** Specialized agents collaborate via shared graph memory.
> 
> Thank you, and we welcome your questions!"
