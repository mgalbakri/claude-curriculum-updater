#!/usr/bin/env bash
# Hook: PostToolUse (Edit|Write) — Advisory
# Purpose: Detect raw <img> tags (should use next/image) and large inline assets.

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // ""')

# Only check .tsx files inside site/
if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

case "$FILE_PATH" in
  */site/*.tsx) ;;
  *) exit 0 ;;
esac

if [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

WARNINGS=""

# Check for raw <img> tags (should use next/image <Image> component)
RAW_IMGS=$(grep -n '<img\b' "$FILE_PATH" 2>/dev/null || true)
if [[ -n "$RAW_IMGS" ]]; then
  COUNT=$(echo "$RAW_IMGS" | wc -l | tr -d ' ')
  WARNINGS="${WARNINGS}Found ${COUNT} raw <img> tag(s) — consider using next/image <Image> for optimization:\n"
  while IFS= read -r line; do
    LINENUM=$(echo "$line" | cut -d: -f1)
    WARNINGS="${WARNINGS}  Line ${LINENUM}\n"
  done <<< "$RAW_IMGS"
fi

# Check for large inline base64 images (> ~10KB encoded = ~13600 chars)
B64_IMGS=$(grep -n 'data:image/[^;]*;base64,' "$FILE_PATH" 2>/dev/null || true)
if [[ -n "$B64_IMGS" ]]; then
  while IFS= read -r line; do
    LEN=${#line}
    if [[ "$LEN" -gt 13600 ]]; then
      LINENUM=$(echo "$line" | cut -d: -f1)
      SIZE_KB=$((LEN / 1365))  # base64 is ~1.37x original
      WARNINGS="${WARNINGS}Line ${LINENUM}: Large inline base64 image (~${SIZE_KB}KB). Move to public/ and use next/image.\n"
    fi
  done <<< "$B64_IMGS"
fi

if [[ -n "$WARNINGS" ]]; then
  echo "WARNING: Asset optimization issues in $(basename "$FILE_PATH"):" >&2
  printf "$WARNINGS" >&2
fi

exit 0
