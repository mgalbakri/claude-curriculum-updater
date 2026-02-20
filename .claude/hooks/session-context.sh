#!/usr/bin/env bash
# Hook: SessionStart
# Purpose: Inject project context on session start/resume/compact
# so Claude always knows the key rules.

cat <<'CONTEXT'
## Agent Code Academy — Session Context

**Design System Rules:**
- Palette: slate-* (NOT gray-*), accent: indigo-500 → orange-500 gradient
- Theme: dark-first (defaultTheme="dark"), every light class needs dark: variant
- Primary buttons: bg-gradient-to-r from-indigo-500 to-orange-500 text-white
- Focus rings: focus:ring-indigo-500 dark:focus:ring-indigo-400
- Progress bars & completion: keep emerald-500 (green = done)
- Pro cards: gradient-border-animated class (CSS conic-gradient rotation)

**Architecture:**
- Next.js 16.1.6 + Tailwind CSS 4 (no tailwind.config.js, uses @theme inline)
- Supabase auth (Google + GitHub OAuth)
- Lemon Squeezy payments (test mode)
- Python MCP server for curriculum auto-updates

**Key Commands:**
- Build: cd site && npm run build
- Tests: cd site && npm test (79 Playwright E2E tests)
- Python tests: python -m pytest tests/ -q (127 tests)
- Deploy: git push to main triggers Vercel auto-deploy

**Standing instruction:** Do it, never ask user to do anything unless security risk.
CONTEXT
exit 0
