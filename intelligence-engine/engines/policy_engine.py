import os
import yaml
import logging
from typing import Dict, Any

logger = logging.getLogger("PolicyEngine")

class PolicyEngine:
    def __init__(self, rules_dir: str = None):
        if rules_dir is None:
            # Resolve relative to the current file
            rules_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "rules"))
        self.rules_dir = rules_dir
        self._cache: Dict[str, Dict[str, Any]] = {}

    def load_rules(self, file_name: str) -> Dict[str, Any]:
        """Loads rules from a YAML file, utilizing an in-memory cache."""
        if file_name in self._cache:
            return self._cache[file_name]
        
        file_path = os.path.join(self.rules_dir, file_name)
        if not os.path.exists(file_path):
            logger.error(f"Rule file {file_path} not found.")
            return {}
            
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                rules = yaml.safe_load(f) or {}
                self._cache[file_name] = rules
                logger.info(f"Loaded rules from {file_name}")
                return rules
        except Exception as e:
            logger.error(f"Error loading rule file {file_path}: {e}")
            return {}

    def get_loan_policy(self, loan_type: str) -> Dict[str, Any]:
        """Retrieves rules for a specific loan type from loan_rules.yaml."""
        rules = self.load_rules("loan_rules.yaml")
        return rules.get(loan_type, {})

    def get_investment_policy(self, investment_type: str) -> Dict[str, Any]:
        """Retrieves rules for a specific investment product from investment_rules.yaml."""
        rules = self.load_rules("investment_rules.yaml")
        return rules.get(investment_type, {})

    def get_fraud_policy(self, fraud_type: str) -> Dict[str, Any]:
        """Retrieves rules for a fraud check type from fraud_rules.yaml."""
        rules = self.load_rules("fraud_rules.yaml")
        return rules.get(fraud_type, {})

    def get_risk_policy(self, risk_type: str) -> Dict[str, Any]:
        """Retrieves rules for a risk type from risk_rules.yaml."""
        rules = self.load_rules("risk_rules.yaml")
        return rules.get(risk_type, {})

    def get_engagement_policy(self, engagement_type: str) -> Dict[str, Any]:
        """Retrieves rules for an engagement type from engagement_rules.yaml."""
        rules = self.load_rules("engagement_rules.yaml")
        return rules.get(engagement_type, {})

# Global PolicyEngine instance
policy_engine = PolicyEngine()
