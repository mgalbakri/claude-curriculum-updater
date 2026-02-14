# Agent Code Academy

A free 12-week course for mastering AI-assisted coding with Claude Code — from zero to expert. Includes a full curriculum, an auto-updating MCP server, a live course website, and an automated QA pipeline.

🌐 **Live site:** [agentcodeacademy.com](https://agentcodeacademy.com)

## What's Inside

| Component | Description |
|-----------|-------------|
| `curriculum.md` | 12-week course with lessons, exercises, quizzes, and auto-generated updates |
| `site/` | Next.js 16 static site deployed on Vercel with SEO, email capture, and dark mode |
| `site/e2e/` | Playwright E2E test suite (79 tests across 6 files) |
| `.github/workflows/` | GitHub Actions CI/CD — PR checks + nightly production tests |
| `claude_code_mastery/` | MCP server that monitors 7+ sources and auto-updates the curriculum |

## Site Features

- **SEO** — Sitemap, robots.txt, JSON-LD Course schema, Open Graph & Twitter meta tags, canonical URLs
- **Email capture** — Formspree-powered signup forms (homepage + inline CTAs + week page banners)
- **Dark mode** — System preference detection + manual toggle (Tailwind CSS 4 + next-themes)
- **Mobile responsive** — Hamburger nav, stacked layouts, touch-friendly at all viewports
- **Monetization** — Buy Me a Coffee, affiliate tool links, Vercel Analytics

## QA Pipeline

79 Playwright tests run automatically on every PR and nightly against production.

| Suite | Tests | What it covers |
|-------|-------|----------------|
| `smoke.spec.ts` | 27 | All 25 routes return 200, 404 page, no console errors |
| `seo.spec.ts` | 17 | Meta tags, JSON-LD, OG tags, canonical URLs, sitemap, robots.txt |
| `dark-mode.spec.ts` | 5 | Theme toggle, background color, system preference |
| `responsive.spec.ts` | 8 | Mobile nav, hamburger menu, layout, no overflow |
| `forms.spec.ts` | 6 | Email signup, inline CTAs, mocked submission, banner dismiss |
| `links.spec.ts` | 11 | 7 external links (soft assertions) + 4 internal nav links |

### How it works

```
PR opened → Vercel deploys preview → GitHub Actions runs 79 Playwright tests
  → Pass ✅ → PR comment with results → merge ready
  → Fail ❌ → PR comment + red check → merge blocked
```

**Nightly:** Runs daily at 6 AM UTC against `agentcodeacademy.com` via cron.

### MCP Tools

| Tool | Description |
|------|-------------|
| `curriculum_fetch_updates` | Pulls latest Claude Code updates from 7+ sources |
| `curriculum_analyze_gaps` | Compares updates against the curriculum and finds gaps |
| `curriculum_apply_update` | Writes changes to the curriculum markdown file |
| `curriculum_set_path` | Configures where the curriculum file lives |
| `curriculum_status` | Shows progress and update history |

### Data Sources

1. **Boris Cherny's X** (@anthropaboris) — Claude Code lead's updates and tips
2. **Anthropic Blog** — Official feature announcements
3. **Anthropic Changelog** — Technical release notes
4. **Claude Code Docs** — Documentation structure changes
5. **GitHub Releases** — Claude Code CLI releases
6. **Anthropic YouTube** — Video content
7. **Reddit r/ClaudeAI** — Community discussion

## Installation

### Prerequisites

- Python 3.10+
- Node.js 20+ (for the site)
- Claude Code installed (`npm install -g @anthropic-ai/claude-code`)

### Setup

```bash
git clone https://github.com/mgalbakri/claude-code-mastery.git
cd claude-code-mastery
pip install -e .
```

### Configure Claude Code

Add to `~/.claude.json` under `mcpServers`:

```json
{
  "claude_code_mastery": {
    "type": "stdio",
    "command": "python3",
    "args": ["-m", "claude_code_mastery.server"],
    "env": {
      "PYTHONPATH": "/path/to/claude-code-mastery"
    }
  }
}
```

### Run the Site Locally

```bash
cd site
npm install
npm run dev
```

### Run Tests

```bash
cd site
npm test              # Run all 79 tests
npm run test:smoke    # Smoke tests only
npm run test:seo      # SEO tests only
```

## Usage

In Claude Code:

```
> Set my curriculum path to ~/projects/claude-code-mastery/curriculum.md
> Check for new Claude Code updates from the last 2 weeks
> Analyze my curriculum for gaps
> Apply any high-priority updates
```

## Automated Updates

A macOS launchd agent checks for updates every Monday at 9 AM:

1. Fetches updates from all sources
2. Analyzes gaps against the curriculum
3. Auto-applies high-priority changes (with backup)
4. Syncs to the site directory
5. Deploys to Vercel
6. Sends email + macOS notification

Install the scheduler:

```bash
python -m claude_code_mastery.scheduler --install-launchd --weekly
```

## Project Structure

```
claude-code-mastery/
├── curriculum.md                       # 12-week course (source of truth)
├── pyproject.toml                      # Python package config
├── .github/workflows/                  # CI/CD pipelines
│   ├── qa.yml                         # PR-triggered QA (79 Playwright tests)
│   └── nightly-qa.yml                 # Daily production smoke test
├── claude_code_mastery/                # MCP server
│   ├── server.py                      # Tool definitions
│   ├── sources.py                     # Data fetchers
│   ├── analyzer.py                    # Gap analysis
│   ├── cache.py                       # Local persistence
│   ├── semantic.py                    # TF-IDF matching
│   ├── scheduler.py                   # Scheduled checks & deploy
│   └── docs_differ.py                 # Docs diffing
├── site/                              # Next.js course website
│   ├── app/                           # App Router pages
│   │   ├── page.tsx                   # Homepage
│   │   ├── layout.tsx                 # Root layout with SEO meta
│   │   ├── not-found.tsx              # Custom 404 page
│   │   ├── sitemap.ts                 # Dynamic sitemap
│   │   ├── robots.ts                  # Robots.txt
│   │   ├── week/[number]/page.tsx     # Week pages
│   │   └── appendix/[letter]/page.tsx # Appendix pages
│   ├── components/                    # React components
│   │   ├── sidebar.tsx                # Desktop sidebar nav
│   │   ├── mobile-nav.tsx             # Mobile hamburger nav
│   │   ├── theme-toggle.tsx           # Dark/light mode toggle
│   │   ├── email-signup.tsx           # Homepage email form
│   │   ├── email-banner.tsx           # Week page email banner
│   │   ├── inline-email-cta.tsx       # Between-phase CTA
│   │   ├── week-card.tsx              # Week preview card
│   │   └── markdown-renderer.tsx      # MDX content renderer
│   ├── e2e/                           # Playwright E2E tests
│   │   ├── smoke.spec.ts             # Route & error tests
│   │   ├── seo.spec.ts               # SEO & meta tag tests
│   │   ├── dark-mode.spec.ts         # Theme toggle tests
│   │   ├── responsive.spec.ts        # Mobile viewport tests
│   │   ├── forms.spec.ts             # Email form tests
│   │   └── links.spec.ts             # Link validation tests
│   ├── lib/                           # Parser & types
│   └── playwright.config.ts           # Playwright configuration
└── tests/                             # pytest suite (127 tests)
```

## License

MIT
