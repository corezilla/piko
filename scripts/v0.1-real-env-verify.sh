#!/usr/bin/env bash
# scripts/v0.1-real-env-verify.sh
#
# V0.1 真实环境验收脚本（per piko-skill-memory.md §13.3 + piko-doc-search.md §8）。
#
# Usage:
#   ./scripts/v0.1-real-env-verify.sh
#
# Environment:
#   MEM0_API_KEY                — required (or at $MEM0_KEY_FILE, default
#                                 /Users/ben/work/keys/mem0_key.txt)
#   MEM0_KEY_FILE               — override for key file path (default above)
#   GRAPHRAG_API_KEY            — required for GraphRAG day-1 verify
#   GRAPHRAG_BASE_URL           — required for GraphRAG day-1 verify
#   SKIP_INSTALL=1              — skip pnpm install
#   SKIP_TSC=1                  — skip tsc --noEmit
#   SKIP_DAY1=1                 — skip Mem0 + GraphRAG day-1 verify
#   SKIP_STD=1                  — skip STD cover / validate-design
#   SKIP_DETECT=1               — skip gitnexus detect_changes
#
# V0.1 立项否决条件（piko-skill-memory.md §13.3 + piko-doc-search.md §8）：
#   Mem0 day-1 (5 项) 任一 fail → 否决
#   GraphRAG day-1 (5 项) 任一 fail → 否决
#
# 退出码：所有 step PASS → 0；任一 fail → 1。

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

KEY_FILE="${MEM0_KEY_FILE:-/Users/ben/work/keys/mem0_key.txt}"
STD_SCRIPTS="/Users/ben/work/STD/scripts"
GITNEXUS_CLI="/Users/ben/.nvm/versions/node/v22.22.3/lib/node_modules/gitnexus/dist/cli/index.js"

# ----- output helpers -----

banner() {
  printf '\n========== %s ==========\n' "$1"
}

ok()    { printf '\033[32m✓\033[0m %s\n' "$1"; }
fail()  { printf '\033[31m✗\033[0m %s\n' "$1" >&2; }

SUMMARY=()

run_step() {
  local name="$1"; shift
  banner "Step: $name"
  set +e
  "$@"
  local rc=$?
  set -e
  if (( rc == 0 )); then
    ok "$name"
    SUMMARY+=("PASS  $name")
  else
    fail "$name (exit $rc)"
    SUMMARY+=("FAIL  $name (exit $rc)")
    return $rc
  fi
}

skip() {
  local reason="$1"
  printf '\033[33m— skip —\033[0m %s (%s)\n' "$NAME" "$reason"
  SUMMARY+=("SKIP  $NAME — $reason")
}

# ----- env -----

banner "Environment"

if [[ -z "${MEM0_API_KEY:-}" && -f "$KEY_FILE" ]]; then
  export MEM0_API_KEY="$(cat "$KEY_FILE")"
  ok "MEM0_API_KEY loaded from $KEY_FILE"
fi

if [[ -z "${MEM0_API_KEY:-}" ]]; then
  fail "MEM0_API_KEY unavailable — Mem0 day-1 verify cannot proceed"
  echo "Set MEM0_API_KEY env var, or place it at $KEY_FILE"
  exit 1
fi
ok "MEM0_API_KEY set (${#MEM0_API_KEY} chars)"

if [[ -n "${GRAPHRAG_API_KEY:-}" ]]; then
  ok "GRAPHRAG_API_KEY set (${#GRAPHRAG_API_KEY} chars)"
fi
if [[ -n "${GRAPHRAG_BASE_URL:-}" ]]; then
  ok "GRAPHRAG_BASE_URL=$GRAPHRAG_BASE_URL"
fi

if [[ -z "${GRAPHRAG_API_KEY:-}" || -z "${GRAPHRAG_BASE_URL:-}" ]]; then
  printf '\033[33m— warn —\033[0m GraphRAG day-1 verify will SKIP (env not set)\n'
