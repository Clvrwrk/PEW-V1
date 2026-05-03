#!/usr/bin/env bash
# openrouter.sh — wrapper for OpenRouter chat completions.
#
# Usage:
#   ./openrouter.sh <model> [--system "..."] [--out <path>]   # reads prompt from stdin
#   ./openrouter.sh <model> --prompt-file <path> [--system "..."] [--out <path>]
#
# Examples:
#   echo "Summarize this..." | ./openrouter.sh anthropic/claude-sonnet-4
#   ./openrouter.sh openai/gpt-4o --prompt-file ./tpo.md --system "You are a roofing SEO editor."
#
# Reads OPENROUTER_API_KEY from project .env. Writes response to stdout (or --out file).
# Never echoes the key.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/load_env.sh
source "${SCRIPT_DIR}/lib/load_env.sh"
require_var OPENROUTER_API_KEY

usage() {
  sed -n '2,11p' "${BASH_SOURCE[0]}" | sed 's/^# \?//'
  exit 1
}

[[ $# -lt 1 ]] && usage
model="$1"; shift

system_prompt=""
prompt_file=""
out_path=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --system) system_prompt="$2"; shift 2;;
    --prompt-file) prompt_file="$2"; shift 2;;
    --out) out_path="$2"; shift 2;;
    -h|--help) usage;;
    *) echo "Unknown arg: $1" >&2; usage;;
  esac
done

if [[ -n "$prompt_file" ]]; then
  user_content=$(cat "$prompt_file")
else
  user_content=$(cat)
fi

# Build messages array via python to avoid JSON-escape headaches
payload=$(python3 -c '
import json, sys
sys_prompt = sys.argv[1]
user = sys.argv[2]
model = sys.argv[3]
messages = []
if sys_prompt:
    messages.append({"role": "system", "content": sys_prompt})
messages.append({"role": "user", "content": user})
print(json.dumps({"model": model, "messages": messages}))
' "$system_prompt" "$user_content" "$model")

response=$(curl -sS -X POST "https://openrouter.ai/api/v1/chat/completions" \
  -H "Authorization: Bearer ${OPENROUTER_API_KEY}" \
  -H "Content-Type: application/json" \
  -H "HTTP-Referer: https://proexteriorsus.com" \
  -H "X-Title: AIA4 Pro Exteriors" \
  -d "$payload")

content=$(printf '%s' "$response" | python3 -c '
import json, sys
data = json.load(sys.stdin)
if "error" in data:
    err = data["error"]
    sys.stderr.write("OpenRouter error: " + json.dumps(err) + "\n")
    sys.exit(1)
print(data["choices"][0]["message"]["content"])
')

if [[ -n "$out_path" ]]; then
  printf '%s' "$content" > "$out_path"
  echo "Wrote: $out_path" >&2
else
  printf '%s\n' "$content"
fi
