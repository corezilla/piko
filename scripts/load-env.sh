#!/usr/bin/env bash
# load-env.sh — the single entry point that reads configuration from the
# environment, and from `.env` / `config/hosts.env` when they exist.
#
# Why one loader: addresses and secrets used to be spread across scripts, each
# defaulting to a different hardcoded value. When the topology moved, the
# defaults silently pointed at the wrong machine. There is now one place to
# look, one set of names, and one failure mode (a clear "required" message).
#
# Layering, lowest precedence first:
#   1. defaults declared below (loopback only — never another machine's address)
#   2. `.env` in the repo root             (secrets, per-checkout)
#   3. `config/hosts.env`                  (host names, per-machine, gitignored)
#   4. the caller's exported environment   (wins — the usual override)
#
# Usage, from a script:
#   . "$(dirname "$0")/load-env.sh"
#   : "${TIER_URL:?TIER_URL is required}"     # the loader never invents one
#
# Usage, from a test/CI command:
#   set -a; . ./scripts/load-env.sh; set +a
#
# Usage, to just see what resolved:
#   ./scripts/load-env.sh --show
set -u

_piko_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ── 1. defaults: this machine only ───────────────────────────────────
# Loopback means "this machine" whatever machine the script runs on. Anything
# else has no safe default, so it has none.

# ── 2./3. files, if present ──────────────────────────────────────────
# `set -a` exports what the file defines, so a plain `VAR=value` line works
# and callers do not have to remember to export.
#
# Layering is "first value set wins": snapshot what the caller already
# exported, load the file, then restore the caller's values. A plain `set -a; .`
# would let the file clobber the caller, which is backwards -- an explicit
# `TIER_URL=… npm run …` must beat a file on disk.
_piko_load_file() {
  local file="$1" name
  [ -f "$file" ] || return 0
  local -a _piko_have=()
  for name in $(sed -nE 's/^[[:space:]]*(export[[:space:]]+)?([A-Za-z_][A-Za-z0-9_]*)=.*/\2/p' "$file" 2>/dev/null); do
    if [ -n "${!name+x}" ]; then _piko_have+=("$name=${!name}"); fi
  done
  set -a
  # shellcheck disable=SC1090
  . "$file"
  set +a
  local pair
  for pair in "${_piko_have[@]:-}"; do
    [ -n "$pair" ] && export "${pair%%=*}=${pair#*=}"
  done
}
_piko_load_file "$_piko_root/config/hosts.env"
_piko_load_file "$_piko_root/.env"

# ── 1. defaults, applied last so a file can override them ────────────
# Loopback means "this machine" whatever machine the script runs on. Anything
# else has no safe default, so it has none. The caller's environment still
# wins, because `${VAR=…}` only assigns when the name is unset.
: "${PIKO_URL=http://127.0.0.1:8787}"
: "${TIER_URL=http://127.0.0.1:8181}"
: "${PIKO_RUNTIME_CONFIG=$_piko_root/config/runtime.live.json}"
: "${PIKO_REPO_ROOT=$_piko_root}"


# ── 4. caller's environment already wins: nothing to do ──────────────

# ── required names, checked in one place ─────────────────────────────
# A caller asks for what it needs by name; the message says what to set and
# where the example lives, so the fix is obvious instead of a mystery logout.
piko_require() {
  local name="$1" hint="${2:-}"
  if [ -z "${!name:-}" ]; then
    echo "load-env: $name is required. ${hint:-Set it in the environment or config/hosts.env (see config/hosts.env.example).}" >&2
    return 1
  fi
}

piko_export_all() {
  export PIKO_URL TIER_URL PIKO_RUNTIME_CONFIG PIKO_REPO_ROOT
}

if [ "${1:-}" = "--show" ]; then
  for name in PIKO_URL TIER_URL PIKO_RUNTIME_CONFIG PIKO_REPO_ROOT A7048_HOST PIKO_REMOTE_HOST PIKO_SCP_REMOTE; do
    value="${!name:-}"
    # Never print secret-shaped values, even here.
    case "$name" in
      *KEY*|*TOKEN*|*SECRET*) value=$([ -n "$value" ] && echo "(set)" || echo "(unset)") ;;
    esac
    printf '%-22s %s\n' "$name" "${value:-(unset)}"
  done
  exit 0
fi

piko_export_all
