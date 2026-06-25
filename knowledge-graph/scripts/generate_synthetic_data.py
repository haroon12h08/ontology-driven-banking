import os
import csv
import random
from datetime import datetime, timedelta

# Output directories
base_dir = "/home/haroon/Desktop/SBI/knowledge-graph"
datasets_dir = os.path.join(base_dir, "datasets")
os.makedirs(datasets_dir, exist_ok=True)

print("Starting synthetic data generation...")

# Set random seed for consistency
random.seed(42)

# Helper function to generate dates
def random_date(start_year=2020, end_year=2026):
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 6, 25)
    delta = end - start
    return (start + timedelta(seconds=random.randint(0, int(delta.total_seconds())))).strftime("%Y-%m-%d")

# Helper function to generate timestamps
def random_timestamp(start_year=2025, end_year=2026):
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 6, 25)
    delta = end - start
    return (start + timedelta(seconds=random.randint(0, int(delta.total_seconds())))).strftime("%Y-%m-%dT%H:%M:%SZ")

# 1. Generate Branches (25)
branches = []
cities = ["Mumbai", "Delhi", "Bengaluru", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad"]
for i in range(1, 26):
    branch_id = f"BR-{i:03d}"
    city = random.choice(cities)
    branch = {
        "branchId": branch_id,
        "branchName": f"SBI {city} Branch {i}",
        "streetAddress": f"{random.randint(10, 999)} Main St",
        "city": city,
        "cashReserves": round(random.uniform(500000.0, 5000000.0), 2)
    }
    branches.append(branch)

# 2. Generate Employees (100) & RM (20)
employees = []
rm_employees = []
roles = ["Teller", "Loan Officer", "Branch Manager", "Compliance Investigator", "Underwriter", "Customer Service Agent"]
for i in range(1, 101):
    emp_id = f"EMP-{i:03d}"
    is_rm = i <= 20
    role = "Relationship Manager" if is_rm else random.choice(roles)
    branch_id = random.choice(branches)["branchId"]
    emp = {
        "employeeId": emp_id,
        "fullName": f"Employee {i}",
        "email": f"employee{i}@sbi.co.in",
        "role": role,
        "isRM": str(is_rm).lower(),
        "branchId": branch_id
    }
    employees.append(emp)
    if is_rm:
        rm_employees.append(emp)

# 3. Generate Policies (100)
policies = []
policy_types = ["UnderwritingPolicy", "InterestRatePolicy", "CreditLimitPolicy", "RegulatoryPolicy"]
for i in range(1, 101):
    pol_id = f"POL-{i:03d}"
    policy = {
        "policyId": pol_id,
        "policyName": f"SBI Policy {pol_id} {random.choice(policy_types)}",
        "version": f"{random.randint(1, 5)}.{random.randint(0, 9)}",
        "effectiveDate": random_date(2022, 2025),
        "status": "Active"
    }
    policies.append(policy)

# 4. Generate Products (80)
products = []
product_types = ["Savings", "Checking", "HomeLoan", "AutoLoan", "PersonalLoan", "MutualFund", "CreditCard"]
for i in range(1, 81):
    prod_id = f"PROD-{i:03d}"
    p_type = random.choice(product_types)
    rate = round(random.uniform(1.5, 18.0), 2) if "Loan" in p_type or "Card" in p_type else round(random.uniform(1.0, 6.0), 2)
    prod = {
        "productId": prod_id,
        "productName": f"SBI {p_type} Product {i}",
        "productType": p_type,
        "baseRate": rate,
        "policyId": random.choice(policies)["policyId"]
    }
    products.append(prod)

# 5. Generate Customers (500)
customers = []
segments = ["MassRetail", "MassAffluent", "HNWI"]
occupations = ["Engineer", "Doctor", "Teacher", "Business Owner", "Consultant", "Artist", "Retired", "Student"]
for i in range(1, 501):
    cust_id = f"CUST-{i:03d}"
    segment = random.choice(segments)
    rm = random.choice(rm_employees) if segment in ["MassAffluent", "HNWI"] else None
    cust = {
        "customerId": cust_id,
        "firstName": f"CustomerFirstName{i}",
        "lastName": f"CustomerLastName{i}",
        "dateOfBirth": random_date(1950, 2005),
        "annualIncome": round(random.uniform(20000.0, 300000.0), 2),
        "occupation": random.choice(occupations),
        "city": random.choice(cities),
        "segment": segment,
        "creditScore": random.randint(300, 850),
        "relationshipManagerId": rm["employeeId"] if rm else ""
    }
    customers.append(cust)

# 6. Generate Accounts (800)
accounts = []
deposit_accounts = []
lending_accounts = []
for i in range(1, 801):
    acc_id = f"ACC-{i:03d}"
    cust = random.choice(customers)
    prod = random.choice(products)
    balance = round(random.uniform(500.0, 500000.0), 2)
    acc = {
        "accountId": acc_id,
        "accountNumber": f"SBI-{random.randint(1000000000, 9999999999)}",
        "customerId": cust["customerId"],
        "productId": prod["productId"],
        "balance": balance,
        "availableBalance": round(balance * random.uniform(0.9, 1.0), 2),
        "dateOpened": random_date(2020, 2025),
        "status": "Active" if random.random() > 0.05 else "Frozen"
    }
    accounts.append(acc)
    if prod["productType"] in ["Savings", "Checking"]:
        deposit_accounts.append(acc)
    elif prod["productType"] in ["HomeLoan", "AutoLoan", "PersonalLoan", "CreditCard"]:
        lending_accounts.append(acc)

# 7. Generate Loans (derived from Lending accounts)
loans = []
for i, acc in enumerate(lending_accounts, 1):
    loan_id = f"LOAN-{i:03d}"
    loans.append({
        "loanId": loan_id,
        "accountId": acc["accountId"],
        "customerId": acc["customerId"],
        "loanAmount": acc["balance"],
        "interestRate": round(random.uniform(5.0, 15.0), 2),
        "tenureMonths": random.choice([12, 24, 36, 60, 120, 240, 360]),
        "outstandingBalance": acc["balance"]
    })

# 8. Generate Merchants (600)
merchants = []
merchant_categories = ["Groceries", "Utilities", "Travel", "Dining", "Entertainment", "E-Commerce", "Retail", "Services"]
for i in range(1, 601):
    mer_id = f"MER-{i:03d}"
    mer = {
        "merchantId": mer_id,
        "merchantName": f"Merchant {i}",
        "category": random.choice(merchant_categories),
        "riskRating": random.randint(0, 100),
        "city": random.choice(cities)
    }
    merchants.append(mer)

# 9. Generate Transactions (20,000)
transactions = []
channels = ["Mobile App", "ATM", "POS", "Branch", "UPI"]
for i in range(1, 20001):
    txn_id = f"TXN-{i:06d}"
    acc = random.choice(accounts)
    mer = random.choice(merchants)
    amount = round(random.uniform(1.0, 5000.0), 2)
    is_fraud = "true" if random.random() < 0.005 else "false"
    txn = {
        "transactionId": txn_id,
        "accountId": acc["accountId"],
        "merchantId": mer["merchantId"],
        "amount": amount,
        "timestamp": random_timestamp(2025, 2026),
        "channel": random.choice(channels),
        "isFraud": is_fraud
    }
    transactions.append(txn)

# 10. Generate Financial Goals (500)
goals = []
goal_types = ["Retirement", "Education", "Home Purchase", "Travel", "Emergency Fund"]
for i in range(1, 501):
    goal_id = f"GOAL-{i:03d}"
    cust = random.choice(customers)
    acc = random.choice(accounts)
    goal = {
        "goalId": goal_id,
        "customerId": cust["customerId"],
        "goalType": random.choice(goal_types),
        "targetAmount": round(random.uniform(5000.0, 500000.0), 2),
        "targetDate": random_date(2027, 2040),
        "fundingAccountId": acc["accountId"]
    }
    goals.append(goal)

# 11. Generate Banking Events (500)
events = []
event_names = ["LargeTransaction", "CardBlocked", "KYCExpired", "KYCVerified", "AccountFrozen", "GoalMilestoneReached"]
for i in range(1, 501):
    evt_id = f"EVT-{i:03d}"
    cust = random.choice(customers)
    events.append({
        "eventId": evt_id,
        "eventName": random.choice(event_names),
        "timestamp": random_timestamp(2025, 2026),
        "customerId": cust["customerId"],
        "severity": random.choice(["Low", "Medium", "High", "Critical"])
    })

# 12. Generate Risk Profiles (500, one for each customer)
risk_profiles = []
for i, cust in enumerate(customers, 1):
    risk_id = f"RISK-{i:03d}"
    risk_profiles.append({
        "riskProfileId": risk_id,
        "customerId": cust["customerId"],
        "riskScore": random.randint(100, 990),
        "riskRating": random.choice(["Low", "Medium", "High", "Critical"])
    })

# 13. Generate Service Requests (200)
service_requests = []
request_categories = ["Card Dispute", "Fee Waiver", "Address Update", "Password Reset"]
for i in range(1, 201):
    req_id = f"REQ-{i:03d}"
    cust = random.choice(customers)
    emp = random.choice(employees)
    service_requests.append({
        "requestId": req_id,
        "customerId": cust["customerId"],
        "category": random.choice(request_categories),
        "priority": random.choice(["Low", "Medium", "High", "Critical"]),
        "status": random.choice(["Pending", "Assigned", "Resolved"]),
        "assignedEmployeeId": emp["employeeId"]
    })

# 14. Generate Recommendations (200)
recommendations = []
rec_actions = ["Apply for Mortgage", "Open Savings Account", "Invest in Mutual Fund", "Increase Credit Limit"]
for i in range(1, 201):
    rec_id = f"REC-{i:03d}"
    cust = random.choice(customers)
    prod = random.choice(products)
    recommendations.append({
        "recommendationId": rec_id,
        "customerId": cust["customerId"],
        "action": random.choice(rec_actions),
        "confidence": round(random.uniform(0.60, 0.99), 2),
        "recommendedProductId": prod["productId"]
    })

# Helper function to write CSV
def write_csv(filename, data, headers):
    filepath = os.path.join(datasets_dir, filename)
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(data)
    print(f"Wrote {len(data)} rows to {filename}")

# Write all datasets
write_csv("branches.csv", branches, ["branchId", "branchName", "streetAddress", "city", "cashReserves"])
write_csv("employees.csv", employees, ["employeeId", "fullName", "email", "role", "isRM", "branchId"])
write_csv("policies.csv", policies, ["policyId", "policyName", "version", "effectiveDate", "status"])
write_csv("products.csv", products, ["productId", "productName", "productType", "baseRate", "policyId"])
write_csv("customers.csv", customers, ["customerId", "firstName", "lastName", "dateOfBirth", "annualIncome", "occupation", "city", "segment", "creditScore", "relationshipManagerId"])
write_csv("accounts.csv", accounts, ["accountId", "accountNumber", "customerId", "productId", "balance", "availableBalance", "dateOpened", "status"])
write_csv("loans.csv", loans, ["loanId", "accountId", "customerId", "loanAmount", "interestRate", "tenureMonths", "outstandingBalance"])
write_csv("merchants.csv", merchants, ["merchantId", "merchantName", "category", "riskRating", "city"])
write_csv("transactions.csv", transactions, ["transactionId", "accountId", "merchantId", "amount", "timestamp", "channel", "isFraud"])
write_csv("goals.csv", goals, ["goalId", "customerId", "goalType", "targetAmount", "targetDate", "fundingAccountId"])
write_csv("events.csv", events, ["eventId", "eventName", "timestamp", "customerId", "severity"])
write_csv("risk_profiles.csv", risk_profiles, ["riskProfileId", "customerId", "riskScore", "riskRating"])
write_csv("service_requests.csv", service_requests, ["requestId", "customerId", "category", "priority", "status", "assignedEmployeeId"])
write_csv("recommendations.csv", recommendations, ["recommendationId", "customerId", "action", "confidence", "recommendedProductId"])

print("Synthetic data generation completed successfully!")