fi

# ----- 1. pnpm install -----

NAME="01 — pnpm install"
if [[ "${SKIP_INSTALL:-0}" == "1" ]]; then
  skip "SKIP_INSTALL=1"
else
  run_step "$NAME" pnpm install
fi

# ----- 2. tsc --noEmit -----

NAME="02 — tsc --noEmit"
if [[ "${SKIP_TSC:-0}" == "1" ]]; then
  skip "SKIP_TSC=1"
else
  run_step "$NAME" npx tsc -p tsconfig.json --noEmit
fi

# ----- 3. unit tests (src/) -----

run_step "03 — unit tests: src/{mem0-client,skill-tools,graphrag-client,graphrag-tools}.test.ts" \
  npx tsx --test \
    src/mem0-client.test.ts \
    src/skill-tools.test.ts \
    src/graphrag-client.test.ts \
    src/graphrag-tools.test.ts

# ----- 4. integration / smoke tests (scripts/) -----

run_step "04 — smoke / integration: scripts/v0.1-{smoke,integration,pi-runtime-smoke}-test.ts" \
  npx tsx --test \
    scripts/v0.1-smoke-test.ts \
    scripts/v0.1-integration-test.ts \
    scripts/v0.1-pi-runtime-smoke.ts

# ----- 5. Ajv config validation -----

NAME="05 — Ajv: runtime.example.json + tool-profiles.json"
run_step "$NAME" npx tsx -e '
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readFileSync } from "node:fs";
const AjvCtor: any = (Ajv as any).default ?? Ajv;
const formats: any = (addFormats as any).default ?? addFormats;
const ajv = new AjvCtor({ allErrors: true, strict: false });
formats(ajv);
const cfg = JSON.parse(readFileSync("config/runtime.example.json", "utf8"));
const tp = JSON.parse(readFileSync("config/tool-profiles.json", "utf8"));
const cfgSchema = JSON.parse(readFileSync("interfaces/schemas/piko-runtime-config-v0.3.schema.json", "utf8"));
const tpSchema = JSON.parse(readFileSync("interfaces/schemas/piko-tool-profile-v0.3.schema.json", "utf8"));
const a = ajv.validate(cfgSchema, cfg);
const b = ajv.validate(tpSchema, tp);
if (!a) { console.error("Ajv errors (runtime):", ajv.errorsText(ajv.errors)); process.exit(1); }
if (!b) { console.error("Ajv errors (tool-profile):", ajv.errorsText(ajv.errors)); process.exit(1); }
console.log("runtime.example.json OK; tool-profiles.json OK");
'

# ----- 6. Mem0 day-1 verify (5 项真接口) -----

NAME="06 — Mem0 day-1 verify (5 项真接口)"
if [[ "${SKIP_DAY1:-0}" == "1" ]]; then
  skip "SKIP_DAY1=1"
else
  run_step "$NAME" env MEM0_API_KEY="$MEM0_API_KEY" \
    npx tsx scripts/v0.1-day1-verify.ts
fi

# ----- 7. GraphRAG day-1 verify (5 项真接口) -----

NAME="07 — GraphRAG day-1 verify (5 项真接口)"
if [[ "${SKIP_DAY1:-0}" == "1" ]]; then
  skip "SKIP_DAY1=1"
elif [[ -z "${GRAPHRAG_API_KEY:-}" || -z "${GRAPHRAG_BASE_URL:-}" ]]; then
  skip "GRAPHRAG_API_KEY / GRAPHRAG_BASE_URL not set"
else
  run_step "$NAME" env MEM0_API_KEY="$MEM0_API_KEY" \
                              GRAPHRAG_API_KEY="$GRAPHRAG_API_KEY" \
                              GRAPHRAG_BASE_URL="$GRAPHRAG_BASE_URL" \
      npx tsx scripts/v0.1-graphrag-day1-verify.ts
fi

# ----- 8. STD cover / validate-design (HANDOFF Step 8) -----

