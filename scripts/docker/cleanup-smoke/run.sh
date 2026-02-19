#!/usr/bin/env bash
set -euo pipefail

cd /repo

export THEIAOS_STATE_DIR="/tmp/theiaos-test"
export THEIAOS_CONFIG_PATH="${THEIAOS_STATE_DIR}/theiaos.json"

echo "==> Build"
pnpm build

echo "==> Seed state"
mkdir -p "${THEIAOS_STATE_DIR}/credentials"
mkdir -p "${THEIAOS_STATE_DIR}/agents/main/sessions"
echo '{}' >"${THEIAOS_CONFIG_PATH}"
echo 'creds' >"${THEIAOS_STATE_DIR}/credentials/marker.txt"
echo 'session' >"${THEIAOS_STATE_DIR}/agents/main/sessions/sessions.json"

echo "==> Reset (config+creds+sessions)"
pnpm theiaos reset --scope config+creds+sessions --yes --non-interactive

test ! -f "${THEIAOS_CONFIG_PATH}"
test ! -d "${THEIAOS_STATE_DIR}/credentials"
test ! -d "${THEIAOS_STATE_DIR}/agents/main/sessions"

echo "==> Recreate minimal config"
mkdir -p "${THEIAOS_STATE_DIR}/credentials"
echo '{}' >"${THEIAOS_CONFIG_PATH}"

echo "==> Uninstall (state only)"
pnpm theiaos uninstall --state --yes --non-interactive

test ! -d "${THEIAOS_STATE_DIR}"

echo "OK"
