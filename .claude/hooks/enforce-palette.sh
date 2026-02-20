#!/usr/bin/env bash
# Hook: PostToolUse (Edit|Write)
# Purpose: Detect if new code introduces gray-* classes (should be slate-*)
# in tsx/css files. Non-blocking — warns Claude to fix.

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')

# Only check tsx and css files
if [[ ! "$FILE_PATH" =~ \.(tsx|css)$ ]]; then
  exit 0
fi

# Only check site/ directory
if [[ ! "$FILE_PATH" =~ site/ ]]; then
  exit 0
fi

# Check for gray-* usage (the old palette we replaced with slate-*)
if grep -qE '\bgray-[0-9]' "$FILE_PATH" 2>/dev/null; then
  VIOLATIONS=$(grep -nE '\bgray-[0-9]' "$FILE_PATH" | head -5)
  cat <<EOF
WARNING: File "$FILE_PATH" contains gray-* Tailwind classes.
This project uses slate-* palette (not gray-*).

Violations found:
$VIOLATIONS

Please replace all gray-* with slate-* equivalents.
EOF
  exit 0
fi

exit 0
