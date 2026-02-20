#!/usr/bin/env bash
# Hook: PostToolUse (Edit|Write) — Advisory
# Purpose: Detect potentially unused component exports.

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // ""')

# Only check component files in site/components/
case "$FILE_PATH" in
  */site/components/*.tsx) ;;
  *) exit 0 ;;
esac

if [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

SITE_DIR="$CLAUDE_PROJECT_DIR/site"
BASENAME=$(basename "$FILE_PATH" .tsx)

# Extract exported function/const names
EXPORTS=$(grep -oE 'export (function|const|class) ([A-Z][a-zA-Z0-9]*)' "$FILE_PATH" 2>/dev/null | awk '{print $NF}' || true)

if [[ -z "$EXPORTS" ]]; then
  exit 0
fi

WARNINGS=""

while IFS= read -r EXPORT_NAME; do
  [[ -z "$EXPORT_NAME" ]] && continue

  # Search for imports of this component in the entire site directory
  # Exclude the component file itself
  IMPORT_COUNT=$(grep -rl "$EXPORT_NAME" "$SITE_DIR" --include='*.tsx' --include='*.ts' 2>/dev/null | grep -v "$FILE_PATH" | wc -l | tr -d ' ')

  if [[ "$IMPORT_COUNT" -eq 0 ]]; then
    WARNINGS="${WARNINGS}  - '${EXPORT_NAME}' from ${BASENAME}.tsx appears unused (0 imports found)\n"
  fi
done <<< "$EXPORTS"

if [[ -n "$WARNINGS" ]]; then
  echo "WARNING: Potentially unused exports:" >&2
  printf "$WARNINGS" >&2
  echo "Verify these components are still needed, or remove to reduce bundle size." >&2
fi

exit 0
