#!/usr/bin/env bash
# Piko scenario case runner.
#
# usage: scripts/scenario-run.sh <case-dir> <task_id> [--cancel-after N] [--no-wait]
#   <case-dir>   directory under var/scenario-seeds (e.g. pts-01, pts-02-c4)
#                must contain params.json and instruction.txt (see scenario-seeds.sh)
#   --cancel-after N   issue POST /runs/{id}:cancel N seconds after start
#
# Reads read_paths/write_paths/output_paths/limits from params.json, POSTs the
# run, polls to a terminal state, and prints the run view + result. Assertions
# remain per-case (specification §3.1 local verification commands).
set -euo pipefail

ROOT="${SCEN_ROOT:-$PWD/var/scenario-seeds}"
BASE="${PIKO_URL:-http://127.0.0.1:8787}"
BEARER="${PIKO_BEARER:-$(cat "$HOME/piko-secrets/piko-api-bearer")}"
CASE="${1:?usage: scenario-run.sh <case-dir> <task_id> [--cancel-after N]}"
TID="${2:?missing task_id}"
shift 2
CANCEL_AFTER=0
while [ $# -gt 0 ]; do
  case "$1" in
    --cancel-after) CANCEL_AFTER="$2"; shift 2;;
    *) echo "unknown arg: $1" >&2; exit 2;;
  esac
done

DIR="$ROOT/$CASE"
[ -f "$DIR/params.json" ]    || { echo "missing $DIR/params.json" >&2; exit 2; }
[ -f "$DIR/instruction.txt" ] || { echo "missing $DIR/instruction.txt" >&2; exit 2; }

INSTR=$(cat "$DIR/instruction.txt")
MAXM=$(jq -r '.max_model_calls // 24' "$DIR/params.json")
MAXT=$(jq -r '.max_tool_calls // 24' "$DIR/params.json")
DLS=$(jq -r '.deadline_secs // 900' "$DIR/params.json")
PROFILE=$(jq -r '.profile // "workspace-exec"' "$DIR/params.json")
[ "$CANCEL_AFTER" = "0" ] && CANCEL_AFTER=$(jq -r '.cancel_after // 0' "$DIR/params.json")

DL=$(python3 -c "from datetime import datetime,timedelta,timezone;print((datetime.now(timezone.utc)+timedelta(seconds=$DLS)).strftime('%Y-%m-%dT%H:%M:%SZ'))")
BODY=$(jq -nc --arg t "$TID" --arg i "$INSTR" --arg d "$DL" --arg p "$PROFILE" --argjson m "$MAXM" --argjson k "$MAXT" \
  --slurpfile pr "$DIR/params.json" \
  '{task_id:$t,instruction:$i,workspace_ref:"piko",
    permissions:{read_paths:$pr[0].read,write_paths:$pr[0].write,tool_profile_ref:$p},
    limits:{deadline_at:$d,max_model_calls:$m,max_tool_calls:$k},
    output_paths:$pr[0].output}')

RID=$(curl -sS -m 15 -X POST "$BASE/runs" -H "Authorization: Bearer $BEARER" \
  -H "Content-Type: application/json" -d "$BODY" | jq -r .run_id)
echo "case=$CASE task_id=$TID run_id=$RID cancel_after=${CANCEL_AFTER}s"

START=$(date +%s); CANCELLED=0
while :; do
  V=$(curl -sS -m 5 "$BASE/runs/$RID" -H "Authorization: Bearer $BEARER")
  S=$(printf '%s' "$V" | jq -r .state)
  NOW=$(date +%s)
  if [ "$CANCEL_AFTER" != "0" ] && [ "$CANCELLED" = "0" ] && [ $((NOW-START)) -ge "$CANCEL_AFTER" ]; then
    printf '  cancel -> '; curl -sS -m 5 -X POST "$BASE/runs/$RID:cancel" -H "Authorization: Bearer $BEARER" | jq -c .
    CANCELLED=1
  fi
  case "$S" in Completed|Failed|Cancelled) break;; esac
  sleep 3
done
echo "FINAL=$S elapsed=$(( $(date +%s) - START ))s"
echo "--- run view ---"; printf '%s\n' "$V" | jq -c '{state,result_available,cancel_requested,failure,progress}'
echo "--- result ---"
curl -sS -m 5 "$BASE/runs/$RID/result" -H "Authorization: Bearer $BEARER" \
  | jq -c '{state,partial,summary:(.summary|.[0:300]),outputs,failure,usage:{quality:.usage.quality,model_attempts:.usage.model_attempts,observed:.usage.usage_observed_attempts,missing:.usage.missing_fields}}'
echo "RUN_ID=$RID"
