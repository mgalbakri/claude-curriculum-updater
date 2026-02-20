#!/usr/bin/env bash
# Hook: PostToolUse (Edit|Write) — Advisory
# Purpose: Validate curriculum.md structure — 12 weeks, 3 phases, sequential numbering.

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // ""')

# Only trigger on curriculum.md
case "$FILE_PATH" in
  */curriculum.md) ;;
  *) exit 0 ;;
esac

if [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

WARNINGS=""

# Count week headings (### WEEK N: ...)
WEEK_COUNT=$(grep -cE '^### WEEK [0-9]+' "$FILE_PATH" || true)
WEEK_COUNT=$(echo "$WEEK_COUNT" | tr -d '[:space:]')
if [[ "$WEEK_COUNT" -ne 12 ]]; then
  WARNINGS="${WARNINGS}  - Expected 12 week headings (### WEEK N), found ${WEEK_COUNT}\n"
fi

# Count phase headings (## Phase I/II/III: ...)
PHASE_COUNT=$(grep -cE '^## Phase ' "$FILE_PATH" || true)
PHASE_COUNT=$(echo "$PHASE_COUNT" | tr -d '[:space:]')
if [[ "$PHASE_COUNT" -ne 3 ]]; then
  WARNINGS="${WARNINGS}  - Expected 3 phase headings (## Phase), found ${PHASE_COUNT}\n"
fi

# Check week numbers are sequential 1-12
WEEK_NUMS=$(grep -oE '^### WEEK ([0-9]+)' "$FILE_PATH" | grep -oE '[0-9]+' | sort -n || true)
EXPECTED_NUMS=$(seq 1 12)
if [[ "$WEEK_NUMS" != "$EXPECTED_NUMS" ]]; then
  MISSING=$(comm -23 <(echo "$EXPECTED_NUMS") <(echo "$WEEK_NUMS") 2>/dev/null || true)
  if [[ -n "$MISSING" ]]; then
    WARNINGS="${WARNINGS}  - Missing week numbers: $(echo $MISSING | tr '\n' ', ' | sed 's/,$//')\n"
  fi
fi

# Count appendix headings (### Appendix A: ...)
APPENDIX_COUNT=$(grep -cE '^###? Appendix [A-Z]' "$FILE_PATH" || true)
APPENDIX_COUNT=$(echo "$APPENDIX_COUNT" | tr -d '[:space:]')
if [[ "$APPENDIX_COUNT" -eq 0 ]]; then
  WARNINGS="${WARNINGS}  - No appendix headings found\n"
fi

if [[ -n "$WARNINGS" ]]; then
  echo "WARNING: Curriculum structure issues in curriculum.md:" >&2
  printf "$WARNINGS" >&2
  echo "The Next.js parser expects exactly 12 weeks in 3 phases with appendices." >&2
fi

exit 0
