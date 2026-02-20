#!/usr/bin/env bash
# Hook: PostToolUse (Edit|Write)
# Purpose: Check for basic accessibility issues in TSX files:
# - Images without alt text
# - Buttons/links without aria-labels or visible text
# - Form inputs without labels

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')

# Only check tsx files in site/
if [[ ! "$FILE_PATH" =~ site/.*\.tsx$ ]]; then
  exit 0
fi

ISSUES=""

# Check for img tags without alt
if grep -qE '<img[^>]*>' "$FILE_PATH" 2>/dev/null; then
  if grep -E '<img[^>]*>' "$FILE_PATH" | grep -qvE 'alt=' 2>/dev/null; then
    ISSUES+="- Found <img> without alt attribute. Add alt text for accessibility.\n"
  fi
fi

# Check for buttons with only icons (no aria-label or text content)
if grep -qE '<button[^>]*>' "$FILE_PATH" 2>/dev/null; then
  # Look for icon-only buttons (contain svg but no text)
  if grep -E '<button[^>]*>' "$FILE_PATH" | grep -qvE 'aria-label' 2>/dev/null; then
    # This is a heuristic — only warn, don't block
    ISSUES+="- Found <button> without aria-label. If it's icon-only, add aria-label for screen readers.\n"
  fi
fi

# Check for inputs without associated labels or aria-label
if grep -qE '<input[^>]*>' "$FILE_PATH" 2>/dev/null; then
  if grep -E '<input[^>]*>' "$FILE_PATH" | grep -qvE 'aria-label\|placeholder' 2>/dev/null; then
    ISSUES+="- Found <input> without aria-label or placeholder. Add accessibility attributes.\n"
  fi
fi

if [[ -n "$ISSUES" ]]; then
  echo "Accessibility review for $FILE_PATH:"
  echo -e "$ISSUES"
fi

exit 0
