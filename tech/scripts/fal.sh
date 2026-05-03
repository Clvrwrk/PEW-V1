#!/usr/bin/env bash
# fal.sh — wrapper for fal.ai queue-based image/video generation.
#
# Usage:
#   ./fal.sh image <model-slug> [--prompt "..."] [--prompt-file <path>] [--out <dir>] [--ratio 16:9]
#   ./fal.sh poll <request-id> <model-slug>
#
# Common image models:
#   fal-ai/flux-pro/v1.1                         (Flux Pro 1.1 — quality)
#   fal-ai/flux/dev                              (Flux Dev — fast)
#   fal-ai/recraft-v3                            (Recraft V3 — typography + illustration)
#   fal-ai/imagen3                               (Imagen 3)
#   fal-ai/ideogram/v2                           (Ideogram V2 — text rendering)
#
# For Nano Banana Pro / GPT Image 2, use the Higgsfield MCP instead — those models
# are routed through Higgsfield's gateway, not Fal.ai directly.
#
# Reads FAL_KEY from project .env. Outputs go to /tech/scripts/output/fal/<timestamp>/.
# Never echoes the key.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/load_env.sh
source "${SCRIPT_DIR}/lib/load_env.sh"
require_var FAL_KEY

OUT_DIR="${SCRIPT_DIR}/output/fal"
TS="$(date +%Y%m%d-%H%M%S)"

usage() {
  sed -n '2,16p' "${BASH_SOURCE[0]}" | sed 's/^# \?//'
  exit 1
}

cmd="${1:-}"; shift || true
case "$cmd" in
  image)
    [[ $# -lt 1 ]] && usage
    model="$1"; shift
    prompt=""; prompt_file=""; out="${OUT_DIR}/${TS}"; ratio="16:9"
    while [[ $# -gt 0 ]]; do
      case "$1" in
        --prompt) prompt="$2"; shift 2;;
        --prompt-file) prompt_file="$2"; shift 2;;
        --out) out="$2"; shift 2;;
        --ratio) ratio="$2"; shift 2;;
        *) shift;;
      esac
    done
    [[ -n "$prompt_file" ]] && prompt=$(cat "$prompt_file")
    [[ -z "$prompt" ]] && { echo "ERROR: prompt required" >&2; exit 1; }
    mkdir -p "$out"

    payload=$(python3 -c '
import json, sys
print(json.dumps({"prompt": sys.argv[1], "image_size": "landscape_16_9" if sys.argv[2] == "16:9" else "square_hd"}))
' "$prompt" "$ratio")

    response=$(curl -sS -X POST "https://queue.fal.run/${model}" \
      -H "Authorization: Key ${FAL_KEY}" \
      -H "Content-Type: application/json" \
      -d "$payload")

    request_id=$(printf '%s' "$response" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("request_id",""))')
    if [[ -z "$request_id" ]]; then
      echo "ERROR: no request_id in response" >&2
      printf '%s\n' "$response" >&2
      exit 1
    fi

    echo "Queued: $request_id" >&2
    echo "$request_id" > "$out/request_id.txt"
    echo "$model" > "$out/model.txt"

    # Poll until complete
    status_url="https://queue.fal.run/${model}/requests/${request_id}/status"
    result_url="https://queue.fal.run/${model}/requests/${request_id}"
    for i in $(seq 1 60); do
      sleep 2
      status=$(curl -sS -H "Authorization: Key ${FAL_KEY}" "$status_url" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("status",""))')
      echo "  poll $i: $status" >&2
      if [[ "$status" == "COMPLETED" ]]; then
        result=$(curl -sS -H "Authorization: Key ${FAL_KEY}" "$result_url")
        printf '%s' "$result" > "$out/result.json"
        # Extract first image URL and download
        img_url=$(printf '%s' "$result" | python3 -c '
import json, sys
data = json.load(sys.stdin)
imgs = data.get("images", []) or data.get("image", {})
if isinstance(imgs, list) and imgs:
    print(imgs[0].get("url", ""))
elif isinstance(imgs, dict):
    print(imgs.get("url", ""))
')
        if [[ -n "$img_url" ]]; then
          curl -sS -o "$out/image.png" "$img_url"
          echo "Saved: $out/image.png" >&2
        fi
        echo "$out"
        exit 0
      fi
      if [[ "$status" == "FAILED" ]]; then
        echo "ERROR: generation failed" >&2
        curl -sS -H "Authorization: Key ${FAL_KEY}" "$result_url" > "$out/error.json"
        exit 1
      fi
    done
    echo "ERROR: timed out after 120s polling" >&2
    exit 1
    ;;
  poll)
    [[ $# -lt 2 ]] && usage
    request_id="$1"; model="$2"
    curl -sS -H "Authorization: Key ${FAL_KEY}" "https://queue.fal.run/${model}/requests/${request_id}" | python3 -m json.tool
    ;;
  ""|-h|--help) usage ;;
  *) echo "Unknown command: $cmd" >&2; usage ;;
esac
