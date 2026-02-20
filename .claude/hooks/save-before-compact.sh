#!/usr/bin/env bash
# Hook: PreCompact
# Purpose: Before context compaction, save a snapshot of what was being worked on
# so session-context.sh can restore it. This prevents losing track of
# in-progress work when the context window fills up.

set -euo pipefail

INPUT=$(cat)
TRANSCRIPT=$(echo "$INPUT" | jq -r '.transcript_path // ""')

# Save current git status as breadcrumb for post-compact resume
SNAPSHOT_FILE="$CLAUDE_PROJECT_DIR/.claude/.compact-snapshot"

{
  echo "=== Pre-Compact Snapshot ($(date)) ==="
  echo ""
  echo "## Modified files:"
  cd "$CLAUDE_PROJECT_DIR" && git diff --name-only 2>/dev/null || echo "(not a git repo)"
  echo ""
  echo "## Staged files:"
  cd "$CLAUDE_PROJECT_DIR" && git diff --cached --name-only 2>/dev/null || echo "(none)"
  echo ""
  echo "## Recent commits:"
  cd "$CLAUDE_PROJECT_DIR" && git log --oneline -5 2>/dev/null || echo "(none)"
} > "$SNAPSHOT_FILE" 2>/dev/null || true

echo "Pre-compact snapshot saved to .claude/.compact-snapshot"
exit 0
