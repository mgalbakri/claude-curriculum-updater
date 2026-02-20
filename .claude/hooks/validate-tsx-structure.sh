#!/usr/bin/env bash
# Hook: PostToolUse (Write)
# Purpose: After writing a new TSX file, check for common structural issues:
# - Missing "use client" directive for client components
# - Missing default export for page files

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')

# Only check tsx files in site/
if [[ ! "$FILE_PATH" =~ site/.*\.tsx$ ]]; then
  exit 0
fi

ISSUES=""

# Check if file uses client-side hooks without "use client"
if grep -qE 'use(State|Effect|Ref|Context|Callback|Memo|Reducer)\b' "$FILE_PATH" 2>/dev/null; then
  if ! head -3 "$FILE_PATH" | grep -q '"use client"'; then
    ISSUES+="- Uses React hooks but missing \"use client\" directive at top of file.\n"
  fi
fi

# Check if page.tsx files have default export
if [[ "$FILE_PATH" =~ /page\.tsx$ ]]; then
  if ! grep -qE 'export default' "$FILE_PATH" 2>/dev/null; then
    ISSUES+="- Page file missing 'export default' — Next.js requires it for route pages.\n"
  fi
fi

# Check if component files export something
if [[ "$FILE_PATH" =~ site/components/ ]]; then
  if ! grep -qE 'export (function|const|default)' "$FILE_PATH" 2>/dev/null; then
    ISSUES+="- Component file has no exports. Did you forget to export the component?\n"
  fi
fi

if [[ -n "$ISSUES" ]]; then
  echo "Structural issues in $FILE_PATH:"
  echo -e "$ISSUES"
  echo "Please fix before proceeding."
fi

exit 0
