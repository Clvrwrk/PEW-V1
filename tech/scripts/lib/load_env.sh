#!/usr/bin/env bash
# load_env.sh — sources the project .env into the current shell.
# Source, don't execute: `source ./lib/load_env.sh`
#
# Never echoes values. If a required key is missing, prints which key is missing
# (by name only) and exits the calling script with code 2.

set -u

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
ENV_FILE="${PROJECT_ROOT}/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: .env not found at $ENV_FILE" >&2
  return 2 2>/dev/null || exit 2
fi

# Export all uncommented KEY=VALUE pairs without printing them
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

require_var() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "ERROR: required env var $name is not set in $ENV_FILE" >&2
    return 2 2>/dev/null || exit 2
  fi
}
