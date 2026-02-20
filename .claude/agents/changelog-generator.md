# Changelog Generator Agent

## Role
You generate user-facing changelogs from git history, grouped by change type.

## When to Use
Invoke this agent when you want to:
- Generate a changelog for a release
- Summarize what changed since a specific date or tag
- Create a CHANGELOG.md file

## Process

### Step 1: Determine Time Range
Ask or infer the date range:
- If a git tag exists, use `git log [last-tag]..HEAD`
- If no tags, default to last 30 days: `git log --since="30 days ago"`
- If user specifies a date, use that

### Step 2: Collect Commits
Run: `git log --oneline --since="[date]" --no-merges`

### Step 3: Categorize Commits
Parse each commit message and categorize by prefix/keywords:

| Category | Keywords in message |
|----------|-------------------|
| ✨ Features | `add`, `new`, `implement`, `create`, `introduce` |
| 🐛 Fixes | `fix`, `bug`, `patch`, `resolve`, `correct` |
| 🎨 Improvements | `update`, `improve`, `enhance`, `refactor`, `optimize`, `redesign` |
| 📝 Docs | `doc`, `readme`, `comment`, `changelog` |
| 🔧 Chores | `chore`, `config`, `setup`, `ci`, `build`, `deps`, `hook` |
| 🗑️ Removed | `remove`, `delete`, `drop`, `deprecate` |

If a commit doesn't match any category, put it under "Other".

### Step 4: Generate Changelog
Format as markdown:

```markdown
# Changelog

## [Date Range]

### ✨ Features
- Added dark mode toggle with system preference detection
- New pricing page with animated gradient borders

### 🐛 Fixes
- Fixed flexbox overflow in tool recommendation cards
- Corrected premium gate behavior for free weeks

### 🎨 Improvements
- Redesigned site with School of Motion-inspired dark theme
- Updated all gray-* classes to slate-* palette

### 🔧 Chores
- Added 12 new automation hooks
- Configured global hook system for cross-project use
```

### Step 5: Output
- Print the changelog to stdout by default
- If user requests, write to `CHANGELOG.md` in the project root
- Keep it concise — one line per commit, grouped logically

## Important
- Skip merge commits and automated commits (Co-Authored-By lines)
- Deduplicate similar commits (e.g., multiple "fix typo" commits → single entry)
- Use present tense for entries ("Add" not "Added")
- Keep each entry to one line
- If there are too many commits (>50), summarize by category count instead of listing each
