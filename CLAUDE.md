# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP (Model Context Protocol) server that monitors Claude Code updates from four sources (Boris Cherny's X account, Anthropic blog, changelog, and docs) and analyzes gaps against a 12-week learning curriculum. Built with Python 3.10+ using FastMCP, httpx, BeautifulSoup4, and Pydantic.

## Commands

```bash
# Install (editable mode)
pip install -e .

# Run the server directly
python -m curriculum_updater_mcp.server

# Run via entry point (after install)
curriculum-updater
```

No test suite, linter, or CI/CD is configured.

## Architecture

The server exposes 5 MCP tools through FastMCP. The data pipeline flows: **Fetch → Filter → Analyze → Report → Apply**.

**Four modules:**

- `server.py` — MCP tool definitions and orchestration. Each tool is an async function with a Pydantic input model. This is the entry point (`main()` at bottom).
- `sources.py` — Async web scrapers for 4 sources. X/Twitter fetching tries multiple Nitter instances before falling back to X.com. All fetchers return `Update` dataclass instances. `CLAUDE_CODE_KEYWORDS` controls relevance filtering.
- `analyzer.py` — Gap analysis engine. `CURRICULUM_TOPIC_MAP` defines the 12-week curriculum structure (3 phases: Foundation, Building, Mastery). Maps updates to affected weeks, classifies gaps, assesses priority, and generates suggestions.
- `cache.py` — JSON-based local persistence at `~/.curriculum-updater/`. Two files: `update_cache.json` (seen/applied updates) and `curriculum_state.json` (path, current week).

**Key design decisions:**

- All network I/O is async via httpx — tool functions are `async def`
- No API keys required; all sources are scraped from public pages
- Pydantic models use `extra="forbid"` and `str_strip_whitespace=True`
- MCP tool metadata hints (readOnlyHint, destructiveHint, etc.) are set per tool
- Update deduplication uses `get_update_key()` from cache module

## Extending

- **New data source:** Add an async fetcher to `sources.py` returning `list[Update]`, then add it to the `fetchers` list in `fetch_all_updates()`
- **New relevance keywords:** Edit `CLAUDE_CODE_KEYWORDS` in `sources.py`
- **Custom curriculum structure:** Edit `CURRICULUM_TOPIC_MAP` in `analyzer.py`
