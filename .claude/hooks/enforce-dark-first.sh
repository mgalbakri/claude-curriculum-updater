#!/usr/bin/env bash
# Hook: PostToolUse (Edit|Write)
# Purpose: Verify tsx files use dark: variants when using light mode colors.
# Catches components missing dark mode support.

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')

# Only check tsx files in site/
if [[ ! "$FILE_PATH" =~ site/.*\.tsx$ ]]; then
  exit 0
fi

# Check for bg-white or bg-slate-50 without corresponding dark: variant on the same element
# This is a heuristic — we look for className strings with light colors but no dark: prefix
HAS_LIGHT_BG=$(grep -c 'bg-white\|bg-slate-50\|bg-slate-100' "$FILE_PATH" 2>/dev/null || true)
HAS_DARK_BG=$(grep -c 'dark:bg-' "$FILE_PATH" 2>/dev/null || true)

if [[ "$HAS_LIGHT_BG" -gt 0 ]] && [[ "$HAS_DARK_BG" -eq 0 ]]; then
  cat <<EOF
WARNING: File "$FILE_PATH" has light background classes (bg-white, bg-slate-50, etc.)
but no dark: variants found anywhere in the file.

This project is dark-first (defaultTheme="dark"). Every light-mode color
needs a dark: counterpart. Example:
  bg-white dark:bg-slate-900
  bg-slate-50 dark:bg-slate-950
  text-slate-900 dark:text-white

Please add dark mode variants.
EOF
  exit 0
fi

exit 0
