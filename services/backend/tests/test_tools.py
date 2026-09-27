"""Tests for NEXUS Tool System."""

import tempfile
from pathlib import Path
import pytest

from nexus.core.exceptions import PathTraversalError, PermissionDeniedError
from nexus.tools.base import ToolRiskLevel
from nexus.tools.bash_tools import ExecuteCommandTool
from nexus.tools.file_tools import ListDirTool, PatchFileTool, ReadFileTool, WriteFileTool
from nexus.tools.registry import AGENT_TOOL_PERMISSIONS, ToolRegistry
from nexus.tools.search_tools import FileGlobTool, GrepSearchTool


@pytest.mark.asyncio
async def test_file_tools_lifecycle() -> None:
    with tempfile.TemporaryDirectory() as tmpdir:
        ws = Path(tmpdir)

        # 1. Write file
        writer = WriteFileTool()
        w_res = await writer.execute(ws, file_path="src/main.py", content="print('hello world')\n")
        assert w_res.success is True
        assert (ws / "src/main.py").exists()

        # 2. Read file
        reader = ReadFileTool()
        r_res = await reader.execute(ws, file_path="src/main.py")
        assert r_res.success is True
        assert "print('hello world')" in r_res.output

        # 3. Patch file
        patcher = PatchFileTool()
        p_res = await patcher.execute(
            ws,
            file_path="src/main.py",
            target_content="print('hello world')",
            replacement_content="print('hello nexus')",
        )
        assert p_res.success is True
        assert "print('hello nexus')" in (ws / "src/main.py").read_text()

        # 4. List dir
        lister = ListDirTool()
        l_res = await lister.execute(ws, dir_path="src")
        assert l_res.success is True
        assert "main.py" in l_res.output


@pytest.mark.asyncio
async def test_path_traversal_prevention() -> None:
    with tempfile.TemporaryDirectory() as tmpdir:
        ws = Path(tmpdir)
        reader = ReadFileTool()
        res = await reader.execute(ws, file_path="../../secret.txt")
        assert res.success is False
        assert "PathTraversalError" in res.error or "escapes workspace" in res.error


@pytest.mark.asyncio
async def test_grep_and_glob_search() -> None:
    with tempfile.TemporaryDirectory() as tmpdir:
        ws = Path(tmpdir)
        (ws / "a.py").write_text("def calculate_sum(a, b):\n    return a + b\n")
        (ws / "b.txt").write_text("documentation on calculate_sum\n")

        # Grep
        grep = GrepSearchTool()
        g_res = await grep.execute(ws, pattern="calculate_sum")
        assert g_res.success is True
        assert "a.py:1" in g_res.output
        assert "b.txt:1" in g_res.output

        # Glob
        globber = FileGlobTool()
        glob_res = await globber.execute(ws, pattern="*.py")
        assert glob_res.success is True
        assert "a.py" in glob_res.output
        assert "b.txt" not in glob_res.output


@pytest.mark.asyncio
async def test_tool_registry_permissions() -> None:
    registry = ToolRegistry()

    # Planner should have read_file but not write_file
    planner_tools = [t.name for t in registry.get_tools_for_agent("planner")]
    assert "read_file" in planner_tools
    assert "write_file" not in planner_tools

    # Developer should have write_file
    dev_tools = [t.name for t in registry.get_tools_for_agent("developer")]
    assert "write_file" in dev_tools
    assert "patch_file" in dev_tools

    # Permission check
    registry.validate_agent_permission("developer", "write_file")
    with pytest.raises(PermissionDeniedError):
        registry.validate_agent_permission("planner", "write_file")
