#!/usr/bin/env bash
# Hook: PostToolUse (Edit|Write) — Advisory
# Purpose: Validate internal links in .tsx and .md files against known routes.

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // ""')

# Only check .tsx and .md files inside site/
if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

case "$FILE_PATH" in
  */site/*.tsx|*/site/*.md) ;;
  *) exit 0 ;;
esac

if [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# Extract internal links
# Matches: href="/...", Link href="/...", [text](/...)
LINKS=$(grep -oE '(href|to)="(/[^"]*)"' "$FILE_PATH" 2>/dev/null | grep -oE '/[^"]*' || true)
MD_LINKS=$(grep -oE '\]\(/[^)]*\)' "$FILE_PATH" 2>/dev/null | grep -oE '/[^)]*' || true)

ALL_LINKS=$(printf '%s\n%s' "$LINKS" "$MD_LINKS" | sort -u | grep -v '^$' || true)

if [[ -z "$ALL_LINKS" ]]; then
  exit 0
fi

WARNINGS=""
while IFS= read -r link; do
  # Skip anchors, external links, API routes, and asset paths
  case "$link" in
    \#*|http://*|https://*|/api/*|/ai-coding-cheat-sheet*|/_next/*) continue ;;
  esac

  # Strip anchor fragments for validation
  CLEAN_LINK=$(echo "$link" | sed 's/#.*//')

  # Validate against known routes
  VALID=false
  case "$CLEAN_LINK" in
    /) VALID=true ;;
    /pricing|/profile|/certificate|/payment/success) VALID=true ;;
    /week/[0-9]|/week/1[0-2]) VALID=true ;;
    /appendix/[a-j]) VALID=true ;;
    "") VALID=true ;; # Just an anchor
  esac

  if [[ "$VALID" == "false" ]]; then
    WARNINGS="${WARNINGS}  - ${link}\n"
  fi
done <<< "$ALL_LINKS"

if [[ -n "$WARNINGS" ]]; then
  echo "WARNING: Possible broken internal links in $(basename "$FILE_PATH"):" >&2
  printf "$WARNINGS" >&2
  echo "Valid routes: /, /pricing, /profile, /certificate, /week/1-12, /appendix/a-j" >&2
fi

exit 0
