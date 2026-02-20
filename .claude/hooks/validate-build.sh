#!/usr/bin/env bash
# Hook: PostToolUse (Edit|Write)
# Purpose: After editing site files, remind about build validation.
# Non-blocking — just adds context for Claude.

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')

# Only care about site source files
if [[ ! "$FILE_PATH" =~ site/(app|components|lib)/ ]]; then
  exit 0
fi

# Check if this is a tsx/ts/css file
if [[ ! "$FILE_PATH" =~ \.(tsx?|css)$ ]]; then
  exit 0
fi

echo "Reminder: A site source file was modified. Run 'npm run build' in site/ before committing to catch TypeScript and build errors early."
exit 0
