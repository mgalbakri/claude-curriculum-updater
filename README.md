# Curriculum Updater MCP Server

An MCP (Model Context Protocol) server that monitors Claude Code updates from Boris Cherny's X account, Anthropic's blog, changelog, and documentation — then analyzes gaps and updates your learning curriculum automatically.

## What It Does

| Tool | Description |
|------|-------------|
| `curriculum_fetch_updates` | Pulls latest Claude Code updates from 4 sources |
| `curriculum_analyze_gaps` | Compares updates against your curriculum and finds gaps |
| `curriculum_apply_update` | Writes changes to your curriculum markdown file |
| `curriculum_set_path` | Configures where your curriculum file lives |
| `curriculum_status` | Shows your progress and update history |

### Data Sources

1. **Boris Cherny's X** (@anthropaboris) — The Claude Code lead posts updates, tips, and announcements
2. **Anthropic Blog** — Official feature announcements and research
3. **Anthropic Changelog** — Technical release notes and API changes
4. **Claude Code Docs** — Current documentation structure for gap analysis

## Installation

### Prerequisites

- Python 3.10 or higher
- Claude Code installed (`npm install -g @anthropic-ai/claude-code`)

### Step 1: Clone or copy the project

```bash
# If you have the project directory:
cd ~/projects
cp -r claude-curriculum-updater ~/projects/curriculum-updater

# Or create from scratch and copy files
mkdir -p ~/projects/curriculum-updater
cd ~/projects/curriculum-updater
```

### Step 2: Install dependencies

```bash
cd ~/projects/curriculum-updater
pip install -e .
```

Or install dependencies directly:

```bash
pip install "mcp[cli]>=1.0.0" "httpx>=0.27.0" "beautifulsoup4>=4.12.0" "pydantic>=2.0.0"
```

### Step 3: Configure Claude Code

Add the MCP server to your Claude Code settings:

```bash
# Open your Claude Code settings
claude config
```

Or manually edit `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "curriculum_updater": {
      "command": "python",
      "args": ["-m", "curriculum_updater_mcp.server"],
      "cwd": "/Users/YOUR_USERNAME/projects/curriculum-updater"
    }
  }
}
```

**Important:** Replace `/Users/YOUR_USERNAME/projects/curriculum-updater` with the actual path where you installed the project.

### Step 4: Verify installation

```bash
# Test that the server starts
cd ~/projects/curriculum-updater
python -m curriculum_updater_mcp.server --help
```

Then in Claude Code:
```
> Use the curriculum_status tool to check the updater status
```

## Usage

### First Time Setup

In Claude Code, tell it where your curriculum lives:

```
> Set my curriculum path to ~/projects/curriculum/curriculum.md and I'm on week 1
```

Claude Code will use the `curriculum_set_path` tool automatically.

### Check for Updates

```
> Check for new Claude Code updates from the last 2 weeks
```

```
> What has Boris posted about Claude Code recently?
```

```
> Fetch updates from the Anthropic changelog only
```

### Analyze Gaps

```
> Analyze my curriculum for gaps against the latest Claude Code updates
```

```
> Show me only high priority curriculum gaps
```

### Apply Updates

```
> Update Week 9 to include the new Skills syntax that was just announced
```

```
> Add a new appendix section about Opus 4.6 capabilities
```

### Full Workflow

The ideal workflow before each study session:

```
> 1. Check for new Claude Code updates
> 2. Analyze gaps against my curriculum
> 3. Apply any high-priority updates
> 4. Then start my Week X lesson
```

Or simply:

```
> Review and update my curriculum, then start today's lesson
```

## How It Works

### Update Detection

The server scrapes public web pages — no API keys required:

- **X/Twitter**: Tries Nitter instances (public Twitter mirrors) first, then falls back to X.com scraping
- **Anthropic Blog**: Scrapes the news page for Claude-related posts
- **Changelog**: Parses the documentation changelog
- **Docs**: Maps the Claude Code documentation structure

### Relevance Filtering

Updates are filtered through a keyword system that matches against Claude Code concepts:
- Model updates (Opus, Sonnet, Haiku)
- Features (MCP, hooks, skills, agent teams)
- Tools (plan mode, /compact, CLAUDE.md)
- Infrastructure (API, SDK, context window)

### Gap Analysis

Each update is compared against a built-in topic map of your 12-week curriculum:
- Identifies which weeks are affected
- Classifies gaps as: new feature, deprecation, update, or new topic
- Prioritizes based on source authority and curriculum phase
- Generates specific, actionable suggestions

### Caching

The server maintains a local cache at `~/.curriculum-updater/`:
- `update_cache.json` — Tracks seen and applied updates
- `curriculum_state.json` — Your progress and configuration

This means you won't see the same updates twice unless you explicitly ask for them.

## Project Structure

```
curriculum-updater/
├── pyproject.toml                          # Package configuration
├── README.md                               # This file
└── curriculum_updater_mcp/
    ├── __init__.py                          # Package init
    ├── server.py                            # MCP server + tool definitions
    ├── sources.py                           # Data fetchers (X, blog, changelog, docs)
    ├── analyzer.py                          # Gap analysis and curriculum comparison
    └── cache.py                             # Local caching for seen/applied updates
```

## Troubleshooting

### "No updates found"

- X/Twitter scraping is unreliable due to anti-bot measures. The server tries multiple Nitter instances as fallback.
- Try `include_seen=true` to see all historical updates
- Try specific sources: `source="anthropic_blog"` is the most reliable

### "Could not read curriculum file"

- Make sure you've set the path: `curriculum_set_path`
- Check the file exists at the path you provided
- Use the full path (e.g., `/Users/mgb/projects/curriculum.md`)

### MCP server not showing up in Claude Code

1. Check `~/.claude/settings.json` has the correct path
2. Make sure `cwd` points to the project directory (where `pyproject.toml` is)
3. Run `claude mcp list` to verify the server is registered
4. Restart Claude Code after changing settings

### Network errors

- The server needs internet access to fetch updates
- Some corporate firewalls may block Nitter instances
- Anthropic's blog and docs are the most reliably accessible sources

## Extending

### Adding New Sources

Edit `sources.py` to add new data sources:

```python
async def fetch_your_source() -> list[Update]:
    # Fetch and parse your source
    # Return list of Update objects
    pass
```

Then add it to `fetch_all_updates()` in the fetchers list.

### Customizing Keywords

Edit `CLAUDE_CODE_KEYWORDS` in `sources.py` to add or remove relevance keywords.

### Customizing the Topic Map

Edit `CURRICULUM_TOPIC_MAP` in `analyzer.py` to match your specific curriculum structure if you've customized it.
