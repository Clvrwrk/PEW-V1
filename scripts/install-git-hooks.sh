#!/usr/bin/env bash
# scripts/install-git-hooks.sh
#
# Installs a pre-push git hook that runs the deploy preflight
# (npm run preflight) so a push that would fail Coolify is blocked locally.
# Git hooks live in .git/hooks (NOT version-controlled), so run this once per
# clone. Bypass in an emergency with `git push --no-verify`.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOK_PATH="$REPO_ROOT/.git/hooks/pre-push"

cat > "$HOOK_PATH" <<'HOOK'
#!/usr/bin/env bash
# Auto-installed by scripts/install-git-hooks.sh — runs the deploy preflight.
set -euo pipefail
echo "▶ pre-push: running deploy preflight (npm run preflight)…"
echo "  bypass with: git push --no-verify"
if ! npm run preflight; then
  echo "❌ pre-push blocked: deploy preflight failed. Fix the above or re-run after auto-fixes."
  exit 1
fi
HOOK

chmod +x "$HOOK_PATH"
echo "✅ Installed pre-push hook at $HOOK_PATH"
echo "   It runs 'npm run preflight' on every 'git push'. Bypass: git push --no-verify"
