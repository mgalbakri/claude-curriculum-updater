#!/usr/bin/env bash
# Hook: PreToolUse (Bash)
# Purpose: When git push is detected, remind to run tests first.

set -euo pipefail

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')

# Only check git push commands
if ! echo "$COMMAND" | grep -qE 'git push'; then
  exit 0
fi

# Check if build was run recently (within last 10 minutes)
SITE_DIR="$CLAUDE_PROJECT_DIR/site"
BUILD_DIR="$SITE_DIR/.next"

if [[ -d "$BUILD_DIR" ]]; then
  # Check if .next directory was modified in the last 10 minutes
  if [[ "$(uname)" == "Darwin" ]]; then
    MODIFIED=$(find "$BUILD_DIR" -maxdepth 1 -name "BUILD_ID" -mmin -10 2>/dev/null | head -1)
  else
    MODIFIED=$(find "$BUILD_DIR" -maxdepth 1 -name "BUILD_ID" -mmin -10 2>/dev/null | head -1)
  fi

  if [[ -z "$MODIFIED" ]]; then
    echo "WARNING: Build output is stale (>10 min old). Consider running 'npm run build' in site/ before pushing."
  fi
else
  echo "WARNING: No build output found at $BUILD_DIR. Run 'cd site && npm run build' before pushing."
fi

exit 0
