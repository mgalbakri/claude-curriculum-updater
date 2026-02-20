#!/usr/bin/env bash
# Hook: PreToolUse (Bash)
# Purpose: Block destructive shell commands that could damage the project

set -euo pipefail

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')

# Dangerous patterns to block
DANGEROUS_PATTERNS=(
  "rm -rf /"
  "rm -rf \."
  "rm -rf \*"
  "git push.*--force.*main"
  "git push.*--force.*master"
  "git reset --hard"
  "git clean -fd"
  "drop database"
  "DROP TABLE"
  "truncate table"
  "vercel env rm"
  "npx vercel remove"
  "> /dev/sd"
  "mkfs\."
  ":(){ :|:& };:"
  "chmod -R 777"
  "curl.*| bash"
  "wget.*| bash"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qiE "$pattern"; then
    echo "BLOCKED: Dangerous command detected matching pattern '$pattern'" >&2
    echo "Command was: $COMMAND" >&2
    exit 2
  fi
done

exit 0
