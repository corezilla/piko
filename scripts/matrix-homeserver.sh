#!/usr/bin/env bash
# Provision the Matrix (Synapse) homeserver on a remote test host.
#
# Used to move the scenario homeserver off a busy machine (y7000) onto m5air
# without losing the property Piko actually depends on: a real Matrix server to
# verify discussion intake/reply and fail-closed membership loss.
#
#   ./scripts/matrix-homeserver.sh up   mlp@192.168.1.9
#   ./scripts/matrix-homeserver.sh pull mlp@192.168.1.9 /tmp/m5air-matrix
#
# Idempotent: re-running up keeps users/tokens and only recreates the room when
# asked. Nothing here touches ~/.ssh; it only uses the caller's existing access.
set -euo pipefail

REMOTE="${2:-mlp@192.168.1.9}"
DIR="${3:-/tmp/m5air-matrix}"
# Remote-side paths, resolved against the remote account's home so the local
# $HOME can never leak in. `~` inside a quoted ssh command is NOT expanded by
# the remote login shell when it follows a quoted path, so resolve it up front.
remote() { ssh -o BatchMode=yes "$REMOTE" "$@"; }
REMOTE_HOME="$(remote 'echo $HOME' 2>/dev/null || true)"
if [ -z "$REMOTE_HOME" ]; then echo "cannot reach $REMOTE" >&2; exit 1; fi
HS="$REMOTE_HOME/piko-matrix-homeserver"
VENV="$REMOTE_HOME/piko-runtime-venv"
SERVER="piko.local"
PORT=8448
SHARED_SECRET="piko-scenario-shared-secret"

case "${1:-}" in
up)
  echo "==> toolchain"
  remote "command -v rustc >/dev/null || { curl -sSf https://sh.rustup.rs | sh -s -- -y --no-modify-path --profile minimal; }"
  remote "test -d $VENV || python3.12 -m venv $VENV"
  # matrix-synapse builds a Rust extension; a prebuilt toolchain is required.
  remote "export PATH=\$HOME/.cargo/bin:\$PATH; $VENV/bin/python -m pip install --quiet --upgrade matrix-synapse"

  echo "==> keys and TLS"
  remote "mkdir -p $HS/tls $REMOTE_HOME/piko-secrets"
  if ! remote "test -f $HS/signing.key"; then
    ssh -o BatchMode=yes "$REMOTE" "$VENV/bin/python -" <<'PY'
from signedjson.key import generate_signing_key, write_signing_keys
import os
path = os.path.expanduser("~/piko-matrix-homeserver/signing.key")
with open(path, "w") as f:
    write_signing_keys(f, [generate_signing_key("0")])
PY
  fi
  remote "test -f $HS/tls/server.crt || openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout $HS/tls/server.key -out $HS/tls/server.crt -days 3650 \
    -subj '/CN=${REMOTE##*@}' -addext 'subjectAltName=IP:${REMOTE##*@},DNS:localhost' 2>/dev/null"

  echo "==> config"
  ssh -o BatchMode=yes "$REMOTE" "$VENV/bin/python -" <<PY
import yaml, pathlib
p = pathlib.Path("$HS/homeserver.yaml")
c = yaml.safe_load(p.read_text()) if p.exists() else {}
c.update({
  "server_name": "$SERVER",
  # resources MUST name \"client\": without it Synapse serves only /health and
  # every /_matrix/client route 404s.
  "listeners": [{"port": $PORT, "tls": True, "bind_addresses": ["0.0.0.0"],
                 "type": "http", "x_forwarded": False,
                 "resources": [{"names": ["client"], "compress": False}]}],
  "tls_certificate_path": "$HS/tls/server.crt",
  "tls_private_key_path": "$HS/tls/server.key",
  "signing_key_path": "$HS/signing.key",
  "media_store_path": "$HS/media_store",
  "pid_file": "$HS/homeserver.pid",
  "log_config": "$HS/$SERVER.log.config",
  "database": {"name": "sqlite3", "args": {"database": "$HS/homeserver.db"}},
  "enable_registration": True,
  "enable_registration_without_verification": True,
  "registration_requires_token": False,
  "registration_shared_secret": "$SHARED_SECRET",
  "macaroon_secret_key": "piko-scenario-macaroon-secret",
  "form_secret": "piko-scenario-form-secret",
  "report_stats": False,
  "federation_enabled": False,
  "url_preview_enabled": False,
})
p.write_text(yaml.safe_dump(c, sort_keys=False))
PY
  # The log handler path is absolute; a config copied from another host keeps
  # the old prefix and Synapse aborts with "Unable to configure handler 'file'".
  remote "test -f $HS/$SERVER.log.config || printf 'version: 1\nformatters:\n  precise:\n    format: \"%%(asctime)s - %(name)s - %(levelname)s - %(message)s\"\nhandlers:\n  file:\n    class: logging.handlers.RotatingFileHandler\n    formatter: precise\n    filename: $HS/homeserver.log\n    maxBytes: 10485760\n    backupCount: 5\nroot:\n  level: INFO\n  handlers: [file]\n' > $HS/$SERVER.log.config"

  echo "==> start"
  remote "pkill -f synapse.app.homeserver 2>/dev/null || true; sleep 2"
  remote "cd $HS && (nohup $VENV/bin/python -m synapse.app.homeserver --config-path $HS/homeserver.yaml > $HS/homeserver.log 2>&1 &)"
  for _ in $(seq 1 40); do
    if remote "curl -sk -m 4 -o /dev/null -w '%{http_code}' https://127.0.0.1:$PORT/_matrix/client/versions" | grep -q 200; then
      echo "homeserver up on $REMOTE:$PORT"; exit 0
    fi
    sleep 3
  done
  echo "homeserver did not become ready; check: ssh $REMOTE 'tail -30 $HS/homeserver.log'" >&2
  exit 1
  ;;

