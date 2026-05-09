#!/usr/bin/env bash
# Ralph Loop Executor
#
# Usage:
#   ./ralph.sh --kanban <path> --project <path> --mode <1|2|3> --item <name> [--max <n>]
#
# Modes:
#   1 = Implement a backlog item directly
#   2 = Create user stories from a backlog item
#   3 = Build from a specific user story

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROMPTS_DIR="$SCRIPT_DIR/prompts"
LOGS_DIR="$SCRIPT_DIR/logs"

# ── Defaults ──────────────────────────────────────────────────────────────────
KANBAN_PATH=""
PROJECT_PATH=""
MODE=""
ITEM_NAME=""
MAX_ITERATIONS=20
OUTPUT_LOG=""

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

# ── Helpers ───────────────────────────────────────────────────────────────────
usage() {
  echo ""
  echo -e "${BOLD}Ralph Loop Executor${NC}"
  echo ""
  echo "Usage:"
  echo "  ./ralph.sh --kanban <path> --project <path> --mode <1|2|3> --item <name> [--max <n>]"
  echo ""
  echo "Modes:"
  echo "  1  Implement a backlog item"
  echo "  2  Create user stories from a backlog item"
  echo "  3  Build from a specific user story"
  echo ""
  echo "Examples:"
  echo "  ./ralph.sh --kanban ~/project/kanban.md --project ~/project --mode 2 --item \"User Authentication\""
  echo "  ./ralph.sh --kanban ~/project/kanban.md --project ~/project --mode 3 --item \"US-001\" --max 30"
  echo ""
  exit 1
}

die() { echo -e "${RED}Error: $1${NC}" >&2; exit 1; }

# ── Arg parsing ───────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case $1 in
    --kanban)  KANBAN_PATH="$(realpath "$2")"; shift 2 ;;
    --project) PROJECT_PATH="$(realpath "$2")"; shift 2 ;;
    --mode)    MODE="$2"; shift 2 ;;
    --item)    ITEM_NAME="$2"; shift 2 ;;
    --max)     MAX_ITERATIONS="$2"; shift 2 ;;
    --help|-h) usage ;;
    *) die "Unknown argument: $1. Run with --help for usage." ;;
  esac
done

# ── Validation ────────────────────────────────────────────────────────────────
[[ -z "$KANBAN_PATH" ]]  && die "--kanban is required"
[[ -z "$PROJECT_PATH" ]] && die "--project is required"
[[ -z "$MODE" ]]         && die "--mode is required (1, 2, or 3)"
[[ -z "$ITEM_NAME" ]]    && die "--item is required"

[[ ! -f "$KANBAN_PATH" ]]  && die "kanban file not found: $KANBAN_PATH"
[[ ! -d "$PROJECT_PATH" ]] && die "project directory not found: $PROJECT_PATH"

case "$MODE" in
  1) MODE_LABEL="Implement Backlog Item"; PROMPT_TEMPLATE="$PROMPTS_DIR/implement-backlog.md" ;;
  2) MODE_LABEL="Create User Stories";    PROMPT_TEMPLATE="$PROMPTS_DIR/create-userstories.md" ;;
  3) MODE_LABEL="Implement from User Story";  PROMPT_TEMPLATE="$PROMPTS_DIR/implement-userstory.md" ;;
  *) die "--mode must be 1, 2, or 3" ;;
esac

[[ ! -f "$PROMPT_TEMPLATE" ]] && die "Prompt template not found: $PROMPT_TEMPLATE"

# ── Setup ─────────────────────────────────────────────────────────────────────
TIMESTAMP="$(date '+%Y%m%d_%H%M%S')"
RUN_ID="mode${MODE}_${TIMESTAMP}"
OUTPUT_LOG="$LOGS_DIR/${RUN_ID}.log"

mkdir -p "$LOGS_DIR"

# ── Build effective prompt ────────────────────────────────────────────────────
KANBAN_CONTENT="$(cat "$KANBAN_PATH")"
TEMPLATE_CONTENT="$(cat "$PROMPT_TEMPLATE")"

EFFECTIVE_PROMPT="${TEMPLATE_CONTENT//\{\{ITEM_NAME\}\}/$ITEM_NAME}"
EFFECTIVE_PROMPT="${EFFECTIVE_PROMPT//\{\{PROJECT_PATH\}\}/$PROJECT_PATH}"
EFFECTIVE_PROMPT="${EFFECTIVE_PROMPT//\{\{KANBAN_PATH\}\}/$KANBAN_PATH}"
EFFECTIVE_PROMPT="${EFFECTIVE_PROMPT//\{\{KANBAN_CONTENT\}\}/$KANBAN_CONTENT}"

# ── Banner ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║       Ralph Loop Executor                ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
echo -e "  ${BOLD}Mode:${NC}     $MODE — $MODE_LABEL"
echo -e "  ${BOLD}Item:${NC}     $ITEM_NAME"
echo -e "  ${BOLD}Project:${NC}  $PROJECT_PATH"
echo -e "  ${BOLD}Kanban:${NC}   $KANBAN_PATH"
echo -e "  ${BOLD}Max:${NC}      $MAX_ITERATIONS iterations"
echo -e "  ${BOLD}Log:${NC}      $OUTPUT_LOG"
echo ""

# ── Loop ──────────────────────────────────────────────────────────────────────
ITERATION=0

while [ "$ITERATION" -lt "$MAX_ITERATIONS" ]; do
  ITERATION=$((ITERATION + 1))

  echo -e "${YELLOW}── Iteration $ITERATION / $MAX_ITERATIONS ──────────────────────────────${NC}"
  echo "$(date '+%Y-%m-%d %H:%M:%S') | Iteration $ITERATION starting" >> "$OUTPUT_LOG"

  # Spin up a fresh Claude Code instance in the project directory
  if (cd "$PROJECT_PATH" && echo "$EFFECTIVE_PROMPT" | claude --dangerously-skip-permissions --print) >> "$OUTPUT_LOG" 2>&1; then
    echo -e "  Claude exited cleanly."
  else
    echo -e "  ${YELLOW}Claude exited non-zero. Checking for completion signal...${NC}"
  fi

  # Check completion signal
  if grep -q "<promise>COMPLETE</promise>" "$OUTPUT_LOG"; then
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   COMPLETE — finished in $ITERATION iteration(s)   ${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  Full log: ${BOLD}$OUTPUT_LOG${NC}"
    exit 0
  fi

  echo -e "  No completion signal yet. Looping...\n"
done

# ── Max iterations hit ────────────────────────────────────────────────────────
echo ""
echo -e "${RED}╔══════════════════════════════════════════╗${NC}"
echo -e "${RED}║   STOPPED — max iterations reached       ║${NC}"
echo -e "${RED}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Review the log and refine your kanban/item description:"
echo -e "  ${BOLD}$OUTPUT_LOG${NC}"
exit 1
