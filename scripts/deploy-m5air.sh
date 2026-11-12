#!/bin/bash
# Deploy piko to m5air (the slinky host) and start it against m5air's local oMLX.
#
# Topology:
#   m5air                                  A7048 (HIFM test target, experimental host)
#   ├── slinky ──loopback HTTP──► piko ──SSH──► (future: remote test execution)
#   └── oMLX (port 9000) ◄── piko llmtier.base_url
#
# Why m5air: A7048 is an experimental host that may crash during early testing.
# Piko runs on m5air so a dead A7048 yields a clean failure result instead of
# taking the agent down with it.
#
# Run from the piko repo root on the workstation:
#   bash scripts/deploy-m5air.sh
#
# Env overrides:
#   M5AIR_HOST      (default: m5air)
#   M5AIR_ROOT      (default: /Users/mlp/work/piko)
#   PIKO_PORT       (default: 8787)
#   OMLX_PORT       (default: 9000)
#   PIKO_MODEL      (default: gemma-4-e2b-it-4bit)
#   OMLX_API_KEY    (default: read from ~/.omlx/settings.json on m5air)

set -euo pipefail

M5AIR_HOST="${M5AIR_HOST:-m5air}"
# The HIFM test target. Named, never an IP: the SSH client must resolve it and
# the pinned host key is what makes it trustworthy.
A7048_HOST="${A7048_HOST:?A7048_HOST is required (host name, e.g. a7048)}"
M5AIR_ROOT="${M5AIR_ROOT:-/Users/mlp/work/piko}"
PIKO_PORT="${PIKO_PORT:-8787}"
OMLX_PORT="${OMLX_PORT:-9000}"
PIKO_MODEL="${PIKO_MODEL:-gemma-4-e2b-it-4bit}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[deploy] target: ${M5AIR_HOST}:${M5AIR_ROOT}"

# ---------------------------------------------------------------- 1. sync source
# upstream/pi is a vendored clone (shallow, not tracked in piko's git), so it is
# synced separately from the tracked tree.
echo "[deploy] syncing tracked source (excluding upstream/pi, node_modules)"
rsync -az --delete \
  --exclude 'node_modules' --exclude '.git' --exclude 'upstream/pi' \
  --exclude 'var' --exclude '.git-tmp-*' \
  --exclude 'config/runtime.json' --exclude 'config/runtime.omlx.json' \
  --exclude 'config/runtime.synthetic.json' --exclude 'config/runtime.tier.json' \
  --exclude 'config/runtime.llmtier.json' \
  "$REPO_ROOT/" "${M5AIR_HOST}:${M5AIR_ROOT}/"

# The config rewrite below must survive a sync, and the root-level tool config
# (vitest/tsconfig/package.json) is part of the tracked tree -- the exclude
# list above only skips the machine-local runtime.*.json variants.
echo "[deploy] syncing runtime config files and build config"
rsync -az vitest.config.ts vitest.live.config.ts package.json tsconfig.json \
  "${M5AIR_HOST}:${M5AIR_ROOT}/"

# config/runtime.example.json IS tracked but carries machine-specific absolute
# paths; rewrite them to the m5air layout in place.
#
# The SSH credentials for remote_bash (MECH-TESTEXEC) are prepared FIRST so
# the rewritten config can point at them.
#
# Two targets:
#   - m5air itself (self-SSH): a dedicated key generated here and authorized
#     on the host, so piko has a reachable SSH target for local smoke tests.
#   - a7048 (the HIFM inference host): the workstation's key, which is
#     already in a7048's authorized_keys. A7048 is Linux/Ubuntu, user
#     "a7048", reached by name; its host key is pinned from the workstation's
#     known_hosts (NOT accept-new) so the pin is authoritative.
echo "[deploy] preparing SSH credentials for remote execution"
ssh "$M5AIR_HOST" "mkdir -p '${M5AIR_ROOT}/var/keys' '${M5AIR_ROOT}/var/staging' '${M5AIR_ROOT}/var/pi-sessions' '${M5AIR_ROOT}/var/ws-m5air/reports' && chmod 700 '${M5AIR_ROOT}/var/keys'"
ssh "$M5AIR_HOST" "test -f '${M5AIR_ROOT}/var/keys/id_remote' || ssh-keygen -t ed25519 -N '' -f '${M5AIR_ROOT}/var/keys/id_remote' -C 'piko-remote-exec' >/dev/null 2>&1"
ssh "$M5AIR_HOST" "grep -qf '${M5AIR_ROOT}/var/keys/id_remote.pub' ~/.ssh/authorized_keys 2>/dev/null || cat '${M5AIR_ROOT}/var/keys/id_remote.pub' >> ~/.ssh/authorized_keys"

