#!/usr/bin/env bash
# Hook: PostToolUse (Write) — Advisory
# Purpose: Run npm audit when package.json is modified. Warn on high/critical vulnerabilities.

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // ""')

# Only trigger on package.json writes
case "$FILE_PATH" in
  */site/package.json) ;;
  *) exit 0 ;;
esac

SITE_DIR="$CLAUDE_PROJECT_DIR/site"

# Check if package-lock.json exists (npm audit requires it)
if [[ ! -f "$SITE_DIR/package-lock.json" ]]; then
  exit 0
fi

# Run npm audit and parse results
AUDIT_OUTPUT=$(cd "$SITE_DIR" && npm audit --json 2>/dev/null || true)

if [[ -z "$AUDIT_OUTPUT" ]]; then
  exit 0
fi

# Extract vulnerability counts
HIGH=$(echo "$AUDIT_OUTPUT" | jq -r '.metadata.vulnerabilities.high // 0' 2>/dev/null || echo "0")
CRITICAL=$(echo "$AUDIT_OUTPUT" | jq -r '.metadata.vulnerabilities.critical // 0' 2>/dev/null || echo "0")

TOTAL=$((HIGH + CRITICAL))

if [[ "$TOTAL" -gt 0 ]]; then
  echo "WARNING: npm audit found ${TOTAL} high/critical vulnerabilities (${HIGH} high, ${CRITICAL} critical)." >&2
  echo "Run 'cd site && npm audit' for details, or 'npm audit fix' to auto-fix." >&2
fi

exit 0
