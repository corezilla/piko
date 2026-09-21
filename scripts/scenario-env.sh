#!/usr/bin/env bash
# Piko scenario-test environment preparation (PTS-06 / Matrix cases).
#
# Creates a dedicated scenario room where @piko-bot has power_level 0 so the
# admin can revoke its membership (PTS-06-C3), invites and joins all three test
# identities, and writes ~/piko-matrix-homeserver/room-scenario.json.
#
# piko-bot's authoritative access token lives in ~/piko-secrets/matrix-piko-bot
# (the same token Piko uses); users.json may hold a stale token after earlier
# PK-T18 password resets.
set -euo pipefail

HS="${MATRIX_BASE:-https://127.0.0.1:8448}"
HOME_DIR="${HOME}/piko-matrix-homeserver"
USERS="${HOME_DIR}/users.json"
SECRETS="${HOME}/piko-secrets"
OUT="${HOME_DIR}/room-scenario.json"

BEN=$(jq -r '.["ben"].access_token' "$USERS")
SECOND=$(jq -r '.["second-user"].access_token' "$USERS")
PIKO=$(cat "${SECRETS}/matrix-piko-bot")

room=$(curl -sS -k -X POST "${HS}/_matrix/client/v3/createRoom" \
  -H "Authorization: Bearer ${BEN}" -H "Content-Type: application/json" -d '{
    "preset":"trusted_private_chat","name":"piko-scenario","topic":"Piko scenario testing",
    "invite":["@piko-bot:piko.local","@second-user:piko.local"],"visibility":"private",
    "power_level_content_override":{"users":{"@ben:piko.local":100,"@second-user:piko.local":100,"@piko-bot:piko.local":0},"users_default":0,"kick":50,"ban":50}
  }' | jq -r .room_id)

for pair in "piko-bot:${PIKO}" "second-user:${SECOND}"; do
  user="${pair%%:*}"; token="${pair#*:}"
  curl -sS -k -X POST "${HS}/_matrix/client/v3/rooms/${room}/join" \
    -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '{}' >/dev/null
done

printf '{"room_id":"%s"}\n' "$room" > "$OUT"
echo "scenario room: ${room} (piko-bot power=0; ben can revoke) -> ${OUT}"
