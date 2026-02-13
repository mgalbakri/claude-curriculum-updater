# Claude Code Mastery Curriculum v2
## February 2026 Edition

**Duration:** 12 Weeks
**Goal:** From zero coding knowledge to Claude Code expert
**Prerequisites:** None. This curriculum assumes you have never written code or opened a terminal.
**Cost:** Free. You need a computer (Mac, Windows, or Linux), an internet connection, and an Anthropic API key or Claude Pro/Max subscription.

---

## Phase I: Foundation (Weeks 1–3)

### WEEK 1: The Terminal & File System
**Subtitle:** Your gateway to Claude Code
**Objective:** Master command-line navigation, file management, and install Node.js.

**What is a terminal?**
Think of your computer as a house with many rooms (folders) full of drawers (files). Normally you click through windows and icons to open those rooms — that is the graphical interface. The terminal is a different door into the same house: instead of clicking, you type short text commands. It looks like a blank screen with a blinking cursor. That is all it is — a text-based way to talk to your computer.

**Why do we need it?**
Claude Code lives in the terminal. To use Claude Code, you need to be comfortable typing commands. The good news: you only need about 15 commands to get started, and we will learn them one at a time.

**How to open the terminal:**
- **Mac:** Open Finder → Applications → Utilities → Terminal. Or press Cmd+Space, type "Terminal", and press Enter.
- **Windows:** Press the Windows key, type "PowerShell", and press Enter. (We recommend installing Windows Subsystem for Linux for the best experience with Claude Code.)
- **Linux:** Press Ctrl+Alt+T, or search for "Terminal" in your applications menu.

**Topics:**
- What is a terminal and why we use it (covered above)
- Opening the terminal on Mac, Windows, and Linux
- Navigation — finding your way around:
  - `pwd` ("print working directory") — shows which folder you are currently in. Think of it like asking "Where am I right now?"
  - `ls` ("list") — shows everything inside the current folder, like opening a drawer to see what is in it
  - `cd` ("change directory") — moves you into a different folder, like walking from one room to another
  - `cd ..` — goes back one level, like stepping out of a room into the hallway
  - `cd ~` — takes you straight home, to your personal home folder
- File management — creating and organizing:
  - `mkdir` ("make directory") — creates a new folder
  - `touch` — creates a new empty file
  - `cp` ("copy") — copies a file or folder
  - `mv` ("move") — moves or renames a file
  - `rm` ("remove") — deletes a file (be careful — there is no undo!)
- Reading files:
  - `cat` — displays the entire contents of a file
  - `less` — lets you scroll through a long file page by page
  - `head` / `tail` — shows just the first or last few lines
- Environment basics:
  - `echo` — prints text to the screen (like a "say this" command)
  - `export` — sets a variable that other programs can read
  - `PATH` — the list of places your computer searches when you type a command name
- Installing Node.js and npm — Node.js is the engine that runs Claude Code; npm is its package manager (think of it as an app store for code libraries)
- Package managers: Homebrew (Mac) — an app store you use from the terminal

**Activities:**
- Open the terminal for the first time and type `pwd` to see where you are
- Navigate to your home directory (`cd ~`) and explore with `ls`
- Create your first project folder: `mkdir my-first-project` — this is the folder you will use throughout Weeks 1 through 3
- Inside `my-first-project`, create subfolders: `mkdir notes`, `mkdir scripts`
- Create, move, copy, and delete practice files to build muscle memory
- Install Node.js using Homebrew (Mac) or nvm (any platform)
- Verify installation with `node --version` and `npm --version`

**Deliverable:** A `my-first-project` folder (with subfolders) created entirely from the terminal, and Node.js installed and verified.
**Skills:** Terminal navigation, file management, reading error messages, Node.js setup

#### Terminal & Environment Updates (Feb 2026)
- **Terminal rendering performance** improved significantly (v2.1.39)
- **Fatal errors** are now properly displayed instead of being swallowed (v2.1.39)
- **Process hanging** after session close fixed (v2.1.39)
- **Vim normal mode** now supports arrow key history navigation when cursor cannot move further (v2.1.20)
- **External editor shortcut** (Ctrl+G) added to the help menu (v2.1.20)
- **Customizable spinner verbs** via `spinnerVerbs` setting (v2.1.23)
- **mTLS and proxy connectivity** fixed for corporate proxies and client certificates (v2.1.23)
- **Installation change:** npm installations are deprecated — use `claude install` instead (v2.1.15)

**Exercise:**
- Run `claude install` if you previously installed via npm
- Try Ctrl+G to open an external editor from within Claude Code
- Customize your spinner verbs in settings

#### Maintaining Your Claude Code Environment
- The `~/.claude` directory stores session data, memories, and settings. It can grow to 1GB+ after a few weeks of daily use.
- There is no built-in auto-cleanup — periodically review and prune old session data.
- Key space consumers: session transcripts, tool outputs, and cached context.

#### Token Optimization: Reducing Context Noise

- **The problem:** Claude Code sends raw terminal output (passing tests, verbose logs, status bars) into the LLM context window — most of it is noise you're paying tokens for
- **Impact:** Unoptimized sessions can use 10x+ more tokens than necessary
- **Strategies:**
  1. **Keep commands focused:** Use targeted commands (`grep`, `head`, `tail`) instead of dumping entire files or logs
  2. **Filter test output:** Run specific test files/cases instead of full suites when debugging
  3. **Use `.claudeignore`:** Exclude build artifacts, node_modules, and generated files from context
  4. **Leverage subagents:** Claude Code's Task tool offloads exploration to subagents, keeping the main context clean
  5. **Community tools:** Projects like CLI proxies (e.g., rtk) can filter terminal output before it reaches context

**Exercise:** Run a Claude Code session on a project. Check token usage with `/cost`. Then repeat the same task using focused commands and `.claudeignore` — compare the token difference.

