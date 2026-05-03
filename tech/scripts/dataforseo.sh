#!/usr/bin/env bash
# dataforseo.sh — wrapper for DataForSEO API calls.
#
# Usage:
#   ./dataforseo.sh keyword-volume <keyword> [<keyword> ...]
#   ./dataforseo.sh related-keywords <seed-keyword> [--limit N]
#   ./dataforseo.sh serp <keyword> [--location-code 2840] [--language-code en]
#   ./dataforseo.sh on-page <url>
#   ./dataforseo.sh autocomplete <keyword>
#
# Reads DATAFORSEO_AUTH_B64 from project .env (already base64-encoded user:pass).
# Writes JSON output to /tech/scripts/output/dataforseo/<timestamp>-<cmd>.json.
# Never echoes credentials. Pretty-prints a summary; full JSON is on disk.
#
# Default location: 2840 (United States), language: en. Override per-call.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/load_env.sh
source "${SCRIPT_DIR}/lib/load_env.sh"
require_var DATAFORSEO_AUTH_B64

OUT_DIR="${SCRIPT_DIR}/output/dataforseo"
mkdir -p "$OUT_DIR"
TS="$(date +%Y%m%d-%H%M%S)"

API="https://api.dataforseo.com/v3"

usage() {
  sed -n '2,12p' "${BASH_SOURCE[0]}" | sed 's/^# \?//'
  exit 1
}

post() {
  local endpoint="$1"
  local payload="$2"
  local out_file="$3"
  curl -sS -X POST "${API}${endpoint}" \
    -H "Authorization: Basic ${DATAFORSEO_AUTH_B64}" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    -o "$out_file"
}

cmd="${1:-}"; shift || true
case "$cmd" in
  keyword-volume)
    [[ $# -lt 1 ]] && usage
    keywords_json=$(printf '%s\n' "$@" | python3 -c 'import json,sys; print(json.dumps([l.strip() for l in sys.stdin if l.strip()]))')
    payload="[{\"keywords\": ${keywords_json}, \"location_code\": 2840, \"language_code\": \"en\"}]"
    out="${OUT_DIR}/${TS}-keyword-volume.json"
    post "/keywords_data/google_ads/search_volume/live" "$payload" "$out"
    python3 -c '
import json, sys
data = json.load(open("'"$out"'"))
for r in data.get("tasks", [{}])[0].get("result", []) or []:
    kw = r.get("keyword", "")
    sv = r.get("search_volume", "n/a")
    cpc = r.get("cpc", "n/a")
    comp = r.get("competition", "n/a")
    print(f"{kw}: vol={sv}, cpc={cpc}, comp={comp}")
'
    echo "Full: $out"
    ;;
  related-keywords)
    [[ $# -lt 1 ]] && usage
    seed="$1"; shift
    limit=50
    while [[ $# -gt 0 ]]; do
      case "$1" in --limit) limit="$2"; shift 2;; *) shift;; esac
    done
    payload=$(printf '[{"keyword":"%s","location_code":2840,"language_code":"en","limit":%s}]' "$seed" "$limit")
    out="${OUT_DIR}/${TS}-related-keywords.json"
    post "/dataforseo_labs/google/related_keywords/live" "$payload" "$out"
    python3 -c '
import json, sys
data = json.load(open("'"$out"'"))
items = data.get("tasks", [{}])[0].get("result", [{}])[0].get("items", []) or []
for it in items[:25]:
    kd = it.get("keyword_data", {})
    kw = kd.get("keyword", "")
    info = kd.get("keyword_info", {}) or {}
    vol = info.get("search_volume", "n/a")
    print("{:>8}  {}".format(vol, kw))
print("... ({} total)".format(len(items)))
'
    echo "Full: $out"
    ;;
  serp)
    [[ $# -lt 1 ]] && usage
    keyword="$1"; shift
    location=2840; language=en
    while [[ $# -gt 0 ]]; do
      case "$1" in
        --location-code) location="$2"; shift 2;;
        --language-code) language="$2"; shift 2;;
        *) shift;;
      esac
    done
    payload=$(printf '[{"keyword":"%s","location_code":%s,"language_code":"%s","device":"desktop","depth":20}]' "$keyword" "$location" "$language")
    out="${OUT_DIR}/${TS}-serp.json"
    post "/serp/google/organic/live/regular" "$payload" "$out"
    python3 -c '
import json
data = json.load(open("'"$out"'"))
items = data.get("tasks", [{}])[0].get("result", [{}])[0].get("items", []) or []
for it in items[:20]:
    if it.get("type") != "organic": continue
    rank = it.get("rank_absolute", "?")
    title = (it.get("title") or "")[:70]
    url = it.get("url", "")
    print("{:>3}. {}\n     {}".format(rank, title, url))
'
    echo "Full: $out"
    ;;
  on-page)
    [[ $# -lt 1 ]] && usage
    url="$1"
    payload=$(printf '[{"target":"%s","max_crawl_pages":1,"load_resources":true,"enable_javascript":true,"custom_js":""}]' "$url")
    out="${OUT_DIR}/${TS}-on-page-task.json"
    post "/on_page/task_post" "$payload" "$out"
    task_id=$(python3 -c "import json;print(json.load(open('$out'))['tasks'][0]['id'])")
    echo "Task posted: $task_id (poll /on_page/summary/$task_id when ready)"
    echo "Full: $out"
    ;;
  autocomplete)
    [[ $# -lt 1 ]] && usage
    kw="$1"
    payload=$(printf '[{"keyword":"%s","location_code":2840,"language_code":"en"}]' "$kw")
    out="${OUT_DIR}/${TS}-autocomplete.json"
    post "/keywords_data/google_ads/keywords_for_keywords/live" "$payload" "$out"
    echo "Full: $out"
    ;;
  ""|-h|--help) usage ;;
  *) echo "Unknown command: $cmd" >&2; usage ;;
esac