users)
  echo "==> users"
  ssh -o BatchMode=yes "$REMOTE" "$VENV/bin/python -" <<'PY'
import json, os, subprocess, sys
HS = os.path.expanduser("~/piko-matrix-homeserver")
SEC = os.path.expanduser("~/piko-secrets")
BASE = "https://127.0.0.1:8448"
os.makedirs(SEC, exist_ok=True)
users = {"ben": "BenPassw0rd123", "second-user": "SecondPassw0123", "piko-bot": "PikoBotPass0123"}
def call(path, body, token=None):
    cmd = ["curl","-sk","-m","20","-X","POST", f"{BASE}{path}", "-H","Content-Type: application/json"]
    if token: cmd += ["-H", f"Authorization: Bearer {token}"]
    cmd += ["-d", json.dumps(body)]
    out = subprocess.run(cmd, capture_output=True, text=True).stdout
    try: return json.loads(out)
    except Exception: return {}
for name, pw in users.items():
    path = f"{SEC}/matrix-{name}"
    if os.path.exists(path) and open(path).read().strip():
        print(f"{name}: existing token"); continue
    r = call("/_matrix/client/v3/register", {"username":name,"password":pw,"auth":{"type":"m.login.dummy"}})
    tok = r.get("access_token")
    if not tok:
        r = call("/_matrix/client/v3/login", {"type":"m.login.password",
            "identifier":{"type":"m.id.user","user":name},"password":pw})
        tok = r.get("access_token")
    if tok:
        open(path,"w").write(tok); os.chmod(path, 0o600); print(f"{name}: created")
    else:
        print(f"{name}: FAILED {r.get('error')}", file=sys.stderr)
PY
  ;;

room)
  echo "==> scenario room"
  ssh -o BatchMode=yes "$REMOTE" "$VENV/bin/python -" <<'PY'
import json, os, subprocess
HS = os.path.expanduser("~/piko-matrix-homeserver"); SEC = os.path.expanduser("~/piko-secrets")
BASE = "https://127.0.0.1:8448"
tok = lambda n: open(f"{SEC}/matrix-{n}").read().strip()
def call(method, path, body=None, token=None):
    cmd = ["curl","-sk","-m","20","-X",method, f"{BASE}{path}"]
    if token: cmd += ["-H", f"Authorization: Bearer {token}"]
    if body is not None:
        cmd += ["-H","Content-Type: application/json","-d",json.dumps(body)]
    out = subprocess.run(cmd, capture_output=True, text=True).stdout
    try: return json.loads(out)
    except Exception: return {}
r = call("POST","/_matrix/client/v3/createRoom", {
  "preset":"private_chat","name":"piko-scenario",
  "invite":["@piko-bot:piko.local","@second-user:piko.local"],
  "power_level_content_override":{"users":{"@piko-bot:piko.local":0,"@second-user:piko.local":50},
    "users_default":50,"invite":50,"kick":50,"redact":50,"ban":50}}, token=tok("ben"))
room = r.get("room_id")
if not room: raise SystemExit(f"createRoom failed: {r}")
# Synapse >=1.116 stores room ids WITHOUT the ':server' suffix, and its client
# API only accepts that bare form. Do not append the server name.
open(f"{HS}/room-scenario.json","w").write(room)
# piko-bot must be INVITED before it can join: a plain /join fails with
# M_FORBIDDEN for a room it was never invited to, and a bot left in "leave"
# never receives room events -- which silently breaks every discussion case.
for who in ("piko-bot", "second-user"):
    call("POST", f"/_matrix/client/v3/rooms/{room}/invite", {"user_id": f"@{who}:piko.local"}, token=tok("ben"))
for who in ("piko-bot", "second-user"):
    call("POST", f"/_matrix/client/v3/rooms/{room}/join", {}, token=tok(who))
# Verify rather than assume: an unjoined bot is a silent, hard-to-diagnose failure.
for who in ("piko-bot", "second-user"):
    jr = call("GET", "/_matrix/client/v3/joined_rooms", token=tok(who))
    if room not in jr.get("joined_rooms", []):
        raise SystemExit(f"{who} failed to join {room}: {jr}")
print("room:", room, "(piko-bot + second-user joined and verified)")
PY
  ;;

pull)
  mkdir -p "$DIR"
  for u in ben second-user piko-bot; do
    scp -q -o BatchMode=yes "$REMOTE:$REMOTE_HOME/piko-secrets/matrix-$u" "$DIR/$u.token"
  done
  scp -q -o BatchMode=yes "$REMOTE:$HS/room-scenario.json" "$DIR/room.json"
  scp -q -o BatchMode=yes "$REMOTE:$HS/tls/server.crt" "$DIR/server.crt"
  echo "fetched tokens + room + CA cert into $DIR"
  echo "run with:"
  echo "  export MATRIX_BASE=https://${REMOTE##*@}:$PORT \\"
  echo "         CA_CERT=$DIR/server.crt ROOM_ID=\$(cat $DIR/room.json) \\"
  echo "         BEN_TOK=\$(cat $DIR/ben.token) SECOND_TOK=\$(cat $DIR/second-user.token) \\"
  echo "         PIKO_BOT_TOK=\$(cat $DIR/piko-bot.token) NODE_EXTRA_CA_CERTS=$DIR/server.crt"
  ;;

down)
  remote "pkill -f synapse.app.homeserver" || true
  echo "homeserver stopped on $REMOTE"
  ;;

*)
  echo "usage: $0 {up|users|room|pull|down} [user@host] [local-dir]" >&2
  exit 2
  ;;
esac