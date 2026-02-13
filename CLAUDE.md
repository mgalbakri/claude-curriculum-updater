# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP server that monitors Claude Code updates from 7 sources and analyzes gaps against a 12-week learning curriculum. Built with Python 3.10+ using FastMCP, httpx, BeautifulSoup4, and Pydantic.

**Sources:** Boris Cherny's X (best-effort), Anthropic blog, changelog, docs, GitHub releases, YouTube, Reddit r/ClaudeAI.

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

The server exposes 5 MCP tools through FastMCP. The data pipeline flows: **Fetch -> Filter -> Analyze -> Report -> Apply**.

**Four modules:**

- `server.py` — MCP tool definitions and orchestration. Each tool is an async function with a Pydantic input model. Entry point is `main()` which configures logging and runs the server.
- `sources.py` — Async web scrapers for 7 sources. All fetchers return `list[Update]`. `fetch_all_updates()` returns a `FetchResult` containing both updates and any source errors. `CLAUDE_CODE_KEYWORDS` controls relevance filtering. The `days_back` parameter filters results by date where the source provides timestamps.
- `analyzer.py` — Gap analysis engine. `CURRICULUM_TOPIC_MAP` defines the 12-week curriculum structure (3 phases: Foundation, Building, Mastery). Three-pass pipeline: (1) consolidates GitHub releases into feature vs bugfix summaries, (2) maps updates to affected weeks and classifies gaps, (3) cross-source deduplication merges the same topic from multiple sources into one gap. `_is_bugfix_release()` classifies releases; `_topic_key()` groups related gaps.
- `cache.py` — JSON-based local persistence at `~/.curriculum-updater/`. Two files: `update_cache.json` (seen/applied updates) and `curriculum_state.json` (path, current week). Tracks insertion order for correct LRU trimming.

**Key design decisions:**

- All network I/O is async via httpx — tool functions are `async def`
- No API keys required; all sources are scraped from public pages
- Pydantic models use `extra="forbid"` and `str_strip_whitespace=True`
- Structured logging via Python `logging` module across all modules
- Source errors are surfaced to the user in tool output, not silently swallowed
- Content deduplication uses SHA-256 hashing (source + title + content prefix)
- GitHub releases are consolidated (feature vs bugfix) before gap analysis to avoid per-release noise
- Cross-source dedup merges gaps about the same topic (e.g., "opus 4.6") from different sources
- Bugfix-only releases are always low priority; blog/changelog features are high; GitHub summaries are medium
- Section finding in `apply_update` uses regex patterns for robustness

## Extending

- **New data source:** Add an async fetcher to `sources.py` returning `list[Update]`, then add it to the `fetchers` dict in `fetch_all_updates()`
- **New relevance keywords:** Edit `CLAUDE_CODE_KEYWORDS` in `sources.py`
- **Custom curriculum structure:** Edit `CURRICULUM_TOPIC_MAP` in `analyzer.py`
