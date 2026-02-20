#!/usr/bin/env bash
# Hook: PreToolUse (Bash)
# Purpose: When a git commit command is detected, verify commit message quality
# and ensure no sensitive files are being committed.

set -euo pipefail

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')

# Only check git commit commands
if ! echo "$COMMAND" | grep -qE 'git commit'; then
  exit 0
fi

# Block committing .env files
if echo "$COMMAND" | grep -qE '\.env'; then
  echo "BLOCKED: Cannot commit .env files — they contain secrets." >&2
  exit 2
fi

# Check staged files for sensitive patterns
STAGED=$(cd "$CLAUDE_PROJECT_DIR" 2>/dev/null && git diff --cached --name-only 2>/dev/null || true)

if echo "$STAGED" | grep -qE '\.env|credentials|secrets|\.key$|\.pem$'; then
  echo "BLOCKED: Staged files contain potentially sensitive files:" >&2
  echo "$STAGED" | grep -E '\.env|credentials|secrets|\.key$|\.pem$' >&2
  echo "Remove them from staging before committing." >&2
  exit 2
fi

exit 0
