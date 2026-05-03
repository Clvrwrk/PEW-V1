#!/usr/bin/env python3
"""
huewrite.py — humanize text via Hue Write API.

Usage:
    python huewrite.py <input_file> [--tone TONE] [--model v3.5] [--ultra]

Reads HUEWRITE_API_KEY from environment (loaded from project .env).
Splits input text at paragraph boundaries into chunks <=2900 words to stay
under the 3000-word per-request limit. Respects the 60 req/min rate limit.

Outputs to <input_file>.humanized.<tone>.txt next to the original. Never echoes
the API key. Exits 0 on success, non-zero on any error.

Tones: standard | professional | friendly | formal | casual | academic | creative
Models: v2 | v3 | v3.5 (default)
"""
import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

API_URL = "https://huewrite.com/api/v1/humanize"
MAX_WORDS_PER_CHUNK = 2900
RATE_LIMIT_SLEEP = 1.1  # seconds between requests; 60/min = 1.0s, give margin
VALID_TONES = {"standard", "professional", "friendly", "formal", "casual", "academic", "creative"}
VALID_MODELS = {"v2", "v3", "v3.5"}


def load_dotenv() -> None:
    """Source the project .env if present. Never logs values."""
    project_root = Path(__file__).resolve().parents[1]
    env_file = project_root.parent / ".env"
    if not env_file.exists():
        return
    for raw in env_file.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        # Don't overwrite an already-set env var
        if key and key not in os.environ:
            os.environ[key] = value


def chunk_text(text: str, max_words: int) -> list[str]:
    """Split text into chunks of <=max_words, preferring paragraph boundaries."""
    paragraphs = re.split(r"\n{2,}", text.strip())
    chunks: list[str] = []
    current: list[str] = []
    current_words = 0
    for para in paragraphs:
        word_count = len(para.split())
        if word_count > max_words:
            # Single paragraph exceeds limit — split on sentence boundaries
            if current:
                chunks.append("\n\n".join(current))
                current, current_words = [], 0
            sentences = re.split(r"(?<=[.!?])\s+", para)
            sub_current: list[str] = []
            sub_words = 0
            for sent in sentences:
                sw = len(sent.split())
                if sub_words + sw > max_words and sub_current:
                    chunks.append(" ".join(sub_current))
                    sub_current, sub_words = [], 0
                sub_current.append(sent)
                sub_words += sw
            if sub_current:
                chunks.append(" ".join(sub_current))
            continue
        if current_words + word_count > max_words and current:
            chunks.append("\n\n".join(current))
            current, current_words = [], 0
        current.append(para)
        current_words += word_count
    if current:
        chunks.append("\n\n".join(current))
    return chunks


def humanize_chunk(chunk: str, tone: str, model: str, ultra: bool, api_key: str) -> str:
    body = json.dumps({
        "text": chunk,
        "tone": tone,
        "modelVersion": model,
        "ultraMode": bool(ultra),
        "isRehumanization": False,
    }).encode("utf-8")
    req = urllib.request.Request(
        API_URL,
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "text/plain",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        # Don't include key in error output
        try:
            err_body = e.read().decode("utf-8", errors="replace")
        except Exception:
            err_body = str(e)
        sys.stderr.write(f"Hue Write HTTP {e.code}: {err_body[:300]}\n")
        if e.code == 429:
            sys.stderr.write("Rate limited. Waiting 30s and retrying once...\n")
            time.sleep(30)
            with urllib.request.urlopen(req, timeout=120) as resp:
                return resp.read().decode("utf-8", errors="replace")
        raise
    except urllib.error.URLError as e:
        sys.stderr.write(f"Hue Write network error: {e}\n")
        raise


def main() -> int:
    load_dotenv()
    parser = argparse.ArgumentParser(description="Humanize text via Hue Write API")
    parser.add_argument("input", help="Path to input text file")
    parser.add_argument("--tone", default="professional", choices=sorted(VALID_TONES))
    parser.add_argument("--model", default="v3.5", choices=sorted(VALID_MODELS))
    parser.add_argument("--ultra", action="store_true", help="Enable ultraMode (Pro/Max plans)")
    parser.add_argument("--out", help="Output path (default: <input>.humanized.<tone>.txt)")
    args = parser.parse_args()

    api_key = os.environ.get("HUEWRITE_API_KEY", "")
    if not api_key:
        sys.stderr.write("ERROR: HUEWRITE_API_KEY not set (check project .env)\n")
        return 2

    in_path = Path(args.input).resolve()
    if not in_path.is_file():
        sys.stderr.write(f"ERROR: input file not found: {in_path}\n")
        return 2

    text = in_path.read_text(encoding="utf-8", errors="replace")
    if len(text.split()) < 50:
        sys.stderr.write("ERROR: Hue Write requires >=50 words\n")
        return 2

    chunks = chunk_text(text, MAX_WORDS_PER_CHUNK)
    sys.stderr.write(f"Humanizing {len(chunks)} chunk(s), tone={args.tone}, model={args.model}\n")

    out_path = Path(args.out) if args.out else in_path.with_suffix(f".humanized.{args.tone}.txt")
    out_parts: list[str] = []
    for i, chunk in enumerate(chunks, 1):
        sys.stderr.write(f"  chunk {i}/{len(chunks)} ({len(chunk.split())} words)... ")
        sys.stderr.flush()
        result = humanize_chunk(chunk, args.tone, args.model, args.ultra, api_key)
        out_parts.append(result)
        sys.stderr.write("ok\n")
        if i < len(chunks):
            time.sleep(RATE_LIMIT_SLEEP)

    out_path.write_text("\n\n".join(out_parts), encoding="utf-8")
    sys.stderr.write(f"Wrote: {out_path}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