# The A7048 key: the workstation's own key (already authorized on A7048).
if [ -f "${A7048_KEY:-$HOME/.ssh/id_ed25519}" ]; then
  scp -q "${A7048_KEY:-$HOME/.ssh/id_ed25519}" "${M5AIR_HOST}:${M5AIR_ROOT}/var/keys/id_a7048"
  ssh "$M5AIR_HOST" "chmod 600 '${M5AIR_ROOT}/var/keys/id_a7048'"
  echo "[deploy] installed A7048 key from ${A7048_KEY:-$HOME/.ssh/id_ed25519}"
else
  echo "[deploy] WARNING: no A7048 key at ${A7048_KEY:-$HOME/.ssh/id_ed25519}; remote_bash on a7048 will not authenticate" >&2
fi

# Host keys: pinned from the workstation's known_hosts where available, plus
# the local self-SSH target.
ssh "$M5AIR_HOST" "touch '${M5AIR_ROOT}/var/known_hosts' && ssh-keyscan -H localhost 127.0.0.1 2>/dev/null >> '${M5AIR_ROOT}/var/known_hosts'"
if [ -f "$HOME/.ssh/known_hosts" ]; then
  scp -q "$HOME/.ssh/known_hosts" "${M5AIR_HOST}:${M5AIR_ROOT}/var/known_hosts.workstation"
  ssh "$M5AIR_HOST" "cat '${M5AIR_ROOT}/var/known_hosts.workstation' >> '${M5AIR_ROOT}/var/known_hosts'; rm -f '${M5AIR_ROOT}/var/known_hosts.workstation'; sort -u '${M5AIR_ROOT}/var/known_hosts' -o '${M5AIR_ROOT}/var/known_hosts'"
fi

echo "[deploy] rewriting machine-specific paths for m5air"
ssh "$M5AIR_HOST" "cd '${M5AIR_ROOT}' && python3 - <<'PY'
import json, re, pathlib
p = pathlib.Path('config/runtime.example.json')
d = json.loads(p.read_text())
s = json.dumps(d)
s = s.replace('/Users/ben/work/piko', '${M5AIR_ROOT}')
s = s.replace('/Users/ben/work/LLMTier', '/Users/mlp/work/LLMTier')
d = json.loads(s)
d['instance_id'] = 'piko-m5air'
d['listen'] = {'host': '127.0.0.1', 'port': ${PIKO_PORT}}
d['agent']['model'] = '${PIKO_MODEL}'
d['agent']['profile_ref'] = 'workspace-exec'
d['llmtier']['base_url'] = 'http://127.0.0.1:${OMLX_PORT}/v1'
d['llmtier']['models_timeout_ms'] = 60000
d['matrix']['enabled'] = False
# A sandboxed workspace root so agent writes never touch the piko checkout.
d['workspace'] = {
    'roots': {'piko': '${M5AIR_ROOT}/var/ws-m5air'},
    'staging_root': '${M5AIR_ROOT}/var/staging',
}
# No Mem0 / GraphRAG backend on m5air yet: drop identity so no secret is required.
d.pop('identity', None)
# SSH credentials for remote_bash (MECH-TESTEXEC): the A7048 key + pinned
# host keys. These are the SAME secrets the scp transfer uses.
d['transfer']['credential_ref'] = 'file:${M5AIR_ROOT}/var/keys/id_a7048'
d['transfer']['known_hosts'] = '${M5AIR_ROOT}/var/known_hosts'
d['transfer']['target_allowlist'] = ['a7048:/home/a7048', 'm5air:/Users/mlp', 'localhost:/tmp']
p.write_text(json.dumps(d, indent=2))
print('  runtime.example.json configured')
PY"

