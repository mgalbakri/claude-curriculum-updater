#!/usr/bin/env bash
# Hook: PostToolUse (Edit|Write) — Advisory
# Purpose: Check markdown content quality — double spaces, unclosed fences, broken links, repeated words.

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // ""')

# Only check .md files
case "$FILE_PATH" in
  *.md) ;;
  *) exit 0 ;;
esac

if [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

WARNINGS=""
BASENAME=$(basename "$FILE_PATH")

# 1. Check for unclosed code fences (odd number of ```)
FENCE_COUNT=$(grep -c '^```' "$FILE_PATH" 2>/dev/null || echo "0")
if [[ $((FENCE_COUNT % 2)) -ne 0 ]]; then
  WARNINGS="${WARNINGS}  - Unclosed code fence: ${FENCE_COUNT} fence markers (odd count)\n"
fi

# 2. Check for broken markdown links: [text]( with no closing )
BROKEN=$(grep -nE '\[[^\]]*\]\([^)]*$' "$FILE_PATH" 2>/dev/null || true)
if [[ -n "$BROKEN" ]]; then
  COUNT=$(echo "$BROKEN" | wc -l | tr -d ' ')
  WARNINGS="${WARNINGS}  - ${COUNT} possibly broken markdown link(s) (unclosed parenthesis)\n"
fi

# 3. Check for repeated words (case-insensitive, common ones)
REPEATED=$(grep -inE '\b(the|is|a|an|to|in|of|and|for|it|on|that|this|with|are|was|be|have|has|at|or|but|not|you|all|can|will|do|if|we|so|no|up) \1\b' "$FILE_PATH" 2>/dev/null | head -5 || true)
if [[ -n "$REPEATED" ]]; then
  COUNT=$(echo "$REPEATED" | wc -l | tr -d ' ')
  WARNINGS="${WARNINGS}  - ${COUNT} repeated word(s) detected (e.g., 'the the')\n"
fi

# 4. Check for double spaces (outside code blocks) — just count, don't report lines
DOUBLE_SPACES=$(grep -c '  ' "$FILE_PATH" 2>/dev/null || echo "0")
# Subtract lines that are in code blocks or indentation (rough heuristic: lines starting with spaces)
if [[ "$DOUBLE_SPACES" -gt 20 ]]; then
  WARNINGS="${WARNINGS}  - Many double spaces detected (${DOUBLE_SPACES} lines) — may be intentional formatting\n"
fi

if [[ -n "$WARNINGS" ]]; then
  echo "WARNING: Content quality issues in ${BASENAME}:" >&2
  printf "$WARNINGS" >&2
fi

exit 0
