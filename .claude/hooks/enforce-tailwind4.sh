#!/usr/bin/env bash
# Hook: PostToolUse (Edit|Write)
# Purpose: Detect Tailwind CSS 3 patterns that don't work in Tailwind CSS 4:
# - @apply in CSS (deprecated pattern)
# - tailwind.config.js references (TW4 uses @theme inline)
# - Old plugin syntax

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')

# Only check site files
if [[ ! "$FILE_PATH" =~ site/ ]]; then
  exit 0
fi

ISSUES=""

# Check for tailwind.config references in JS/TS files
if [[ "$FILE_PATH" =~ \.(tsx?|jsx?|mjs)$ ]]; then
  if grep -qE "tailwind\.config" "$FILE_PATH" 2>/dev/null; then
    ISSUES+="- Reference to tailwind.config found. This project uses Tailwind CSS 4 with @theme inline in globals.css.\n"
  fi
fi

# Check for @apply in CSS files (discouraged in TW4)
if [[ "$FILE_PATH" =~ \.css$ ]]; then
  if grep -qE '@apply' "$FILE_PATH" 2>/dev/null; then
    ISSUES+="- @apply directive found. Tailwind CSS 4 discourages @apply — use utility classes directly in JSX instead.\n"
  fi
fi

# Check for old dark mode config pattern
if [[ "$FILE_PATH" =~ \.(tsx?|css)$ ]]; then
  if grep -qE "darkMode.*media\|darkMode.*class" "$FILE_PATH" 2>/dev/null; then
    ISSUES+="- Old darkMode config pattern found. TW4 uses '@custom-variant dark' in CSS, not JS config.\n"
  fi
fi

if [[ -n "$ISSUES" ]]; then
  echo "Tailwind CSS 4 compatibility issues in $FILE_PATH:"
  echo -e "$ISSUES"
  echo "This project uses Tailwind CSS 4 with @theme inline and @custom-variant dark."
fi

exit 0