# The tool profile's remote_hosts must name the host as the SSH client will
# address it: "a7048@<hostname>" (A7048 is Linux, user "a7048").
ssh "$M5AIR_HOST" "cd '${M5AIR_ROOT}' && python3 - <<'PY'
import json, pathlib
p = pathlib.Path('config/tool-profiles.json')
d = json.loads(p.read_text())
tool = d['profiles']['workspace-exec']['tools'].get('remote_bash')
if tool is not None:
    tool['permissions']['remote_hosts'] = ['a7048@${A7048_HOST}', 'a7048', 'm5air', 'localhost']
    p.write_text(json.dumps(d, indent=2))
    print('  tool-profiles.json remote_hosts configured')
PY"

# The LLMTier wire-conformance test reads the LLMTier OpenAPI spec by absolute
# path; point it at the m5air checkout so the suite is green there too.
ssh "$M5AIR_HOST" "cd '${M5AIR_ROOT}' && sed -i.bak 's#/Users/ben/work/LLMTier#/Users/mlp/work/LLMTier#g' tests/integration/llmtier-contract.test.ts"

# ---------------------------------------------------------------- 2. vendored Pi
echo "[deploy] syncing vendored upstream/pi"
rsync -az --exclude 'node_modules' "$REPO_ROOT/upstream/pi/" "${M5AIR_HOST}:${M5AIR_ROOT}/upstream/pi/"

# ---------------------------------------------------------------- 3. dependencies
echo "[deploy] installing dependencies"
ssh "$M5AIR_HOST" "cd '${M5AIR_ROOT}' && npm install --no-audit --no-fund"
ssh "$M5AIR_HOST" "cd '${M5AIR_ROOT}/upstream/pi' && npm ci --no-audit --no-fund --ignore-scripts --omit=optional"

# ---------------------------------------------------------------- 4. runtime dirs
echo "[deploy] preparing launch script"
# The runtime dirs and the SSH credentials were prepared above, before the
# config rewrite that points at them.

# The oMLX API key lives in oMLX's own settings on m5air; read it from there
# rather than hardcoding it in the repo.
OMLX_KEY="$(ssh "$M5AIR_HOST" "python3 -c \"import json;print(json.load(open('/Users/mlp/.omlx/settings.json'))['auth']['api_key'])\"")"

ssh "$M5AIR_HOST" "cat > '${M5AIR_ROOT}/var/run-piko.sh' <<EOF
#!/bin/bash
cd '${M5AIR_ROOT}'
export PIKO_API_BEARER='m5air-local-dev-bearer'
export PIKO_LLM_API_KEY='${OMLX_KEY}'
export NODE_ENV=production
exec npx tsx src/main.ts config/runtime.example.json
EOF
chmod +x '${M5AIR_ROOT}/var/run-piko.sh'"

# ---------------------------------------------------------------- 5. verify
echo "[deploy] type-check + tests"
ssh "$M5AIR_HOST" "cd '${M5AIR_ROOT}' && npx tsc -p tsconfig.json --noEmit"
ssh "$M5AIR_HOST" "cd '${M5AIR_ROOT}' && npm run test:node"
ssh "$M5AIR_HOST" "cd '${M5AIR_ROOT}' && npx vitest run"

# ---------------------------------------------------------------- 6. start
echo "[deploy] restarting piko"
ssh "$M5AIR_HOST" "pkill -f 'tsx src/main.ts' 2>/dev/null || true; sleep 2; cd '${M5AIR_ROOT}' && nohup bash var/run-piko.sh > var/piko.log 2>&1 & sleep 12; tail -3 '${M5AIR_ROOT}/var/piko.log'"

echo "[deploy] done. piko on ${M5AIR_HOST}: http://127.0.0.1:${PIKO_PORT}"
echo "[deploy] token: m5air-local-dev-bearer"
