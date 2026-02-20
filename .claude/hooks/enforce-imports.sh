#!/usr/bin/env bash
# Hook: PostToolUse (Edit|Write)
# Purpose: Detect bad import patterns in site code:
# - No relative imports from components (should use @/ alias)
# - No importing from node_modules directly for Supabase (use lib/supabase-client)

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')

# Only check site tsx/ts files
if [[ ! "$FILE_PATH" =~ site/.*\.(tsx?|js)$ ]]; then
  exit 0
fi

ISSUES=""

# Check for direct Supabase client imports (should use lib/supabase-client)
if grep -qE "from ['\"]@supabase/supabase-js['\"]" "$FILE_PATH" 2>/dev/null; then
  if [[ ! "$FILE_PATH" =~ supabase-client ]]; then
    ISSUES+="- Direct @supabase/supabase-js import found. Use '@/lib/supabase-client' instead.\n"
  fi
fi

# Check for deep relative imports (../../../)
if grep -qE "from ['\"]\.\.\/\.\.\/\.\.\/" "$FILE_PATH" 2>/dev/null; then
  ISSUES+="- Deep relative imports found (../../..). Use @/ path alias instead.\n"
fi

if [[ -n "$ISSUES" ]]; then
  echo "Import issues in $FILE_PATH:"
  echo -e "$ISSUES"
  echo "Please fix these import patterns."
fi

exit 0