**Discussion:** [Community thread on token savings](https://www.reddit.com/r/ClaudeAI/comments/1r2tt7q/i_saved_10m_tokens_89_on_my_claude_code_sessions/)


**Claude Code npm 2.1.41 (latest)** (added 2026-02-13)
@anthropic-ai/claude-code@2.1.41 published to...
Source: https://www.npmjs.com/package/@anthropic-ai/claude-code/v/2.1.41

---

### WEEK 2: Git & Version Control
**Subtitle:** Never lose your work again
**Objective:** Understand how professional developers track changes and collaborate.

**What is version control?**
Imagine you are writing an important essay. You might save copies named "essay-draft1", "essay-draft2", "essay-final", "essay-FINAL-final". Version control does this automatically and much more elegantly. Git is a tool that takes a snapshot of your project every time you tell it to. You can go back to any snapshot, compare changes, and even work on different versions at the same time without losing anything. Think of it like Google Docs version history, but for your entire project folder.

**Why Git?**
Git is the industry standard — every professional developer uses it. And Claude Code works best when your project is tracked by Git, because it can see your history, create branches, and help you collaborate.

**Topics:**
- What is Git and why every developer uses it
- git init, git add, git commit — the core cycle
- git log, git diff, git status — understanding your history
- Branches: git branch, git checkout, git merge
- GitHub: creating repos, pushing code, pull requests
- GitHub Personal Access Tokens for Claude Code integration

**Activities:**
- Inside your `my-first-project` folder, run `git init` to start tracking changes (this tells Git: "Watch this folder for me")
- Practice the add → commit cycle: make a change, `git add` it (stage it), `git commit` it (save a snapshot) — with a clear message describing what you changed
- Create a branch (a parallel copy of your project where you can experiment safely), make changes, then merge it back
- Create a free GitHub account and push your project to the cloud — now your work is backed up online
- Open and merge your first pull request (a pull request is how you propose changes for review before they become official)
- Generate a GitHub Personal Access Token (a special password that lets Claude Code talk to GitHub on your behalf)

**Deliverable:** Your `my-first-project` published on GitHub with at least 5 meaningful commits and 1 merged pull request.
**Skills:** Git fundamentals, GitHub, branching, pull requests, authentication tokens

#### Git Workflow Updates (Feb 2026)
- **`--from-pr` flag** added to resume sessions linked to a specific GitHub PR number (v2.1.27)
- **Debug logs** now include tool call failures and denials (v2.1.27)
- **Community tip — Token optimization:** The `rtk` (Rust Token Killer) CLI proxy can sit between Claude Code and terminal commands, filtering noise from raw command output before it reaches the LLM context (reported 89% token savings)
- **Community tip — Cleaner PR reviews:** When using `claude-code-action` in GitHub workflows, configure it to reduce comment noise and clean up old comments

**Exercise:**
- Try `claude --from-pr 42` to resume a session tied to a specific PR
- Explore token-saving strategies for long-running sessions


**Anthropic Python SDK 0.79.0** (added 2026-02-07)
New release of the anthropic Python package: version...
Source: https://pypi.org/project/anthropic/0.79.0/

---

### WEEK 3: Claude Code — First Contact
**Subtitle:** Your AI coding partner is online
**Objective:** Install Claude Code, run your first session, and understand the core interaction model.

**Topics:**
- Installing Claude Code (npm install -g @anthropic-ai/claude-code)
- Authentication: API key vs. Claude Pro/Max subscription — an API key is like a personal password that proves you have permission to use Claude. You get one from the Anthropic website. Alternatively, a Claude Pro or Max subscription handles this automatically.
- Anatomy of a session: prompt → plan → execute → review
- Plan mode: always start here
- Reading diffs: understanding what Claude changed
- Essential commands: /help, /compact, /clear, /model, /context
- Introduction to CLAUDE.md
- Understanding context window and token usage

**Activities:**
- Install Claude Code and authenticate
- Run your first session: ask Claude to build a simple to-do list app (for example: "Create a to-do list where I can add and remove tasks")
- Practice Plan mode: describe what you want before Claude codes
- Review a diff and understand every change
- Use /compact during a long session
- Create your first CLAUDE.md file

**Deliverable:** Claude Code installed and configured. First working script built entirely through Claude Code with a CLAUDE.md file.
**Skills:** Claude Code basics, Plan mode, diff reading, /compact, CLAUDE.md creation

#### Current Model Lineup (February 2026)

| Model | Released | Model ID | Best For |
|-------|----------|----------|----------|
| **Claude Opus 4.6** | Feb 2026 | `claude-opus-4-6` | Agentic coding, complex tool use, multi-step reasoning |
| **Claude Sonnet 4.5** | Sep 2025 | `claude-sonnet-4-5-20250929` | Everyday coding, balanced speed/capability |
| **Claude Haiku 4.5** | Oct 2025 | `claude-haiku-4-5-20251001` | Quick tasks, high-volume operations, cost-sensitive workflows |

- **Opus 4.6** leads across agentic coding, computer use, tool use, search, and finance benchmarks. Available in Claude Code since v2.1.32; fast mode enabled in v2.1.36.
- **Sonnet 4.5** sets benchmark records in coding, reasoning, and computer use. The default workhorse model. Released alongside the **Claude Agent SDK** for building custom agents programmatically.
- **Haiku 4.5** matches prior state-of-the-art coding with unprecedented speed and cost-efficiency. Used internally by Claude Code for fast subagent operations.

**Key takeaway:** Switch models mid-session with `/model` or set `ANTHROPIC_MODEL`. Use Opus 4.6 for complex architecture, Sonnet 4.5 for everyday coding, Haiku 4.5 for rapid iteration. Fast mode (`/fast`) is available for Opus 4.6.

**Exercise:** Run the same prompt with all three models and compare response time, token cost, and output quality. Identify which tasks are "Haiku-appropriate" vs those that need Sonnet or Opus.

**References:**
- [Opus 4.6](https://www.anthropic.com/news/claude-opus-4-6) | [Sonnet 4.5](https://www.anthropic.com/news/claude-sonnet-4-5) | [Haiku 4.5](https://www.anthropic.com/news/claude-haiku-4-5)
- [Agent SDK docs](https://docs.anthropic.com/en/docs/agents/agent-sdk)

#### Claude Code Feature Updates (Feb 2026)

**Task Management System:**
A new task management system with dependency tracking was added (v2.1.16). Tasks can be created, updated, and tracked with `blockedBy`/`blocks` relationships. Disable with `CLAUDE_CODE_ENABLE_TASKS=false` to use the old system temporarily.

**Auto Memory:**
Claude now automatically records and recalls memories as it works (v2.1.32). Memories persist in `~/.claude/` and are loaded into the system prompt for future sessions.

**Session Resume:**
On exit, Claude Code now shows a session resume hint so you can continue your conversation later (v2.1.31).

**Exercise:**
- Toggle `/fast` mode and compare response speed vs. quality
- Let Claude build up auto memories across a few sessions, then review what it stored in `~/.claude/`
- Use the task management system on a multi-step project to track progress

#### Community Tools: ClaudeDesk

- **ClaudeDesk v4.4.0** — An open-source Electron desktop app wrapping the Claude Code CLI. Provides multi-session terminals, split views, and agent team visualization.
- Features: full git workflow (status, staging, commits) without leaving the app, 233+ automated tests.
- Useful as a GUI alternative when you prefer a desktop interface over the raw terminal.
- **Reference:** https://github.com/anthropics/claudedesk

#### Token Usage Awareness

- **Opus 4.6 uses more tokens** than previous models due to deeper planning and longer autonomous runs. Monitor your usage with `/cost` during sessions.
- Community reports suggest token consumption can spike significantly when using Opus 4.6 for design-heavy or test-heavy workflows.
- **Tip:** Use Sonnet 4.5 or Haiku 4.5 for routine tasks, and reserve Opus 4.6 for complex architecture and multi-step reasoning where quality matters most.

---

## Phase II: Building (Weeks 4–8)

### WEEK 4: Your First Full Application
**Subtitle:** From idea to deployed tool
**Objective:** Build a complete, working web application from scratch using Claude Code.

**What are we building?**
This week you will build your first real web application — a personal task manager. Think of it as a to-do list app that lives on the internet, so you (or anyone you share the link with) can access it from any browser. We will use a few tools to build it, and here is what each one does in plain English:

- **React** — A popular toolkit for building web pages. Instead of writing one giant page, React lets you build small, reusable pieces (called "components") and snap them together like LEGO bricks.
- **Next.js** — A framework built on top of React that handles the behind-the-scenes plumbing: routing (deciding which page to show when you click a link), loading data, and more.
- **Tailwind CSS** — A styling system that lets you make things look good by adding short class names directly in your code. Instead of writing separate style files, you describe the look right where you build the component.
- **Vercel** — A free hosting platform. When you "deploy" to Vercel, your app gets a real URL that anyone in the world can visit.

You do not need to memorize these definitions. Claude Code knows all of them deeply, and you will direct it using plain English.

**Topics:**
- React and Next.js (see the overview above)
- Project scaffolding with Claude Code — asking Claude to set up your project structure
- Components: building blocks of modern web apps (each piece of your page is a component)
- Styling with Tailwind CSS — making it look good
- Deployment to Vercel — putting your app on the internet
- Environment variables and configuration — settings your app needs to run (like API keys)

**Activities:**
- Ask Claude Code to scaffold a Next.js project for a personal task manager (for example: "Create a Next.js app where I can add, complete, and delete tasks")
- Build a task list component that displays all your tasks with their status
- Add search and filter functionality (find tasks by name, filter by complete/incomplete)
- Style the application with Tailwind CSS
- Deploy to Vercel for the first time
- Share the live URL with a friend or family member and ask them to try it

**Deliverable:** A deployed personal task manager on Vercel where you can add, complete, search, and delete tasks.
**Skills:** React/Next.js basics, component thinking, Tailwind CSS, Vercel deployment

---

### WEEK 5: Databases & APIs
**Subtitle:** Where your data lives
**Objective:** Connect your application to a real database and understand data flow.

**What is a database?**
Think of a database as a super-powered spreadsheet. Right now, if you close your task manager app and reopen it, all your tasks disappear — they only lived in your browser's memory. A database stores your data permanently on a server, so it is always there when you come back. Supabase is a free service that gives you a database in the cloud — no need to set up your own server.

**Topics:**
- What is a database and why you need one
- Supabase: your backend-as-a-service
- SQL basics: SELECT, INSERT, UPDATE, DELETE
- Database schema design
- API routes in Next.js
- CRUD operations (Create, Read, Update, Delete)
- Row Level Security basics

**Activities:**
- Set up a free Supabase project (Supabase gives you a database and handles the server side for you)
- Design a schema for your task manager — a schema is the structure of your data, like deciding what columns a spreadsheet has (task name, status, due date, etc.)
- Ask Claude Code to create API routes (the behind-the-scenes paths your app uses to talk to the database)
- Build forms to add and edit tasks
- Implement all CRUD operations (Create, Read, Update, Delete — the four basic things you can do with data)
- Add basic data validation (making sure users cannot submit empty tasks, for example)

**Deliverable:** Your task manager connected to Supabase with full CRUD operations — tasks are now saved permanently.
**Skills:** Database concepts, Supabase, SQL basics, API routes, CRUD operations

#### Cowork: Claude Code for Desktop
- **Cowork** brings Claude Code's agentic capabilities to the Claude desktop app. Give Claude access to a folder, set a task, and let it work — it loops you in along the way.
- Useful when you want Claude Code-style workflows without opening a terminal.
- Try it at [claude.com/download](https://claude.com/download).

#### Shell & Input Fixes (Feb 2026)

- **Shell completion cache** files no longer get truncated on exit (v2.1.21)
- **Full-width (zenkaku) input** from Japanese IME now works correctly in option selection prompts (v2.1.21, v2.1.31)
- **Tab key** fixed to properly autocomplete instead of queueing slash commands (v2.1.38)

---

### WEEK 6: Authentication & Dashboards
**Subtitle:** Real apps need real security
**Objective:** Add user authentication and build a professional dashboard.

**Topics:**
- Authentication concepts: login, sessions, tokens
- Supabase Auth integration
- Protected routes and middleware
- Dashboard design principles
- Data visualization with charts
- Responsive design (mobile + desktop)
- The /code-review workflow

**Activities:**
- Add Supabase Auth to your task manager (so each user has their own private tasks)
- Create login and signup pages
- Protect dashboard routes from unauthorized access (only logged-in users can see their tasks)
- Build a dashboard showing task statistics: total tasks, completed vs. pending, tasks due soon
- Add charts visualizing your productivity (tasks completed per day, category breakdown)
- Make the dashboard responsive (looks good on both phone and desktop)
- Run /code-review on your codebase

**Deliverable:** A secure, authenticated dashboard with data visualization.
**Skills:** Authentication, dashboards, error handling, /code-review, responsive design

#### Authentication & Dashboard Updates (Feb 2026)
- **PDF page-range reading:** The Read tool now accepts a `pages` parameter for PDFs (e.g., `pages: "1-5"`). Large PDFs (>10 pages) return a lightweight reference when `@` mentioned instead of being inlined into context (v2.1.30)
- **Task management in VS Code:** Native plugin management support added, plus OAuth users can browse and resume remote Claude sessions from the Sessions dialog (v2.1.16)

**Exercise:**
- Use `@` to reference a large PDF in a Claude Code session and observe how it handles pagination
- Try resuming a remote session from VS Code's Sessions dialog

---

### WEEK 7: Testing & Quality
**Subtitle:** Maintaining code quality at scale
**Objective:** Understand why testing matters and how to direct Claude to write tests.

**Topics:**
- What are tests and why they matter
- Unit tests, integration tests overview
- The verification loop: instruct → code → test → verify
- Using Claude to write tests
- Reading test output
- The /code-review workflow

**Activities:**
- Ask Claude to write tests for your task manager
- Run the tests and read the output
- Find a bug → write a test → fix the bug
- Use /code-review to audit your project
- Add test commands to CLAUDE.md

**Deliverable:** Your task manager app with a test suite that runs automatically.
**Skills:** Testing concepts, verification loops, quality assurance

---

### WEEK 8: Second Project — Domain Deep Dive
**Subtitle:** Building something only YOU could design
**Objective:** Apply everything learned to build a second, more complex application.

**Topics:**
- Project scoping: defining requirements
- Breaking complex projects into phases
- Working with external APIs
- Data visualization: charts, maps
- Progressive enhancement
- Documentation: READMEs that matter

**Activities:**
- Choose your second project — pick something you personally care about! Suggestions:
  - A **habit tracker** (track daily habits like exercise, reading, water intake)
  - A **book reading log** (track books you have read, want to read, with ratings and notes)
  - A **local weather dashboard** (pull weather data for your city and display forecasts)
  - A **recipe collection** (store and search your favorite recipes by ingredient or cuisine)
  - Or any idea that excites you — the best project is one you will actually use
- Write a detailed project brief describing what it does, who it is for, and what data it needs
- Build in phases: data first, then logic, then the user interface, then polish
- Deploy to Vercel with a professional README
- Self-review using /code-review

**Deliverable:** A second deployed application solving a real problem that matters to you.
**Skills:** Project scoping, phased development, external APIs, data visualization

#### Claude Developer Platform & Web Access

- **Claude Developer Platform** ([platform.claude.com](https://platform.claude.com/)) — Centralized hub for managing API keys, usage, billing, and project configuration.
  - API key management and rotation
  - Usage dashboards and token consumption tracking
  - Project and organization settings
  - Model access configuration
- **Claude Code on the Web** ([claude.ai/code](https://claude.ai/code)) — Browser-based access to Claude Code. Complements the CLI workflow for quick tasks or when terminal access isn't available.

**Exercise:** Visit the Claude Developer Platform and explore the usage dashboard. Review your API key setup and ensure your Claude Code CLI is authenticated correctly. Identify how token usage maps to the sessions you've run.

---

## Phase III: Mastery (Weeks 9–12)

### WEEK 9: Skills, Hooks & Custom Commands
**Subtitle:** Teaching Claude YOUR workflow
**Objective:** Deep dive into Claude Code's extensibility system.

**Topics:**
- Skills: SKILL.md files for project patterns
- Skill frontmatter: name, description, allowed-tools, context, agent, model, hooks
- How skills auto-invoke based on context matching
- `disable-model-invocation` vs `user-invocable` — controlling who triggers skills
- `context: fork` — running skills in isolated subagent contexts
- `$ARGUMENTS`, `$0`, `$1` — argument substitution in skills
- Dynamic context injection with `!`command`` syntax (preprocessing)
- Supporting files: templates, examples, scripts alongside SKILL.md
- Custom slash commands via .claude/commands/ (skills supersede these)
- Hooks: 14 events covering the full Claude Code lifecycle
- Three hook types: `command` (shell scripts), `prompt` (LLM judgment), `agent` (subagent verification)
- Hook decision control: exit codes, JSON decision patterns (allow/deny/ask/block)
- Async hooks for non-blocking background execution
- Hook configuration scopes: user, project, local, managed, plugin, skill/agent frontmatter
- The `/hooks` menu for interactive hook management

**Activities:**
- Create a custom skill for your project (for example, a "task-summary" skill that generates a weekly task report, or a "recipe-finder" skill for a recipe app) with supporting files
- Create a skill with `context: fork` that runs in an Explore subagent
- Write a `PreToolUse` command hook that validates Bash commands before execution
- Write a `Stop` prompt hook that checks if all tasks are complete before Claude stops
- Create a custom /deploy command with `disable-model-invocation: true`
- Test skill auto-invocation and argument passing (`/skill-name arg1 arg2`)
- Build an async `PostToolUse` hook that runs tests in the background after file edits
- Use `!`gh pr diff`` dynamic context injection in a PR summary skill

**Deliverable:** At least 2 custom skills (one forked, one inline), 3 hooks (command, prompt, agent types), and 1 custom command.
**Skills:** Skills system, hooks (all 3 types), custom commands, workflow automation, skill forking

#### Complete Hook Events Reference

Claude Code has **14 hook events** covering the entire lifecycle:

| Event | When It Fires | Can Block? |
|-------|---------------|------------|
| `SessionStart` | Session begins or resumes | No |
| `UserPromptSubmit` | You submit a prompt, before Claude processes it | Yes |
| `PreToolUse` | Before a tool call executes | Yes (allow/deny/ask) |
| `PermissionRequest` | When a permission dialog appears | Yes |
| `PostToolUse` | After a tool call succeeds | No (tool already ran) |
| `PostToolUseFailure` | After a tool call fails | No |
| `Notification` | When Claude Code sends a notification | No |
| `SubagentStart` | When a subagent is spawned | No |
| `SubagentStop` | When a subagent finishes | Yes |
| `Stop` | When Claude finishes responding | Yes (keeps Claude working) |
| `TeammateIdle` | When an agent team teammate is about to go idle | Yes |
| `TaskCompleted` | When a task is being marked as completed | Yes |
| `PreCompact` | Before context compaction | No |
| `SessionEnd` | When a session terminates | No |

#### Three Hook Types

| Type | How it works | Use when |
|------|-------------|----------|
| `command` | Runs a shell script. Receives event JSON on stdin. Exit 0 = proceed, exit 2 = block. | Deterministic rules (linting, logging, validation) |
| `prompt` | Sends a prompt to a Claude model (Haiku by default) for yes/no judgment. | Decisions requiring judgment, not deterministic rules |
| `agent` | Spawns a subagent that can read files and run tools to verify conditions (up to 50 turns). | Verification requiring actual codebase inspection |

**Command hook example** (validate Bash commands):
```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "jq -r '.tool_input.command' | grep -q 'rm -rf' && exit 2 || exit 0"
      }]
    }]
  }
}
```

**Prompt hook example** (check task completeness):
```json
{
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "prompt",
        "prompt": "Check if all tasks are complete. If not, respond with {\"ok\": false, \"reason\": \"what remains\"}."
      }]
    }]
  }
}
```

**Agent hook example** (verify tests pass before stopping):
```json
{
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "agent",
        "prompt": "Run the test suite and verify all tests pass. $ARGUMENTS",
        "timeout": 120
      }]
    }]
  }
}
```

#### Advanced Hook Features

- **Async hooks**: Set `"async": true` on command hooks to run in the background without blocking Claude. Results delivered on the next conversation turn.
- **`CLAUDE_ENV_FILE`**: In `SessionStart` hooks, write environment variables to this file path to persist them for all subsequent Bash commands in the session.
- **`PreToolUse` decision control**: Return JSON with `permissionDecision: "allow"/"deny"/"ask"` and optional `updatedInput` to modify tool input before execution.
- **Matchers**: Regex patterns that filter when hooks fire. Tool hooks match tool names (e.g., `Bash`, `Edit|Write`, `mcp__github__.*`). Session hooks match reasons (e.g., `clear`, `resume`).
- **Hook locations**: `~/.claude/settings.json` (all projects), `.claude/settings.json` (project), `.claude/settings.local.json` (local), managed policy, plugin `hooks/hooks.json`, skill/agent frontmatter.
- **`/hooks` menu**: Type `/hooks` to interactively view, add, and delete hooks. Labels show source: `[User]`, `[Project]`, `[Local]`, `[Plugin]`.
- **Stop hook loop prevention**: Check `stop_hook_active` field — if `true`, exit 0 to let Claude stop.
- **`disableAllHooks`**: Toggle in `/hooks` menu or set in settings to disable all hooks without removing them.

#### Advanced Skill Features

- **Supporting files**: Keep `SKILL.md` under 500 lines. Add `reference.md`, `examples.md`, scripts — reference them from SKILL.md so Claude loads them only when needed.
- **Dynamic context injection**: `!`gh pr diff`` runs shell commands before the skill content reaches Claude. Output replaces the placeholder. This is preprocessing, not something Claude executes.
- **Skill character budget**: Skill descriptions consume context (2% of window, fallback 16,000 chars). Override with `SLASH_COMMAND_TOOL_CHAR_BUDGET`. Run `/context` to check for excluded skills.
- **Skill discovery**: Skills from `.claude/skills/` in `--add-dir` directories are loaded automatically with live change detection. Nested `.claude/skills/` in subdirectories supports monorepos.
- **Permission control**: Use `Skill(name)` in permission rules. `Skill(deploy *)` denies the deploy skill. Add `disable-model-invocation: true` to remove a skill from Claude's context entirely.

#### Skills, Hooks & Commands Updates (Feb 2026)
- **Custom command argument shorthand:** Use `$0`, `$1`, etc. to access individual arguments in custom commands (v2.1.19)
- **`CLAUDE_CODE_ENABLE_TASKS` env var:** Set to `false` to revert to the old task system temporarily (v2.1.19)
- **`TeammateIdle` and `TaskCompleted` hook events** added for multi-agent workflows (v2.1.33)
- **Bash permission matching** fixed for commands using environment variable wrappers (v2.1.38)
- **Sandbox bypass fix:** Commands excluded from sandboxing via `sandbox.excludedCommands` or `dangerouslyDisableSandbox` no longer bypass the Bash ask permission rule when `autoAllowBashIfSandboxed` is enabled (v2.1.34)

#### Non-Interactive Mode & CI Automation

- **Structured outputs** in non-interactive (`-p`) mode are now fully supported (v2.1.22). Use `-p` with `--output-format json` to get structured responses for scripts and CI pipelines.
- **Startup performance** improved when resuming sessions with `saved_hook_context` (v2.1.29).
- **Gateway compatibility:** Users on Bedrock or Vertex can set `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1` to avoid beta header validation errors (v2.1.25, v2.1.27).

**Exercise:**
- Run `claude -p "list all files" --output-format json` and parse the structured output in a bash script
- Set up a CI step that uses Claude Code in non-interactive mode

#### Auto Memory (Feb 2026)

As of v2.1.32, Claude Code **automatically records and recalls memories** as it works. This is a significant change to how context persists across sessions.

**How it works:**
- Claude maintains a persistent memory directory at `~/.claude/projects/<project>/memory/`
- `MEMORY.md` is loaded into the system prompt each session (keep it under 200 lines)
- Separate topic files (e.g., `debugging.md`, `patterns.md`) can hold detailed notes
- Memories persist across conversations automatically

**What Claude saves:**
- Stable patterns confirmed across multiple interactions
- Key architectural decisions and important file paths
- User preferences for workflow and tools
- Solutions to recurring problems

**What Claude does NOT save:**
- Session-specific or temporary state
- Unverified conclusions from a single file read
- Anything duplicating CLAUDE.md instructions

**Exercise:** After a few sessions on a project, inspect `~/.claude/projects/` to see what Claude has remembered. Try asking Claude to "remember" a preference (e.g., "always use bun instead of npm") and verify it persists in the next session.

---

### WEEK 10: MCP Servers & Plugins
**Subtitle:** Connecting Claude to your toolchain
**Objective:** Learn Model Context Protocol to connect Claude Code to external tools.

**Topics:**
- What is MCP and why it matters
- **MCP vs AI Agents**: MCP is a communication standard (the "USB port" for AI tools); agents are autonomous decision-makers that *use* MCP tools. MCP defines *what tools exist*; agents decide *when and how* to use them.
- MCP architecture: servers, tools, resources, prompts
- Transport types: `stdio` (local), `sse` (HTTP streaming), `streamable-http`
- MCP scopes: user (`~/.claude/settings.json`), project (`.claude/settings.json`), `--mcp-config` (session)
- Building an MCP server with Python (FastMCP)
- Tool definitions with Pydantic models
- MCP resources: expose data via `@` mentions (e.g., `@resource-name` in prompts)
- MCP prompts: server-defined prompts that appear as slash commands
- Tool Search (`ENABLE_TOOL_SEARCH`): Claude dynamically discovers relevant tools instead of loading all tool descriptions
- OAuth authentication for MCP servers (pre-configured connectors)
- `MAX_MCP_OUTPUT_TOKENS`: Control MCP response size (default 25,000 tokens, warning at 10,000)
- `claude mcp serve`: Run Claude Code itself as an MCP server
- Connecting MCP servers to Claude Code
- Available community MCP servers
- MCP in Claude.ai vs Claude Code
- Managed MCP configuration for enterprise deployments

**Activities:**
- Review the curriculum-updater MCP server you already built
- Build a second MCP server (for example, a weather data lookup, a book search API, or a task statistics endpoint)
- Connect both to Claude Code using `claude mcp add`
- Use MCP tools in a real workflow
- Explore community MCP servers (GitHub, Slack, etc.)
- Set up an MCP server with OAuth authentication
- Test Tool Search by setting `ENABLE_TOOL_SEARCH=true` and observing dynamic tool discovery
- Use `@` mentions to reference MCP resources in a prompt
- Try `claude mcp serve` to expose Claude Code as an MCP server to another client

**Deliverable:** Two working MCP servers connected to Claude Code, with OAuth on at least one.
**Skills:** MCP architecture, FastMCP, tool design, server integration, OAuth, tool search, resources

#### MCP Updates (Feb 2026)
- **Pre-configured OAuth MCP connectors** added, simplifying authentication setup for MCP servers (v2.1.30)
- **Restricted tool access:** Support added for restricting which MCP tools are available to specific contexts (v2.1.33)
- **npm deprecation:** Claude Code installation via npm is deprecated — use `claude install` or see the getting started docs (v2.1.15)
- **React Compiler** now used for UI rendering performance improvements (v2.1.15)

**Exercise:**
- Set up an OAuth-based MCP connector and test authenticated access
- Experiment with restricting MCP tool availability per-project

#### MCP Origins & Design Philosophy

- **Background:** MCP was created by Anthropic and donated as an open standard for connecting AI to external tools and services
- **Core idea:** A universal protocol so AI models can discover and use tools without bespoke integrations per service
- **Why it matters for Claude Code:** MCP is the backbone of Claude Code's plugin/server ecosystem — understanding its design philosophy helps you build better integrations
- **Key design principles:**
  - Tool discovery over hardcoded integrations
  - Server-side tool definitions with client-side execution
  - Transport-agnostic (stdio, HTTP/SSE)
  - Open standard — not locked to Anthropic

**Watch:** [Why we built and donated MCP — David Soria Parra](https://www.youtube.com/watch?v=kQRu7DdTTVA)

**Exercise:** After watching the video, write a short summary of why Anthropic chose to open-source MCP rather than keep it proprietary. How does this decision affect the Claude Code ecosystem?

---

### WEEK 11: Agent Teams & Parallel Sessions
**Subtitle:** Orchestrating AI workers
**Objective:** Use Claude Code's multi-agent capabilities for complex projects.

**Topics:**

**Subagents (built-in):**
- 6 built-in subagent types: Explore (Haiku, read-only), Plan (read-only), general-purpose (all tools), Bash, statusline-setup, Claude Code Guide
- How Claude automatically delegates tasks to subagents based on task description
- Foreground vs background subagents — Ctrl+B to background a running task
- Background subagent permissions: pre-approved upfront, auto-deny anything not pre-approved
- Subagent resume: continue a previous subagent's work with full context preserved
- Subagent auto-compaction (`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`)

**Custom subagents:**
- `.claude/agents/` directory for project-specific agents
- `~/.claude/agents/` for personal agents across all projects
- Agent frontmatter: `name`, `description`, `tools`, `disallowedTools`, `model`, `permissionMode`, `maxTurns`, `skills`, `mcpServers`, `hooks`, `memory`
- Persistent agent memory: `user`, `project`, or `local` scope — cross-session learning
- `--agents` CLI flag for session-level agents (JSON format, not saved to disk)
- `--agent` flag to run a named agent as the main thread
- `Task(agent_type)` in tools field to restrict which subagents can be spawned
- `/agents` command for interactive agent management

**Agent Teams (experimental):**
- Multi-agent collaboration with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
- Display modes: `in-process` (all in one terminal) vs `tmux` (separate panes)
- `delegate` permission mode: coordination-only for team leads
- Team lead assigns tasks, teammates implement — shared task list with dependencies
- Direct teammate messaging: Shift+Up/Down to switch between teammates
- `TeammateIdle` and `TaskCompleted` hook events for orchestration
- Headless mode for background/CI tasks
- Orchestration patterns: fan-out, pipeline, supervisor
- Resource management and context optimization

**Activities:**
- Create a custom subagent in `.claude/agents/` with persistent memory enabled
- Use `--agents` CLI flag to define session-level subagents for a code review workflow
- Test foreground vs background subagents — use Ctrl+B to background a task
- Resume a completed subagent to continue its work
- Set up an agent team for a full-stack project with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
- Assign frontend and backend to separate agents with appropriate `permissionMode`
- Use `delegate` mode for the team lead
- Use headless mode (`-p`) for automated testing
- Build an orchestration workflow for your capstone project

**Deliverable:** A project built using custom subagents and agent teams with at least 3 coordinated agents, including one with persistent memory.
**Skills:** Subagents (built-in + custom), agent teams, persistent memory, parallel sessions, headless mode, orchestration

#### Claude Agent SDK

- Released alongside Sonnet 4.5, the **Claude Agent SDK** enables building custom agents with Claude.
- Allows developers to build custom agents with tool use, define agent workflows, and integrate Claude as an autonomous agent into existing applications.
- Relevant to agent teams and parallel session workflows covered this week.
- **References:** [Announcement](https://www.anthropic.com/news/claude-sonnet-4-5) | [Agent SDK docs](https://docs.anthropic.com/en/docs/agents/agent-sdk)

#### Agent Teams Updates (Feb 2026)
- **Agent teams research preview** launched — multi-agent collaboration feature requiring `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` (v2.1.32). Note: this is token-intensive.
- **tmux integration** fixed for agent teammate sessions to properly send and receive messages (v2.1.33)
- **`TeammateIdle` and `TaskCompleted` hook events** added for orchestrating multi-agent workflows (v2.1.33)
- **Agent teams crash fix** when settings change between renders (v2.1.34)
- **Sandbox security fix** preventing excluded commands from bypassing Bash ask permission rules (v2.1.34)

**Exercise:**
- Enable agent teams with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` and try a multi-agent task
- Set up a `TeammateIdle` hook to monitor agent collaboration
- Test agent teams in a tmux session

---

### WEEK 12: Capstone & Portfolio
**Subtitle:** Putting it all together
**Objective:** Build a production-quality project showcasing everything you've learned.

**Topics:**
- Capstone project planning and architecture
- Professional Git workflow: feature branches, PRs, code review
- CI/CD: automated testing and deployment
- Production readiness: error handling, logging, monitoring
- Portfolio presentation: GitHub profile, README, live demos
- CLAUDE.md mastery: comprehensive project documentation

**Activities:**
- Plan your capstone — a production-quality application of your choice that showcases everything you have learned. This could be an enhanced version of your task manager, an entirely new app, or a combination of ideas from your previous projects.
- Build using agent teams and MCP integrations
- Implement full Git workflow with feature branches
- Set up CI/CD pipeline
- Write professional documentation
- Deploy production version
- Create portfolio page showcasing all projects

**Deliverable:** A production-deployed capstone project with full documentation, CI/CD, and a portfolio page linking all 12 weeks of work.
**Skills:** Full-stack development, professional workflows, CI/CD, portfolio presentation

---

## Appendices

### Appendix A: Daily Practice Checklist
- [ ] Open terminal and navigate to project folder
- [ ] Pull latest changes (git pull)
- [ ] Review yesterday's work (git log, git diff)
- [ ] Start Claude Code session with clear objective
- [ ] Use Plan mode before coding
- [ ] Commit progress with meaningful messages
- [ ] Push to GitHub
- [ ] Update CLAUDE.md if needed

### Appendix B: Essential Commands & CLI Reference

**Terminal:**
pwd, ls, cd, mkdir, touch, cp, mv, rm, cat, less, head, tail, echo, grep, find

**Git:**
git init, git add, git commit, git push, git pull, git branch, git checkout, git merge, git log, git diff, git status, git stash

**Claude Code Slash Commands:**
/help, /compact, /clear, /model, /context, /init, /code-review, /cost, /permissions, /hooks, /agents, /add-dir, /statusline, /fast

**npm:**
npm install, npm run dev, npm run build, npx

#### CLI Flags Reference (Key Flags)

| Flag | Description |
|------|-------------|
| `-p "query"` | Print mode — non-interactive, for scripts/CI |
| `-c` | Continue most recent conversation |
| `-r <session>` | Resume a specific session by ID or name |
| `--model <name>` | Set model (alias: `sonnet`, `opus`, `haiku`, or full model ID) |
| `--permission-mode <mode>` | Start in a permission mode: `plan`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `delegate` |
| `--agents '<json>'` | Define session-level subagents via JSON |
| `--agent <name>` | Run a named agent as the main thread |
| `--add-dir <path>` | Add additional working directories |
| `--mcp-config <file>` | Load MCP servers from JSON file |
| `--strict-mcp-config` | Only use MCP servers from `--mcp-config` |
| `--tools "Bash,Edit,Read"` | Restrict which built-in tools Claude can use |
| `--disallowedTools "Task(Explore)"` | Deny specific tools |
| `--allowedTools "Bash(npm run *)"` | Pre-approve specific tools without prompting |
| `--system-prompt "..."` | Replace the entire system prompt |
| `--append-system-prompt "..."` | Append to the default system prompt |
| `--output-format json` | Output format for `-p` mode: `text`, `json`, `stream-json` |
| `--json-schema '<schema>'` | Get validated JSON output matching a schema (`-p` only) |
| `--max-turns <n>` | Limit agentic turns (`-p` only) |
| `--max-budget-usd <n>` | Maximum dollar spend before stopping (`-p` only) |
| `--fallback-model <name>` | Auto-fallback when default model is overloaded (`-p` only) |
| `--from-pr <number>` | Resume sessions linked to a GitHub PR |
| `--fork-session` | Create new session ID when resuming |
| `--chrome` | Enable Chrome browser integration |
| `--remote "task"` | Create a web session on claude.ai |
| `--teleport` | Resume a web session in local terminal |
| `--teammate-mode <mode>` | Agent team display: `auto`, `in-process`, `tmux` |
| `--plugin-dir <path>` | Load plugins from a directory |
| `--verbose` | Enable verbose logging |
| `--debug` | Debug mode with optional category filter |
| `--dangerously-skip-permissions` | Skip all permission prompts (use with extreme caution) |

#### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | Cancel current generation |
| `Ctrl+B` | Background a running task |
| `Ctrl+O` | Toggle verbose mode (see hook output) |
| `Ctrl+G` | Open external editor |
| `Shift+Up/Down` | Switch between agent team teammates |
| `Escape` | Clear current input / exit mode |

### Appendix C: CLAUDE.md Starter Template
```markdown
# CLAUDE.md

## Project Overview
[What this project does in 1-2 sentences]

## Tech Stack
[List key technologies]

## Commands
[How to install, run, test, deploy]

## Architecture
[Key files and their roles]

## Conventions
[Code style, naming, patterns to follow]
```

### Appendix D: Recommended Resources
- Claude Code Docs: https://code.claude.com/docs/en
- Claude Developer Platform: https://platform.claude.com
- Agent SDK Docs: https://platform.claude.com/docs/en/agent-sdk/overview
- Anthropic Documentation: https://docs.anthropic.com
- Boris Cherny on X: https://x.com/anthropaboris
- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs
- MDN Web Docs: https://developer.mozilla.org

### Appendix E: Real-World Workflows — Claude + Obsidian

Claude Code works exceptionally well with markdown-based knowledge systems like Obsidian. This pattern extends beyond engineering into product management, documentation, and knowledge work.

#### The Pattern
1. **Knowledge lives in `.md` files** — PRDs, specs, meeting notes, decision logs stored in an Obsidian vault
2. **Claude Code operates on the vault** — Point Claude Code at your Obsidian folder to query, summarize, update, and cross-reference documents
3. **Bidirectional workflow** — Edit in Obsidian for thinking, delegate to Claude Code for synthesis and automation

#### Use Cases
- Summarize a week's meeting notes into action items
- Cross-reference PRDs against technical specs for consistency
- Generate status reports from scattered notes
- Draft RFC documents from rough bullet points

**Discussion:** [Community thread on Claude + Obsidian workflows](https://www.reddit.com/r/ClaudeAI/comments/1r2puy0/product_managers_using_claude_obsidian_what_does/)

### Appendix F: Maintaining Your ~/.claude Directory

The `~/.claude` directory stores session data, conversation history, memories, and configuration. Without periodic cleanup, it can grow to 1GB+ within weeks of daily use.

#### What takes up space
| Directory | Contents |
|-----------|----------|
| `projects/` | Per-project session data and memory files |
| `sessions/` | Full conversation transcripts |
| `memory/` | Auto-memory files persisted across sessions |

#### Cleanup strategies
1. **Manual cleanup:** Remove old session directories older than 30 days
   ```bash
   find ~/.claude/sessions -type d -mtime +30 -exec rm -rf {} +
   ```
2. **Check your usage:** `du -sh ~/.claude/*/  | sort -rh`
3. **Preserve what matters:** Back up your `memory/` and `CLAUDE.md` files before cleaning
4. **Automate it:** Add a cleanup cron job or shell alias for periodic maintenance

**Tip:** Session data accumulates fastest — if you run many long sessions daily, check monthly.

**Discussion:** [Community thread on ~/.claude cleanup](https://www.reddit.com/r/ClaudeAI/comments/1r2snly/cleanup_script_for_claude_mine_grew_to_13gb_in_4/)

### Appendix G: Permissions, Sandbox & Security

#### Permission Modes

| Mode | Description |
|------|-------------|
| `default` | Standard behavior — prompts for permission on first use of each tool |
| `plan` | Plan Mode — Claude can analyze but not modify files or execute commands |
| `acceptEdits` | Auto-accepts file edit permissions for the session |
| `dontAsk` | Auto-denies tools unless pre-approved via `/permissions` or `permissions.allow` rules |
| `delegate` | Coordination-only mode for agent team leads. Restricts to team management tools |
| `bypassPermissions` | Skips ALL permission prompts. Only use in isolated environments (containers/VMs) |

Set via `defaultMode` in settings, `--permission-mode` flag, or toggle with `/permissions`.

#### Permission Rule Syntax

Rules follow the format `Tool` or `Tool(specifier)`. Evaluated in order: **deny → ask → allow** (first match wins).

**Bash rules** — glob patterns with `*`:
- `Bash(npm run *)` — any npm run command
- `Bash(git commit *)` — any git commit
- `Bash(* --version)` — any version check

**Read/Edit rules** — gitignore-style paths:
- `Read(./.env)` — deny reading .env (relative to cwd)
- `Edit(/src/**/*.ts)` — relative to settings file
- `Read(~/.zshrc)` — home directory
- `Edit(//tmp/scratch.txt)` — absolute path (`//` prefix)

**MCP rules**: `mcp__server__tool` or `mcp__server__*`
**Subagent rules**: `Task(Explore)`, `Task(my-custom-agent)`

#### Sandbox

Provides OS-level enforcement restricting Bash tool filesystem and network access:
- `sandbox.enabled: true` — enable sandbox
- `sandbox.autoAllowBashIfSandboxed: true` — auto-approve Bash when sandboxed
- `sandbox.excludedCommands: ["docker"]` — commands that bypass sandbox
- `sandbox.network.allowedDomains: ["github.com", "*.npmjs.org"]` — network allowlist
- Filesystem restrictions use Read/Edit deny rules (not separate config)
- Permissions + sandbox = defense-in-depth (two complementary layers)

#### Managed Settings (Enterprise)

Deployed to system directories by IT administrators. Cannot be overridden by user/project settings.
- **macOS**: `/Library/Application Support/ClaudeCode/managed-settings.json`
- **Linux/WSL**: `/etc/claude-code/managed-settings.json`

Managed-only settings:
- `disableBypassPermissionsMode` — prevent `bypassPermissions` mode
- `allowManagedPermissionRulesOnly` — only managed permission rules apply
- `allowManagedHooksOnly` — block user/project/plugin hooks
- `strictKnownMarketplaces` — control plugin marketplace access

**Exercise:** Configure a project settings file with permission rules that allow `Bash(npm *)` and `Bash(git *)` while denying `Read(./.env*)` and `Read(./secrets/**)`. Test that Claude respects the rules.

---

### Appendix H: Environment Variables Reference

Claude Code uses 85+ environment variables. Here are the most important by category:

#### Authentication & Model
| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | API key for Claude SDK |
| `ANTHROPIC_MODEL` | Model to use (e.g., `claude-opus-4-6`) |
| `CLAUDE_CODE_EFFORT_LEVEL` | `low`, `medium`, `high` (Opus 4.6 only) |
| `CLAUDE_CODE_SUBAGENT_MODEL` | Model for subagents |
| `CLAUDE_CODE_USE_BEDROCK` | Use AWS Bedrock |
| `CLAUDE_CODE_USE_VERTEX` | Use Google Vertex AI |
| `CLAUDE_CODE_USE_FOUNDRY` | Use Microsoft Foundry |

#### Context & Token Management
| Variable | Purpose |
|----------|---------|
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | Context % at which auto-compaction triggers (default ~95) |
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | Max output tokens (default 32,000, max 64,000) |
| `MAX_THINKING_TOKENS` | Extended thinking budget (default 31,999, 0 to disable) |
| `MAX_MCP_OUTPUT_TOKENS` | Max tokens in MCP responses (default 25,000) |
| `SLASH_COMMAND_TOOL_CHAR_BUDGET` | Character budget for skill metadata in context |

#### Feature Flags
| Variable | Purpose |
|----------|---------|
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | Enable agent teams (`1`) |
| `CLAUDE_CODE_ENABLE_TASKS` | Task system (`false` to revert to TODO list) |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | Disable auto memory (`1`) |
| `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` | Disable background tasks (`1`) |
| `ENABLE_TOOL_SEARCH` | MCP tool search: `auto`, `true`, `false` |
| `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS` | Disable beta headers for LLM gateways |

#### Bash Configuration
| Variable | Purpose |
|----------|---------|
| `BASH_DEFAULT_TIMEOUT_MS` | Default bash command timeout |
| `BASH_MAX_TIMEOUT_MS` | Maximum bash timeout |
| `BASH_MAX_OUTPUT_LENGTH` | Max chars before middle-truncation |
| `CLAUDE_CODE_SHELL` | Override automatic shell detection |
| `CLAUDE_CODE_SHELL_PREFIX` | Wrap all bash commands (e.g., for logging) |

#### Networking & Proxy
| Variable | Purpose |
|----------|---------|
| `HTTP_PROXY` / `HTTPS_PROXY` | Proxy servers |
| `NO_PROXY` | Domains to bypass proxy |
| `CLAUDE_CODE_CLIENT_CERT` | mTLS client certificate path |
| `CLAUDE_CODE_CLIENT_KEY` | mTLS client key path |

#### MCP
| Variable | Purpose |
|----------|---------|
| `MCP_TIMEOUT` | MCP server startup timeout (ms) |
| `MCP_TOOL_TIMEOUT` | MCP tool execution timeout (ms) |
| `MCP_CLIENT_SECRET` | OAuth client secret for MCP servers |

#### UI & Telemetry
| Variable | Purpose |
|----------|---------|
| `DISABLE_TELEMETRY` | Opt out of Statsig telemetry |
| `DISABLE_AUTOUPDATER` | Disable auto-updates |
| `CLAUDE_CODE_HIDE_ACCOUNT_INFO` | Hide email/org from UI (for streaming) |
| `CLAUDE_CONFIG_DIR` | Custom config directory |
| `CLAUDE_CODE_TMPDIR` | Custom temp directory |

---

### Appendix I: IDE Integrations, Environments & CI/CD

Claude Code runs in multiple environments beyond the terminal:

#### VS Code Integration
- Native extension for VS Code with inline Claude Code panel
- Plugin management support for MCP servers
- OAuth users can browse and resume remote sessions from the Sessions dialog
- Set `CLAUDE_CODE_IDE_SKIP_AUTO_INSTALL=1` to skip auto-install of IDE extensions

#### JetBrains Integration
- Extension available for IntelliJ-based IDEs (WebStorm, PyCharm, etc.)
- Integrates Claude Code directly into the IDE workflow

#### Chrome Extension (`--chrome`)
- Enables browser automation and web testing
- Claude can interact with web pages, take screenshots, fill forms
- Enable with `--chrome` flag, disable with `--no-chrome`

#### Desktop App (Cowork)
- Claude Code's capabilities in the Claude desktop app
- Give Claude access to a folder, set a task, and let it work
- Download at [claude.com/download](https://claude.com/download)

#### Claude Code on the Web
- Browser-based Claude Code at [claude.ai/code](https://claude.ai/code)
- `--remote "task"` creates a web session from CLI
- `--teleport` resumes a web session in your local terminal

#### Slack Integration
- Claude Code available as a Slack bot for team workflows
- Enables code assistance directly in Slack conversations

#### GitHub Actions CI/CD
- Use Claude Code in GitHub Actions workflows for automated code review, PR creation, and issue resolution
- Key flags for CI: `-p` (print mode), `--permission-mode acceptEdits`, `--allowedTools`, `--max-turns`, `--max-budget-usd`
- Authentication via `ANTHROPIC_API_KEY` secret or cloud provider credentials (Bedrock/Vertex)

#### GitLab CI/CD
- Native integration with GitLab pipelines
- Trigger with `@claude` mentions in issues and MRs
- Supports Claude API, AWS Bedrock (OIDC), and Google Vertex AI (WIF)
- Claude can create MRs, fix bugs, implement features, and respond to review comments
- Example `.gitlab-ci.yml` configuration available in official docs

**Exercise:** Set up Claude Code in at least two environments (terminal + VS Code or Chrome). Try `--remote` to create a web session, then `--teleport` to resume it locally.

---

*Curriculum Version: 2.1 — February 2026*
*Model: Claude Opus 4.6*
*Last Updated: 2026-02-12*


### Prompt Reuse: Building Efficient Workflows

As you start using Claude Code regularly, you'll notice yourself typing similar prompts repeatedly. This is a common friction point.

- **Recognize repetition:** Track which prompts you reuse across sessions (debugging, refactoring, explaining code)
- **Community example:** [Prompttu](https://www.reddit.com/r/ClaudeAI/comments/1r3br8i/) — a desktop app built entirely with Claude Code to manage reusable prompts
- **Built-in solution:** Claude Code's custom slash commands (covered in Week 9) solve this natively
- **Takeaway:** Identifying workflow friction early helps you build better habits as you progress through the curriculum


### Claude Code CLI Authentication Commands (v2.1.41)

Claude Code now includes dedicated auth subcommands for managing your session directly from the terminal:

- `claude auth login` — Authenticate with your Anthropic account
- `claude auth status` — Check your current authentication state
- `claude auth logout` — End your session

These replace the need to manage authentication through the web interface and are especially useful when working across multiple machines or switching accounts.


### Autonomous Cowork Workflow: Self-Revising Agents

An emerging community pattern uses Claude's **Cowork** mode for fully autonomous project execution:

1. Have Claude write its own autonomous instructions
2. Execute those instructions with zero human input
3. Steelman and revise the output iteratively
4. Achieve complex, clean-running projects in a single shot

- **Key insight:** Letting the agent define its own execution plan (then critique and refine it) produces higher-quality results than hand-writing every instruction
- **When to use:** Complex multi-file projects where the overall architecture matters more than individual line-level decisions
- **Reference:** [Community discussion](https://www.reddit.com/r/ClaudeAI/comments/1r3d1vk/)

This pattern complements the agent orchestration and parallel session techniques covered earlier in this week.
