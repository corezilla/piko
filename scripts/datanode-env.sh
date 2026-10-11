#!/usr/bin/env bash
# datanode-env.sh — hermetic scp data-plane test environment (PK-T41 / PK-T42).
#
# Brings up a throwaway sshd on a high port with a throwaway key and a pinned
# known_hosts, all under var/datanode/. It NEVER touches the real ~/.ssh.
#
# Usage:
#   scripts/datanode-env.sh up      # create env; prints env file path
#   scripts/datanode-env.sh check   # verify reachability + pinned host key
#   scripts/datanode-env.sh down    # stop sshd + remove the temp env
#
# After `up`, run the data-plane e2e with the emitted env:
#   set -a; . var/datanode/env; set +a
#   PIKO_SCP_E2E="$DN_TARGET" npm run test:xfer
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DN="$ROOT/var/datanode"
HOME_DIR="$DN/home"
USER_NAME="$(whoami)"

up() {
  rm -rf "$DN"; mkdir -p "$HOME_DIR/.ssh" "$DN/remote-in" "$DN/remote-out" "$ROOT/var/datanode/staging"
  chmod 700 "$HOME_DIR" "$HOME_DIR/.ssh"
  local port=$((24000 + RANDOM % 2000))
  ssh-keygen -q -t ed25519 -N "" -f "$HOME_DIR/.ssh/id_test"
  ssh-keygen -q -t ed25519 -N "" -f "$DN/hostkey"
  cp "$HOME_DIR/.ssh/id_test.pub" "$DN/authorized_keys"; chmod 600 "$DN/authorized_keys"
  cat > "$DN/sshd_config" <<CFG
Port $port
ListenAddress 127.0.0.1
HostKey $DN/hostkey
AuthorizedKeysFile $DN/authorized_keys
PidFile $DN/sshd.pid
PasswordAuthentication no
KbdInteractiveAuthentication no
UsePAM no
PubkeyAuthentication yes
StrictModes no
Subsystem sftp internal-sftp
LogLevel ERROR
CFG
  /usr/sbin/sshd -f "$DN/sshd_config" -E "$DN/sshd.log"
  sleep 1
  ssh-keyscan -p "$port" -t ed25519 127.0.0.1 > "$DN/known_hosts" 2>/dev/null
  # route the alias through the temp port without touching the real ssh config
  printf 'Host dn-test\n  HostName 127.0.0.1\n  Port %s\n  User %s\n  IdentityFile %s\n  UserKnownHostsFile %s\n  StrictHostKeyChecking yes\n' \
    "$port" "$USER_NAME" "$HOME_DIR/.ssh/id_test" "$DN/known_hosts" > "$HOME_DIR/.ssh/config"
  {
    echo "DN_PORT=$port"
    echo "DN_HOME=$HOME_DIR"
    echo "DN_KEY=$HOME_DIR/.ssh/id_test"
    echo "DN_KNOWN_HOSTS=$DN/known_hosts"
    echo "DN_TARGET=$USER_NAME@dn-test:"
    echo "DN_REMOTE_IN=$DN/remote-in"
    echo "DN_REMOTE_OUT=$DN/remote-out"
    echo "DN_STAGING=$ROOT/var/datanode/staging"
  } > "$DN/env"
  echo "datanode-env: up (port $port)"
  echo "env: $DN/env"
  echo "hint: the e2e opt-in needs Host 'dn-test' to resolve via SSH config;"
  echo "      set HOME=$HOME_DIR when running the transfer that uses dn-test."
}

check() {
  [ -f "$DN/env" ] || { echo "not up"; exit 1; }
  # shellcheck disable=SC1090
  . "$DN/env"
  HOME="$DN_HOME" ssh -o BatchMode=yes dn-test 'echo SSH_OK' >/dev/null && echo "reachable: OK"
  HOME="$DN_HOME" ssh -o BatchMode=yes -o UserKnownHostsFile="$DN_KNOWN_HOSTS" -o StrictHostKeyChecking=yes dn-test true \
    && echo "pinned host key: OK"
  [ -s "$DN_KNOWN_HOSTS" ] && echo "known_hosts: present" || { echo "known_hosts: MISSING"; exit 1; }
}

down() {
  if [ -f "$DN/sshd.pid" ]; then kill "$(cat "$DN/sshd.pid")" 2>/dev/null || true; fi
  rm -rf "$DN"
  echo "datanode-env: down"
}

case "${1:-}" in
  up) up ;;
  check) check ;;
  down) down ;;
  *) echo "usage: $0 {up|check|down}" >&2; exit 2 ;;
esac
