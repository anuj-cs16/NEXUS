"""NEXUS Security Utilities — path sandboxing and crypto helpers.

Enforces workspace boundary constraints per the File System Engine
architecture (Backend Architecture §19).
"""

from __future__ import annotations

from pathlib import Path

from nexus.core.exceptions import PathTraversalError


def validate_workspace_path(target_path: str, workspace_root: str) -> Path:
    """Validate that a target path is within the workspace boundary.

    Resolves symlinks and relative path segments to prevent traversal attacks.

    Args:
        target_path: The path to validate (may be relative or absolute).
        workspace_root: The allowed workspace root directory.

    Returns:
        Resolved absolute Path within the workspace.

    Raises:
        PathTraversalError: If the resolved path escapes the workspace.
    """
    root = Path(workspace_root).resolve()
    target = (root / target_path).resolve() if not Path(target_path).is_absolute() else Path(target_path).resolve()

    # Ensure the resolved path starts with the workspace root
    try:
        target.relative_to(root)
    except ValueError:
        raise PathTraversalError(
            f"Path '{target_path}' escapes workspace boundary",
            target=str(target),
            workspace=str(root),
        )

    return target


assert_path_within_workspace = validate_workspace_path


def is_safe_filename(name: str) -> bool:
    """Check if a filename is safe (no path separators or special chars).

    Args:
        name: Filename to validate.

    Returns:
        True if the filename is safe.
    """
    forbidden = {"\\", "/", "..", ":", "*", "?", '"', "<", ">", "|", "\x00"}
    return not any(c in name for c in forbidden) and len(name) > 0 and len(name) <= 255
