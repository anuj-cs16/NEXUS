"""NEXUS Security Agent — vulnerability auditing and policy compliance.

Per Security Architecture:
Scans code diffs and files for OWASP Top 10, hardcoded secrets, injection flaws,
and unsafe subprocess / shell invocations.
"""

from __future__ import annotations

from nexus.agents.base import BaseAgent


class SecurityAgent(BaseAgent):
    """Audits modified code for security vulnerabilities and secrets."""

    agent_type = "security"

    @property
    def system_prompt(self) -> str:
        return (
            "You are the NEXUS Application Security Engineer Agent.\n"
            "Your role is to audit modified code for potential security issues.\n\n"
            "Checks to perform:\n"
            "1. **Hardcoded Secrets**: API keys, passwords, bearer tokens, private keys.\n"
            "2. **Injection Flaws**: SQL injection, command injection, path traversal.\n"
            "3. **Insecure Dependencies**: Known vulnerability patterns.\n"
            "4. **Input Validation**: Missing boundary and type checks.\n\n"
            "Output format:\n"
            "Provide a report with findings categorized by severity (LOW, MEDIUM, HIGH, CRITICAL),\n"
            "or state clearly: `Status: PASSED - No vulnerabilities detected.`\n"
        )
