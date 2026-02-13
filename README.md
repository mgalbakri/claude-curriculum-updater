# Claude Code Mastery

A 12-week course for mastering Claude Code — from zero coding knowledge to expert. Includes a full MIT-level curriculum, an auto-updating MCP server, and a live course website.

🌐 **Live site:** [claude-code-mastery-iota.vercel.app](https://claude-code-mastery-iota.vercel.app)

## What's Inside

| Component | Description |
|-----------|-------------|
| `curriculum.md` | 12-week course with lessons, exercises, quizzes, and auto-generated updates |
| `site/` | Next.js 16 static site deployed on Vercel |
| `claude_code_mastery/` | MCP server that monitors 7+ sources and auto-updates the curriculum |

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
├── claude_code_mastery/                # MCP server
│   ├── server.py                       # Tool definitions
│   ├── sources.py                      # Data fetchers
│   ├── analyzer.py                     # Gap analysis
│   ├── cache.py                        # Local persistence
│   ├── semantic.py                     # TF-IDF matching
│   ├── scheduler.py                    # Scheduled checks & deploy
│   └── docs_differ.py                  # Docs diffing
├── site/                               # Next.js course website
│   ├── app/                            # App Router pages
│   ├── components/                     # React components
│   └── lib/                            # Parser & types
└── tests/                              # pytest suite (127 tests)
```

## License

MIT
