#!/usr/bin/env bash
# Hook: PreToolUse (Bash) — Advisory
# Purpose: Monitor JS bundle size changes. Warn if bundle grew >15% since baseline.

set -euo pipefail

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')

# Only check git push commands
if ! echo "$COMMAND" | grep -qE 'git push'; then
  exit 0
fi

SITE_DIR="$CLAUDE_PROJECT_DIR/site"
STATIC_DIR="$SITE_DIR/.next/static"
BASELINE_FILE="$CLAUDE_PROJECT_DIR/.claude/.bundle-baseline"

# Check if build output exists
if [[ ! -d "$STATIC_DIR" ]]; then
  exit 0
fi

# Calculate current total JS size
CURRENT_SIZE=$(find "$STATIC_DIR" -name '*.js' -exec wc -c {} + 2>/dev/null | tail -1 | awk '{print $1}')

if [[ -z "$CURRENT_SIZE" ]] || [[ "$CURRENT_SIZE" == "0" ]]; then
  exit 0
fi

CURRENT_KB=$((CURRENT_SIZE / 1024))

# If no baseline exists, create one and exit
if [[ ! -f "$BASELINE_FILE" ]]; then
  echo "$CURRENT_SIZE" > "$BASELINE_FILE"
  echo "Bundle size baseline set: ${CURRENT_KB}KB" >&2
  exit 0
fi

# Compare against baseline
BASELINE_SIZE=$(cat "$BASELINE_FILE" 2>/dev/null || echo "0")

if [[ "$BASELINE_SIZE" == "0" ]]; then
  echo "$CURRENT_SIZE" > "$BASELINE_FILE"
  exit 0
fi

# Calculate percentage change
if [[ "$BASELINE_SIZE" -gt 0 ]]; then
  CHANGE=$(( (CURRENT_SIZE - BASELINE_SIZE) * 100 / BASELINE_SIZE ))
  BASELINE_KB=$((BASELINE_SIZE / 1024))

  if [[ "$CHANGE" -gt 15 ]]; then
    echo "WARNING: Bundle size increased by ${CHANGE}% (${BASELINE_KB}KB → ${CURRENT_KB}KB)." >&2
    echo "Consider reviewing recent changes for unnecessary imports or large dependencies." >&2
    echo "To reset baseline: echo ${CURRENT_SIZE} > $BASELINE_FILE" >&2
  elif [[ "$CHANGE" -lt -10 ]]; then
    echo "Bundle size decreased by ${CHANGE#-}% (${BASELINE_KB}KB → ${CURRENT_KB}KB). Nice!" >&2
    # Update baseline on significant decrease
    echo "$CURRENT_SIZE" > "$BASELINE_FILE"
  fi
fi

exit 0
