#!/usr/bin/env bash
# Hook: PreToolUse (Edit)
# Purpose: Prevent hallucination by verifying:
# 1. The file actually exists before editing
# 2. The old_string actually exists in the file before replacing

set -euo pipefail

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // ""')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')
OLD_STRING=$(echo "$INPUT" | jq -r '.tool_input.old_string // ""')

# Skip if no file path
if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Check 1: Does the file exist?
if [[ ! -f "$FILE_PATH" ]]; then
  echo "BLOCKED: File does not exist: $FILE_PATH" >&2
  echo "Claude may be hallucinating this file path. Read or Glob first to confirm it exists." >&2
  exit 2
fi

# Check 2: For Edit tool, does old_string exist in the file?
if [[ "$TOOL_NAME" == "Edit" ]] && [[ -n "$OLD_STRING" ]]; then
  if ! grep -qF "$OLD_STRING" "$FILE_PATH" 2>/dev/null; then
    echo "BLOCKED: old_string not found in $FILE_PATH" >&2
    echo "The text Claude is trying to replace doesn't exist in this file." >&2
    echo "Claude may be working from stale/hallucinated content. Read the file first." >&2
    exit 2
  fi
fi

exit 0
