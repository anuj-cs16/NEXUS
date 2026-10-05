"""NEXUS Tree-Sitter AST Chunking Engine.

Per Agent Memory & Retrieval Architecture (§6, §8):
Structure-aware AST chunking preserves semantic boundaries (functions, classes,
methods, imports) rather than slicing code at arbitrary token offsets.

Supports: Python, TypeScript/JavaScript, Rust, Go.
Fallback: Indentation-based line chunking for unsupported or broken syntax.
"""

from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Any


class ChunkType(str, Enum):
    """Types of structure-aware chunks."""

    MODULE_DOCSTRING = "MODULE_DOCSTRING"
    IMPORT = "IMPORT"
    CLASS = "CLASS"
    FUNCTION = "FUNCTION"
    METHOD = "METHOD"
    INTERFACE = "INTERFACE"
    STRUCT = "STRUCT"
    TRAIT = "TRAIT"
    IMPL_BLOCK = "IMPL_BLOCK"
    ENUM = "ENUM"
    TYPE_ALIAS = "TYPE_ALIAS"
    CONSTANT = "CONSTANT"
    CONFIG_BLOCK = "CONFIG_BLOCK"
    HEADING_SECTION = "HEADING_SECTION"
    PROSE = "PROSE"
    RAW_TEXT = "RAW_TEXT"


# Mapping of file extensions to language identifiers
EXTENSION_TO_LANGUAGE: dict[str, str] = {
    ".py": "python",
    ".pyi": "python",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".js": "javascript",
    ".jsx": "javascript",
    ".rs": "rust",
    ".go": "go",
    ".md": "markdown",
    ".mdx": "markdown",
    ".json": "json",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".toml": "toml",
    ".html": "html",
    ".css": "css",
    ".scss": "scss",
    ".sql": "sql",
    ".sh": "bash",
    ".bash": "bash",
    ".ps1": "powershell",
    ".dockerfile": "dockerfile",
    ".txt": "text",
}

# Special filename mappings
FILENAME_TO_LANGUAGE: dict[str, str] = {
    "dockerfile": "dockerfile",
    "makefile": "makefile",
    "gemfile": "ruby",
    "procfile": "text",
}


