# /tech/scripts/

Curl-based wrappers for the four external APIs used in the Pro Exteriors build pipeline.
All scripts read credentials from the project root `.env` (never from chat, never echoed).
Outputs land in `output/<service>/<timestamp>/` for audit.

## Services

| Script | Service | Auth var(s) |
|---|---|---|
| `huewrite.py` | Hue Write — humanizer | `HUEWRITE_API_KEY` |
| `dataforseo.sh` | DataForSEO — keyword research, SERP, on-page audit | `DATAFORSEO_AUTH_B64` |
| `openrouter.sh` | OpenRouter — model gateway for research and filler copy | `OPENROUTER_API_KEY` |
| `fal.sh` | Fal.ai — Flux, Recraft, Imagen, Ideogram | `FAL_KEY` |

For Nano Banana Pro and GPT Image 2 specifically, **use the Higgsfield MCP** (already
connected) — those models are routed through Higgsfield's gateway, not Fal.ai.
For video generation, also use Higgsfield (Veo 3.1, Cinema Studio 3.0, Seedance 2.0).

## Usage

```bash
# Humanize a draft
python tech/scripts/huewrite.py content/tpo-draft.md --tone professional

# Keyword volume for a list
./tech/scripts/dataforseo.sh keyword-volume "tpo roofing dallas" "commercial roof replacement"

# SERP for a target query
./tech/scripts/dataforseo.sh serp "tpo roofing systems"

# Related keywords (for content brief expansion)
./tech/scripts/dataforseo.sh related-keywords "tpo roofing" --limit 100

# Research / filler-copy generation via OpenRouter
echo "Write 200 words on TPO seam-welding for a commercial pillar page." | \
  ./tech/scripts/openrouter.sh anthropic/claude-sonnet-4 --system "You are a roofing-industry editor."

# Image generation via Fal (use Higgsfield MCP for Nano Banana Pro / GPT Image 2)
./tech/scripts/fal.sh image fal-ai/flux-pro/v1.1 --prompt "Dallas commercial rooftop with TPO membrane install in progress, golden hour"
```

## Security

- No script accepts a key as an argument. All keys come from `.env` via `lib/load_env.sh`.
- No script echoes a key value, even on error.
- API responses are saved to `output/<service>/<timestamp>/` and excluded from git via
  the `.gitignore` entry `tech/scripts/output/`.
- `.env` is `.gitignore`'d. `.env.example` is the only file with key names checked in.

## Required `.env` keys

```
HUEWRITE_API_KEY=
DATAFORSEO_LOGIN=
DATAFORSEO_AUTH_B64=
OPENROUTER_API_KEY=
FAL_KEY=
```

## Maren operating note

These wrappers are infrastructure, not deliverables. Don't ship them to the client.
They live alongside `/tech/PRD_Phase-1_April-2026.md` because they're build-phase canon.
