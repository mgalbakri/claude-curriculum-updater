#!/usr/bin/env bash
# Hook: Notification
# Purpose: Send macOS native notification when Claude needs attention

set -euo pipefail

INPUT=$(cat)
MESSAGE=$(echo "$INPUT" | jq -r '.message // "Claude Code needs your attention"')

# macOS notification
if command -v osascript &>/dev/null; then
  osascript -e "display notification \"$MESSAGE\" with title \"Agent Code Academy\" sound name \"Ping\"" 2>/dev/null || true
fi

exit 0