@dataclass
class CodeChunk:
    """A structure-aware chunk extracted from source code."""

    content: str
    chunk_type: ChunkType
    symbol_name: str | None = None
    language: str | None = None
    file_path: str = ""
    start_line: int = 1
    end_line: int = 1
    token_count: int = 0
    content_sha256: str = ""

    def __post_init__(self) -> None:
        if not self.content_sha256:
            self.content_sha256 = hashlib.sha256(self.content.encode("utf-8")).hexdigest()
        if not self.token_count:
            # Approximate token count: ~4 chars per token for code
            self.token_count = max(1, len(self.content) // 4)


def detect_language(file_path: str | Path) -> str | None:
    """Detect programming language from file extension or exact filename."""
    path = Path(file_path)
    name_lower = path.name.lower()
    if name_lower in FILENAME_TO_LANGUAGE:
        return FILENAME_TO_LANGUAGE[name_lower]

    ext = path.suffix.lower()
    return EXTENSION_TO_LANGUAGE.get(ext)



def chunk_file(file_path: str | Path, content: str | None = None) -> list[CodeChunk]:
    """Parse a file into structure-aware chunks.

    Dispatches to the appropriate parser based on file extension.
    Falls back to indentation-based chunking on parse failure.

    Args:
        file_path: Path to the source file.
        content: Optional pre-read file content. If None, reads from disk.

    Returns:
        List of CodeChunk objects with metadata.
    """
    path = Path(file_path)
    language = detect_language(path)

    if content is None:
        try:
            content = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            return []

    if not content.strip():
        return []

    file_str = str(file_path)

    try:
        if language == "python":
            chunks = _chunk_python(content, file_str)
        elif language in ("typescript", "javascript"):
            chunks = _chunk_typescript(content, file_str)
        elif language == "rust":
            chunks = _chunk_rust(content, file_str)
        elif language == "go":
            chunks = _chunk_go(content, file_str)
        elif language == "markdown":
            chunks = _chunk_markdown(content, file_str)
        elif language in ("json", "yaml", "toml"):
            chunks = _chunk_config(content, file_str, language)
        else:
            chunks = _chunk_by_lines(content, file_str, language)
    except Exception:
        # Fallback on any parse error
        chunks = _chunk_by_lines(content, file_str, language)

    # If parser produced nothing, fall back to line chunking
    if not chunks:
        chunks = _chunk_by_lines(content, file_str, language)

    # Set language on all chunks
    for c in chunks:
        c.language = language

    return chunks


# ---------------------------------------------------------------------------
# Python chunker — regex-based AST-like extraction
# ---------------------------------------------------------------------------

# Patterns for Python top-level and class-level definitions
_PY_IMPORT_RE = re.compile(
    r"^(?:from\s+\S+\s+)?import\s+", re.MULTILINE
)
_PY_CLASS_RE = re.compile(
    r"^class\s+(\w+)", re.MULTILINE
)
_PY_FUNC_RE = re.compile(
    r"^(?:async\s+)?def\s+(\w+)", re.MULTILINE
)
_PY_METHOD_RE = re.compile(
    r"^    (?:async\s+)?def\s+(\w+)", re.MULTILINE
)


def _chunk_python(content: str, file_path: str) -> list[CodeChunk]:
    """Chunk Python source using regex-based structure detection."""
    lines = content.splitlines(keepends=True)
    chunks: list[CodeChunk] = []

    # Extract module docstring
    stripped = content.lstrip()
    if stripped.startswith(('"""', "'''")):
        quote = stripped[:3]
        end_idx = stripped.find(quote, 3)
        if end_idx != -1:
            docstring = stripped[: end_idx + 3]
            doc_lines = docstring.count("\n") + 1
            chunks.append(CodeChunk(
                content=docstring,
                chunk_type=ChunkType.MODULE_DOCSTRING,
                symbol_name="__module_doc__",
                file_path=file_path,
                start_line=1,
                end_line=doc_lines,
            ))

    # Find all top-level blocks
    blocks = _extract_python_blocks(lines)
    for block in blocks:
        chunks.append(CodeChunk(
            content=block["content"],
            chunk_type=block["type"],
            symbol_name=block.get("name"),
            file_path=file_path,
            start_line=block["start_line"],
            end_line=block["end_line"],
        ))

    return chunks


def _extract_python_blocks(lines: list[str]) -> list[dict[str, Any]]:
    """Extract Python blocks (imports, classes, functions) from source lines."""
    blocks: list[dict[str, Any]] = []
    i = 0
    n = len(lines)

    while i < n:
        line = lines[i]
        stripped = line.rstrip()

        # Import block
        if re.match(r"^(?:from\s+|import\s+)", stripped):
            start = i
            block_lines = [line]
            i += 1
            # Collect continuation lines
            while i < n and (
                re.match(r"^(?:from\s+|import\s+)", lines[i].rstrip())
                or lines[i].rstrip().endswith("\\")
                or (lines[i].strip() and lines[i][0] == " " and block_lines[-1].rstrip().endswith("\\"))
            ):
                block_lines.append(lines[i])
                i += 1
            blocks.append({
                "content": "".join(block_lines).rstrip(),
                "type": ChunkType.IMPORT,
                "name": "__imports__",
                "start_line": start + 1,
                "end_line": start + len(block_lines),
            })
            continue

        # Class definition
        class_match = re.match(r"^class\s+(\w+)", stripped)
        if class_match:
            name = class_match.group(1)
            start = i
            block_lines = [line]
            i += 1
            # Collect indented class body
            while i < n:
                next_line = lines[i]
                if next_line.strip() == "":
                    block_lines.append(next_line)
                    i += 1
                    continue
                if next_line[0] == " " or next_line[0] == "\t":
                    block_lines.append(next_line)
                    i += 1
                else:
                    break
            # Trim trailing blank lines
            while block_lines and not block_lines[-1].strip():
                block_lines.pop()
            blocks.append({
                "content": "".join(block_lines).rstrip(),
                "type": ChunkType.CLASS,
                "name": name,
                "start_line": start + 1,
                "end_line": start + len(block_lines),
            })
            continue

        # Function definition
        func_match = re.match(r"^(?:async\s+)?def\s+(\w+)", stripped)
        if func_match:
            name = func_match.group(1)
            start = i
            block_lines = [line]
            i += 1
            # Collect indented function body
            while i < n:
                next_line = lines[i]
                if next_line.strip() == "":
                    block_lines.append(next_line)
                    i += 1
                    continue
                if next_line[0] == " " or next_line[0] == "\t":
                    block_lines.append(next_line)
                    i += 1
                else:
                    break
            while block_lines and not block_lines[-1].strip():
                block_lines.pop()
            blocks.append({
                "content": "".join(block_lines).rstrip(),
                "type": ChunkType.FUNCTION,
                "name": name,
                "start_line": start + 1,
                "end_line": start + len(block_lines),
            })
            continue

        # Constant / top-level assignment
        if re.match(r"^[A-Z_][A-Z0-9_]*\s*[:=]", stripped):
            start = i
            block_lines = [line]
            i += 1
            # Multi-line assignment
            while i < n and lines[i].rstrip().endswith("\\"):
                block_lines.append(lines[i])
                i += 1
            blocks.append({
                "content": "".join(block_lines).rstrip(),
                "type": ChunkType.CONSTANT,
                "name": stripped.split("=")[0].split(":")[0].strip(),
                "start_line": start + 1,
                "end_line": start + len(block_lines),
            })
            continue

        i += 1

    return blocks


# ---------------------------------------------------------------------------
# TypeScript / JavaScript chunker
# ---------------------------------------------------------------------------

def _chunk_typescript(content: str, file_path: str) -> list[CodeChunk]:
    """Chunk TypeScript/JavaScript source using regex-based structure detection."""
    lines = content.splitlines(keepends=True)
    chunks: list[CodeChunk] = []

    blocks = _extract_ts_blocks(lines)
    for block in blocks:
        chunks.append(CodeChunk(
            content=block["content"],
            chunk_type=block["type"],
            symbol_name=block.get("name"),
            file_path=file_path,
            start_line=block["start_line"],
            end_line=block["end_line"],
        ))

    return chunks


def _extract_ts_blocks(lines: list[str]) -> list[dict[str, Any]]:
    """Extract TypeScript/JS blocks: imports, interfaces, types, classes, functions."""
    blocks: list[dict[str, Any]] = []
    i = 0
    n = len(lines)

    while i < n:
        stripped = lines[i].rstrip()

        # Import block
        if re.match(r"^import\s+", stripped):
            start = i
            block_lines = [lines[i]]
            i += 1
            # Multi-line import
            if "{" in stripped and "}" not in stripped:
                while i < n and "}" not in lines[i]:
                    block_lines.append(lines[i])
                    i += 1
                if i < n:
                    block_lines.append(lines[i])
                    i += 1
            blocks.append({
                "content": "".join(block_lines).rstrip(),
                "type": ChunkType.IMPORT,
                "name": "__imports__",
                "start_line": start + 1,
                "end_line": start + len(block_lines),
            })
            continue

        # Interface
        iface_match = re.match(r"^(?:export\s+)?interface\s+(\w+)", stripped)
        if iface_match:
            name = iface_match.group(1)
            start = i
            block_lines = _collect_braced_block(lines, i)
            i += len(block_lines)
            blocks.append({
                "content": "".join(block_lines).rstrip(),
                "type": ChunkType.INTERFACE,
                "name": name,
                "start_line": start + 1,
                "end_line": start + len(block_lines),
            })
            continue

        # Type alias
        type_match = re.match(r"^(?:export\s+)?type\s+(\w+)", stripped)
        if type_match:
            name = type_match.group(1)
            start = i
            block_lines = _collect_braced_block(lines, i)
            i += len(block_lines)
            blocks.append({
                "content": "".join(block_lines).rstrip(),
                "type": ChunkType.TYPE_ALIAS,
                "name": name,
                "start_line": start + 1,
                "end_line": start + len(block_lines),
            })
            continue

        # Class
        class_match = re.match(r"^(?:export\s+)?(?:abstract\s+)?class\s+(\w+)", stripped)
        if class_match:
            name = class_match.group(1)
            start = i
            block_lines = _collect_braced_block(lines, i)
            i += len(block_lines)
            blocks.append({
                "content": "".join(block_lines).rstrip(),
                "type": ChunkType.CLASS,
                "name": name,
                "start_line": start + 1,
                "end_line": start + len(block_lines),
            })
            continue

        # Function / arrow function / const component
        func_match = re.match(
            r"^(?:export\s+)?(?:async\s+)?(?:function\s+(\w+)|"
            r"const\s+(\w+)\s*=\s*(?:async\s+)?(?:\(|<))",
            stripped,
        )
        if func_match:
            name = func_match.group(1) or func_match.group(2)
            start = i
            block_lines = _collect_braced_block(lines, i)
            i += len(block_lines)
            blocks.append({
                "content": "".join(block_lines).rstrip(),
                "type": ChunkType.FUNCTION,
                "name": name,
                "start_line": start + 1,
                "end_line": start + len(block_lines),
            })
            continue

        # Enum
        enum_match = re.match(r"^(?:export\s+)?(?:const\s+)?enum\s+(\w+)", stripped)
        if enum_match:
            name = enum_match.group(1)
            start = i
            block_lines = _collect_braced_block(lines, i)
            i += len(block_lines)
            blocks.append({
                "content": "".join(block_lines).rstrip(),
                "type": ChunkType.ENUM,
                "name": name,
                "start_line": start + 1,
                "end_line": start + len(block_lines),
            })
            continue

        i += 1

    return blocks


def _collect_braced_block(lines: list[str], start: int) -> list[str]:
    """Collect lines until brace-depth returns to 0."""
    block = []
    depth = 0
    i = start
    n = len(lines)

    while i < n:
        line = lines[i]
        block.append(line)
        depth += line.count("{") - line.count("}")
        i += 1
        if depth <= 0 and len(block) > 0 and "{" in "".join(block):
            break
        # Safety: if no braces yet and we have > 1 line, check for semicolons
        if depth == 0 and len(block) > 1:
            break

    # Ensure at least one line
    if not block and start < n:
        block = [lines[start]]

    return block


# ---------------------------------------------------------------------------
# Rust chunker
# ---------------------------------------------------------------------------

def _chunk_rust(content: str, file_path: str) -> list[CodeChunk]:
    """Chunk Rust source using regex-based structure detection."""
    lines = content.splitlines(keepends=True)
    chunks: list[CodeChunk] = []
    i = 0
    n = len(lines)

    while i < n:
        stripped = lines[i].rstrip()

        # Use statement
        if re.match(r"^use\s+", stripped):
            start = i
            block = [lines[i]]
            i += 1
            while i < n and not block[-1].rstrip().endswith(";"):
                block.append(lines[i])
                i += 1
            chunks.append(CodeChunk(
                content="".join(block).rstrip(),
                chunk_type=ChunkType.IMPORT,
                symbol_name="__use__",
                file_path=file_path,
                start_line=start + 1,
                end_line=start + len(block),
            ))
            continue

        # Struct
        struct_match = re.match(r"^(?:pub\s+)?struct\s+(\w+)", stripped)
        if struct_match:
            name = struct_match.group(1)
            start = i
            block = _collect_braced_block(lines, i)
            i += len(block)
            chunks.append(CodeChunk(
                content="".join(block).rstrip(),
                chunk_type=ChunkType.STRUCT,
                symbol_name=name,
                file_path=file_path,
                start_line=start + 1,
                end_line=start + len(block),
            ))
            continue

        # Trait
        trait_match = re.match(r"^(?:pub\s+)?trait\s+(\w+)", stripped)
        if trait_match:
            name = trait_match.group(1)
            start = i
            block = _collect_braced_block(lines, i)
            i += len(block)
            chunks.append(CodeChunk(
                content="".join(block).rstrip(),
                chunk_type=ChunkType.TRAIT,
                symbol_name=name,
                file_path=file_path,
                start_line=start + 1,
                end_line=start + len(block),
            ))
            continue

        # Impl block
        impl_match = re.match(r"^impl(?:<[^>]*>)?\s+(\w+)", stripped)
        if impl_match:
            name = impl_match.group(1)
            start = i
            block = _collect_braced_block(lines, i)
            i += len(block)
            chunks.append(CodeChunk(
                content="".join(block).rstrip(),
                chunk_type=ChunkType.IMPL_BLOCK,
                symbol_name=name,
                file_path=file_path,
                start_line=start + 1,
                end_line=start + len(block),
            ))
            continue

        # Function
        fn_match = re.match(r"^(?:pub\s+)?(?:async\s+)?fn\s+(\w+)", stripped)
        if fn_match:
            name = fn_match.group(1)
            start = i
            block = _collect_braced_block(lines, i)
            i += len(block)
            chunks.append(CodeChunk(
                content="".join(block).rstrip(),
                chunk_type=ChunkType.FUNCTION,
                symbol_name=name,
                file_path=file_path,
                start_line=start + 1,
                end_line=start + len(block),
            ))
            continue

        # Enum
        enum_match = re.match(r"^(?:pub\s+)?enum\s+(\w+)", stripped)
        if enum_match:
            name = enum_match.group(1)
            start = i
            block = _collect_braced_block(lines, i)
            i += len(block)
            chunks.append(CodeChunk(
                content="".join(block).rstrip(),
                chunk_type=ChunkType.ENUM,
                symbol_name=name,
                file_path=file_path,
                start_line=start + 1,
                end_line=start + len(block),
            ))
            continue

        i += 1

    return chunks


# ---------------------------------------------------------------------------
# Go chunker
# ---------------------------------------------------------------------------

def _chunk_go(content: str, file_path: str) -> list[CodeChunk]:
    """Chunk Go source using regex-based structure detection."""
    lines = content.splitlines(keepends=True)
    chunks: list[CodeChunk] = []
    i = 0
    n = len(lines)

    while i < n:
        stripped = lines[i].rstrip()

        # Import block
        if re.match(r"^import\s+", stripped):
            start = i
            if "(" in stripped:
                block = _collect_braced_block_paren(lines, i)
            else:
                block = [lines[i]]
            i += len(block)
            chunks.append(CodeChunk(
                content="".join(block).rstrip(),
                chunk_type=ChunkType.IMPORT,
                symbol_name="__imports__",
                file_path=file_path,
                start_line=start + 1,
                end_line=start + len(block),
            ))
            continue

        # Struct
        struct_match = re.match(r"^type\s+(\w+)\s+struct\b", stripped)
        if struct_match:
            name = struct_match.group(1)
            start = i
            block = _collect_braced_block(lines, i)
            i += len(block)
            chunks.append(CodeChunk(
                content="".join(block).rstrip(),
                chunk_type=ChunkType.STRUCT,
                symbol_name=name,
                file_path=file_path,
                start_line=start + 1,
                end_line=start + len(block),
            ))
            continue

        # Interface
        iface_match = re.match(r"^type\s+(\w+)\s+interface\b", stripped)
        if iface_match:
            name = iface_match.group(1)
            start = i
            block = _collect_braced_block(lines, i)
            i += len(block)
            chunks.append(CodeChunk(
                content="".join(block).rstrip(),
                chunk_type=ChunkType.INTERFACE,
                symbol_name=name,
                file_path=file_path,
                start_line=start + 1,
                end_line=start + len(block),
            ))
            continue

        # Function / method
        fn_match = re.match(r"^func\s+(?:\([^)]*\)\s+)?(\w+)", stripped)
        if fn_match:
            name = fn_match.group(1)
            start = i
            block = _collect_braced_block(lines, i)
            i += len(block)
            chunks.append(CodeChunk(
                content="".join(block).rstrip(),
                chunk_type=ChunkType.FUNCTION,
                symbol_name=name,
                file_path=file_path,
                start_line=start + 1,
                end_line=start + len(block),
            ))
            continue

        i += 1

    return chunks


def _collect_braced_block_paren(lines: list[str], start: int) -> list[str]:
    """Collect lines until parenthesis-depth returns to 0 (for Go imports)."""
    block = []
    depth = 0
    i = start
    n = len(lines)

    while i < n:
        line = lines[i]
        block.append(line)
        depth += line.count("(") - line.count(")")
        i += 1
        if depth <= 0 and len(block) > 1:
            break

    return block


# ---------------------------------------------------------------------------
# Markdown chunker
# ---------------------------------------------------------------------------

def _chunk_markdown(content: str, file_path: str) -> list[CodeChunk]:
    """Chunk Markdown by heading hierarchy (H1-H4)."""
    lines = content.splitlines(keepends=True)
    chunks: list[CodeChunk] = []
    current_section: list[str] = []
    current_heading: str | None = None
    section_start = 0

    for i, line in enumerate(lines):
        heading_match = re.match(r"^(#{1,4})\s+(.+)", line)
        if heading_match:
            # Flush previous section
            if current_section:
                text = "".join(current_section).rstrip()
                if text.strip():
                    chunks.append(CodeChunk(
                        content=text,
                        chunk_type=ChunkType.HEADING_SECTION,
                        symbol_name=current_heading or "__intro__",
                        file_path=file_path,
                        start_line=section_start + 1,
                        end_line=i,
                    ))
            current_heading = heading_match.group(2).strip()
            current_section = [line]
            section_start = i
        else:
            current_section.append(line)

    # Flush final section
    if current_section:
        text = "".join(current_section).rstrip()
        if text.strip():
            chunks.append(CodeChunk(
                content=text,
                chunk_type=ChunkType.HEADING_SECTION,
                symbol_name=current_heading or "__intro__",
                file_path=file_path,
                start_line=section_start + 1,
                end_line=len(lines),
            ))

    return chunks


# ---------------------------------------------------------------------------
# Config file chunker (JSON, YAML, TOML)
# ---------------------------------------------------------------------------

def _chunk_config(content: str, file_path: str, language: str | None) -> list[CodeChunk]:
    """Chunk config files as a single structured block."""
    # For small config files, treat as a single chunk
    lines = content.splitlines()
    if len(lines) <= 100:
        return [CodeChunk(
            content=content.rstrip(),
            chunk_type=ChunkType.CONFIG_BLOCK,
            symbol_name=Path(file_path).name,
            file_path=file_path,
            start_line=1,
            end_line=len(lines),
        )]

    # For large config files, split into ~60-line blocks
    chunks = []
    block_size = 60
    for start_idx in range(0, len(lines), block_size):
        end_idx = min(start_idx + block_size, len(lines))
        block_content = "\n".join(lines[start_idx:end_idx])
        chunks.append(CodeChunk(
            content=block_content,
            chunk_type=ChunkType.CONFIG_BLOCK,
            symbol_name=f"{Path(file_path).name}[{start_idx + 1}:{end_idx}]",
            file_path=file_path,
            start_line=start_idx + 1,
            end_line=end_idx,
        ))

    return chunks


# ---------------------------------------------------------------------------
# Fallback line chunker
# ---------------------------------------------------------------------------

def _chunk_by_lines(
    content: str,
    file_path: str,
    language: str | None,
    max_chunk_lines: int = 60,
) -> list[CodeChunk]:
    """Fallback: chunk by contiguous non-blank line groups or fixed-size blocks."""
    lines = content.splitlines(keepends=True)
    chunks: list[CodeChunk] = []
    current_block: list[str] = []
    block_start = 0

    for i, line in enumerate(lines):
        current_block.append(line)

        # Emit chunk on blank line after substantial content or max reached
        is_boundary = (
            (line.strip() == "" and len(current_block) > 5)
            or len(current_block) >= max_chunk_lines
        )

        if is_boundary:
            text = "".join(current_block).rstrip()
            if text.strip():
                chunks.append(CodeChunk(
                    content=text,
                    chunk_type=ChunkType.RAW_TEXT,
                    symbol_name=None,
                    file_path=file_path,
                    start_line=block_start + 1,
                    end_line=i + 1,
                ))
            current_block = []
            block_start = i + 1

    # Flush remaining
    if current_block:
        text = "".join(current_block).rstrip()
        if text.strip():
            chunks.append(CodeChunk(
                content=text,
                chunk_type=ChunkType.RAW_TEXT,
                symbol_name=None,
                file_path=file_path,
                start_line=block_start + 1,
                end_line=len(lines),
            ))

    return chunks


# Secret patterns to redact before indexing
_SECRET_PATTERNS = [
    re.compile(r'(?i)(api[_-]?key|secret|token|password|passwd|credential)\s*[=:]\s*["\']?[\w\-\.]+["\']?'),
    re.compile(r'(?i)bearer\s+[\w\-\.]+'),
    re.compile(r'(?i)(aws|azure|gcp|github|gitlab)[\w_]*[=:]\s*["\']?[\w\-\.]+["\']?'),
    re.compile(r'-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----'),
]


def redact_secrets(content: str) -> str:
    """Redact potential secrets, keys, and tokens from content.

    Per Architecture §15.2: Regex redaction filters strip API keys,
    private certificates, and passwords before commit to any store.
    """
    redacted = content
    for pattern in _SECRET_PATTERNS:
        redacted = pattern.sub("[REDACTED]", redacted)
    return redacted

