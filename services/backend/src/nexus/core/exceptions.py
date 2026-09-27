"""NEXUS unified exception hierarchy.

All application exceptions inherit from NexusError, enabling
consistent error handling across API endpoints and services.
"""

from __future__ import annotations


class NexusError(Exception):
    """Base exception for all NEXUS backend errors."""

    status_code: int = 500
    error_code: str = "INTERNAL_ERROR"
    retryable: bool = False

    def __init__(self, message: str = "An internal error occurred", **details: object) -> None:
        super().__init__(message)
        self.message = message
        self.details = details


# --- Validation & Input Errors ---


class ValidationError(NexusError):
    """Invalid input data."""

    status_code = 422
    error_code = "VALIDATION_ERROR"


class NotFoundError(NexusError):
    """Requested resource does not exist."""

    status_code = 404
    error_code = "NOT_FOUND"


class ConflictError(NexusError):
    """Resource already exists or state conflict."""

    status_code = 409
    error_code = "CONFLICT"


# --- Security & Permission Errors ---


class PermissionDeniedError(NexusError):
    """Operation rejected by permission policy."""

    status_code = 403
    error_code = "PERMISSION_DENIED"


class PathTraversalError(PermissionDeniedError):
    """Filesystem path escapes allowed workspace boundary."""

    error_code = "PATH_TRAVERSAL"


class AuthenticationError(NexusError):
    """Authentication failed or token invalid."""

    status_code = 401
    error_code = "AUTHENTICATION_FAILED"


# --- Task & Orchestration Errors ---


class TaskStateError(NexusError):
    """Invalid task state transition attempted."""

    status_code = 409
    error_code = "INVALID_STATE_TRANSITION"


class TaskCancelledError(NexusError):
    """Task was cancelled during execution."""

    status_code = 409
    error_code = "TASK_CANCELLED"


class ApprovalTimeoutError(NexusError):
    """Human approval timed out."""

    status_code = 408
    error_code = "APPROVAL_TIMEOUT"
    retryable = True


# --- AI & Tool Errors ---


class ModelProviderError(NexusError):
    """AI model provider (Ollama/LiteLLM) communication failure."""

    status_code = 502
    error_code = "MODEL_PROVIDER_ERROR"
    retryable = True


class LLMConnectionError(ModelProviderError):
    """Failed to connect to LLM provider."""

    error_code = "LLM_CONNECTION_FAILED"


class LLMResponseError(ModelProviderError):
    """LLM provider returned an error response."""

    error_code = "LLM_RESPONSE_ERROR"


class ToolExecutionError(NexusError):
    """Tool execution failed."""

    status_code = 500
    error_code = "TOOL_EXECUTION_ERROR"


class ToolTimeoutError(ToolExecutionError):
    """Tool execution exceeded timeout."""

    error_code = "TOOL_TIMEOUT"
    retryable = True


# --- Infrastructure Errors ---


class DatabaseError(NexusError):
    """Database operation failed."""

    status_code = 500
    error_code = "DATABASE_ERROR"


class SandboxError(NexusError):
    """Docker sandbox operation failed."""

    status_code = 500
    error_code = "SANDBOX_ERROR"
