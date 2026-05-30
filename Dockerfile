# syntax=docker/dockerfile:1.6
#
# Multi-stage build for the Pro Exteriors Astro site (hybrid output).
#  1. node:20-alpine builds to /app/dist (prerendered pages + standalone server)
#  2. node:20-alpine runs the standalone SSR server on port 4321
#
# The site is `output: "hybrid"` + @astrojs/node (standalone): every marketing
# page is prerendered static; only /api/contact and /api/contact-sync run on the
# Node server. The server serves the prerendered pages AND the API routes, so a
# single Node runtime replaces the old nginx-static stage.
#
# Coolify "dockerfile" build pack consumes this. NOTE: the exposed port changed
# from 80 → 4321 — update the Coolify port mapping accordingly.

# ---- Stage 1: build ----
FROM node:20-alpine AS build
WORKDIR /app

# Install deps with the lockfile for reproducibility, then patch in the
# Alpine/musl rollup binary that the macOS-generated lockfile omits.
# `npm ci` is strict about the lockfile — it will not resolve optional
# platform binaries for other OSes. We inject @rollup/rollup-linux-x64-musl
# explicitly so Vite/Rollup can load its native module on node:alpine.
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts
RUN npm install @rollup/rollup-linux-x64-musl --no-save --no-audit --no-fund 2>/dev/null || true
RUN npm rebuild

# Build (astro build → dist/client + dist/server, then the audit chain)
COPY . .
RUN npm run build

# Drop devDependencies so only runtime deps ship to the runtime stage.
RUN npm prune --omit=dev

# ---- Stage 2: runtime ----
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

# The standalone server entry + its prerendered client assets + runtime deps.
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
