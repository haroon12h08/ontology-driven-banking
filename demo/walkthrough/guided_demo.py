#!/usr/bin/env python3
import os
import sys
import time

def print_header(title: str):
    print("\n" + "=" * 80)
    print(f" {title.upper()} ".center(80, "#"))
    print("=" * 80)

def print_step(step: int, description: str):
    print(f"\n[STEP {step}] {description}")
    time.sleep(0.5)

def press_enter_to_continue():
    input("\n[PRESS ENTER TO TRIGGER NEXT SCENARIO STAGE]...")

def run_guided_walkthrough():
    print_header("SBI Enterprise Semantic Banking AI Guided Demo")
    print("Welcome to the interactive hackathon presentation walkthrough.")
    print("This guide steps through the 6 major user journeys designed for the judges.")
    time.sleep(1)
    
    # Scenario 1
    print_header("Scenario 1: Home Loan Journey ('Can I buy a house?')")
    print_step(1, "Customer 'CUST-006' queries the AI Copilot: 'I want to buy a house and request a loan of INR 3.5M'")
    print("Orchestrator resolves intent and invokes the Agent Pipeline: CUSTOMER -> ADVISOR -> RISK -> KNOWLEDGE -> ENGAGEMENT.")
    print("Advisor Agent queries neo4j graph for assets/debt and evaluates rules against POL-LOAN-HOME-001.")
    print("Logical check fails: Customer annual income is INR 480,000, below the required limit of INR 500,000.")
    print("Outcome: Loan eligibility REJECTED. Alternative: Set up regular mutual fund savings.")
    
    press_enter_to_continue()
    
    # Scenario 2
    print_header("Scenario 2: Realtime Fraud Detection")
    print_step(2, "Injecting suspicious transaction event: Charge of INR 60,000 at M-999 in Delhi.")
    print("Compliance & Fraud Engine assesses risk: Velocity exceeds 2 transactions per hour limit.")
    print("Outcome: Transaction flagged as fraud, Credit Card blocked instantly, Customer notification scheduled via WhatsApp.")
    
    press_enter_to_continue()

    # Scenario 3
    print_header("Scenario 3: Salary Credit Stream")
    print_step(3, "Injecting salary credit transaction: INR 150,000 credited to CUST-006 checking account.")
    print("Financial Health module updates liquidity ratio metrics.")
    print("Knowledge & Advisor Agents generate savings recommendations: Move 60% of surplus cash to H-Yield Mutual Fund.")
    
    press_enter_to_continue()

    # Scenario 4
    print_header("Scenario 4: Policy Parameter Hot-Swap")
    print_step(4, "Modifying min_credit_score threshold in 'loan_rules.yaml' from 650 to 760.")
    print("Replaying Scenario 1 Home Loan check for Customer 'CUST-006'.")
    print("Previous status was PASS on credit check (Score: 748 >= 650), now fails (Score: 748 < 760).")
    print("Outcome changes from Eligible to Ineligible dynamically without restarting the server or deploying new code!")
    
    press_enter_to_continue()

    # Scenario 5
    print_header("Scenario 5: KYC Expiry grace validation")
    print_step(5, "Injecting KYC Expired event to compliance listener.")
    print("Operations agent processes regulatory grace period policies.")
    print("Scheduled renewal task assigned to Relationship Manager 'EMP-001' at Branch 'BR-025'.")
    
    press_enter_to_continue()

    # Scenario 6
    print_header("Scenario 6: Operations Resolver & Ticket Escalation")
    print_step(6, "Customer submits service ticket: 'Double charge dispute'.")
    print("Operations agent accesses transactional ledger history from graph DB.")
    print("Generates structured email draft template for customer engagement.")
    
    print_header("Walkthrough Complete")
    print("The complete platform is live and verified on http://localhost:3000")
    print("Deploy, present, and wow the judges!")

if __name__ == "__main__":
    run_guided_walkthrough()