NAME="08a — STD: 11 docs new-design (incl. piko-doc-search + piko-graphrag-impl)"
if [[ "${SKIP_STD:-0}" == "1" ]]; then
  skip "SKIP_STD=1"
elif [[ ! -x "$STD_SCRIPTS/new-design" ]]; then
  skip "$STD_SCRIPTS/new-design not present at this path (set SKIP_STD=1 to suppress)"
else
  DOCS=(
    "docs/40_module_design/piko-mem0-client-design.md:design.definition:piko-mem0-client"
    "docs/40_module_design/piko-skill-tools-design.md:design.definition:piko-skill-tools"
    "docs/40_module_design/piko-pi-adapter-design-skill-tools-update.md:design.definition:piko-pi-adapter-design"
    "docs/40_module_design/piko-policy-design-skill-tools-update.md:design.definition:piko-policy-design"
    "docs/50_implementation_design/piko-mem0-client-impl.isd.md:design.implementation:piko-mem0-client-impl"
    "docs/50_implementation_design/piko-skill-tools-impl.isd.md:design.implementation:piko-skill-tools-impl"
    "docs/50_implementation_design/piko-pi-adapter-impl-skill-tools-update.isd.md:design.implementation:piko-pi-adapter-impl"
    "docs/50_implementation_design/piko-policy-impl-skill-tools-update.isd.md:design.implementation:piko-policy-impl"
    "docs/50_implementation_design/piko-graphrag-impl.isd.md:design.implementation:piko-graphrag-impl"
    "docs/60_interfaces/contracts/piko-skill-tools-identity-contract-v0.1.md:contracts.specification:piko-skill-tools-identity-contract"
    "docs/20_system_design/mechanisms/piko-doc-search.md:design.system:piko-doc-search"
  )
  std_cmd() {
    for entry in "${DOCS[@]}"; do
      IFS=':' read -r doc template name <<< "$entry"
      "$STD_SCRIPTS/new-design" \
        --project piko \
        --template "$template" \
        --name "$name" \
        --project-root "$REPO_ROOT" \
        --owner corezilla \
        --author corezilla \
        --author opencode \
        --repository corezilla/piko \
        --status draft \
        --parent-document-id piko-skill-memory
    done
  }
  run_step "$NAME" std_cmd
fi

NAME="08b — STD: validate-design"
if [[ "${SKIP_STD:-0}" == "1" ]]; then
  skip "SKIP_STD=1"
elif [[ ! -x "$STD_SCRIPTS/validate-design" ]]; then
  skip "$STD_SCRIPTS/validate-design not present"
else
  run_step "$NAME" "$STD_SCRIPTS/validate-design" --project-root "$REPO_ROOT"
fi

# ----- 9. gitnexus detect_changes -----

NAME="09 — gitnexus detect_changes (blast radius)"
if [[ "${SKIP_DETECT:-0}" == "1" ]]; then
  skip "SKIP_DETECT=1"
elif [[ ! -x "$GITNEXUS_CLI" ]]; then
  skip "gitnexus CLI not found at $GITNEXUS_CLI (set SKIP_DETECT=1 to suppress)"
else
  run_step "$NAME" node "$GITNEXUS_CLI" detect_changes --scope all --repo piko
fi

# ----- summary -----

banner "Summary"
printf '%s\n' "${SUMMARY[@]}"

FAIL_COUNT=0
for line in "${SUMMARY[@]}"; do
  if [[ "$line" == FAIL* ]]; then
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
done

echo
if (( FAIL_COUNT > 0 )); then
  echo "Total failures: $FAIL_COUNT"
  echo
  echo "Per piko-skill-memory.md §13.3 + piko-doc-search.md §8:"
  echo "  Mem0 day-1 (5 项) 任一 fail → V0.1 立项否决"
  echo "  GraphRAG day-1 (5 项) 任一 fail → V0.1 立项否决"
  exit 1
fi
echo "All PASS."
exit 0
