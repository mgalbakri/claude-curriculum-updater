#!/usr/bin/env bash
# Hook: PostToolUse (Edit|Write) — Advisory
# Purpose: After many component edits, remind to run Lighthouse audit.

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // ""')

# Only track site component and page files
case "$FILE_PATH" in
  */site/components/*.tsx|*/site/app/*.tsx|*/site/app/**/*.tsx) ;;
  *) exit 0 ;;
esac

# Use a temp file to track edit count for this session
# PID-based so it resets when Claude restarts
COUNTER_FILE="/tmp/claude-perf-edits-${PPID:-0}"

# Read current count
COUNT=0
if [[ -f "$COUNTER_FILE" ]]; then
  COUNT=$(cat "$COUNTER_FILE" 2>/dev/null || echo "0")
fi

# Increment
COUNT=$((COUNT + 1))
echo "$COUNT" > "$COUNTER_FILE"

# Warn after 5+ component edits
if [[ "$COUNT" -eq 5 ]]; then
  echo "TIP: You've edited ${COUNT} component/page files this session. Consider running a Lighthouse audit to check for performance regressions." >&2
elif [[ "$COUNT" -eq 10 ]]; then
  echo "TIP: ${COUNT} component/page files edited. Strongly recommend running Lighthouse or 'npm run build' to verify performance." >&2
fi

exit 0
