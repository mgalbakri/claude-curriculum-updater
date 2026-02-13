# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Claude Code Mastery** is a 12-week course for learning Claude Code, packaged as three components:

1. **Curriculum** (`curriculum.md`) — MIT-level course with lessons, exercises, and quizzes
2. **Course Website** (`site/`) — Next.js 16 + Tailwind static site deployed on Vercel
3. **MCP Server** (`claude_code_mastery/`) — Auto-updates the curriculum from 7+ sources

Built with Python 3.10+ (FastMCP, httpx, BeautifulSoup4, Pydantic, scikit-learn) and Next.js 16 (TypeScript, Tailwind CSS 4).

**Live site:** https://claude-code-mastery-iota.vercel.app

## Commands

```bash
# Install (editable mode)
pip install -e .

# Run the MCP server directly
python -m claude_code_mastery.server

# Run via entry point (after install)
claude-code-mastery

# Run tests
python -m pytest tests/ -q

# Build the site
cd site && npm run build

# Deploy to Vercel
cd site && npx vercel deploy --prod --yes --force
```

## Architecture

The MCP server exposes 5 tools through FastMCP. The data pipeline flows: **Fetch → Filter → Analyze → Report → Apply → Sync → Deploy**.

**Modules:**

- `server.py` — MCP tool definitions and orchestration. Each tool is an async function with a Pydantic input model.
- `sources.py` — Async web scrapers for 7+ sources. All fetchers return `list[Update]`.
- `analyzer.py` — Gap analysis engine. Three-pass pipeline: consolidate → map → deduplicate.
- `cache.py` — JSON-based local persistence at `~/.claude-code-mastery/`.
- `semantic.py` — TF-IDF + cosine similarity for semantic matching against curriculum sections.
- `scheduler.py` — Scheduled checks, notifications (macOS/Slack/email), auto-apply, site sync, and Vercel deploy.
- `docs_differ.py` — Documentation diffing engine that snapshots Claude Code docs.

**Key design decisions:**

- All network I/O is async via httpx
- No API keys required; all sources are scraped from public pages
- After auto-apply, curriculum is synced to `site/curriculum.md` and deployed to Vercel
- GitHub releases are consolidated (feature vs bugfix) before gap analysis
- Cross-source dedup merges gaps about the same topic from different sources

## Extending

- **New data source:** Add an async fetcher to `sources.py` returning `list[Update]`, then add it to `fetch_all_updates()`
- **New relevance keywords:** Edit `CLAUDE_CODE_KEYWORDS` in `sources.py`
- **Custom curriculum structure:** Edit `CURRICULUM_TOPIC_MAP` in `analyzer.py`
