# syntax=docker/dockerfile:1.6
#
# Multi-stage build for the Pro Exteriors Astro site (hybrid output).
#  1. node:22-alpine builds to /app/dist (prerendered pages + standalone server)
#  2. node:22-alpine runs the standalone SSR server on port 4321
#
# The site is `output: "hybrid"` + @astrojs/node (standalone): every marketing
# page is prerendered static; only /api/contact and /api/contact-sync run on the
# Node server. The server serves the prerendered pages AND the API routes, so a
# single Node runtime replaces the old nginx-static stage.
#
# Coolify "dockerfile" build pack consumes this. NOTE: the exposed port changed
# from 80 → 4321 — update the Coolify port mapping accordingly.

# ---- Stage 1: build ----
FROM node:22-alpine AS build
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

# PUBLIC_ vars must be present at BUILD time for astro/vite to inline them into
# import.meta.env. Coolify passes "Available at Buildtime" env as build args;
# declare them here so the Dockerfile build pack inlines them (nixpacks does this
# automatically — this keeps parity). Runtime reads still prefer process.env.
ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_SUPABASE_ANON_KEY
ARG PUBLIC_GA4_MEASUREMENT_ID
ARG PUBLIC_POSTHOG_KEY
ENV PUBLIC_SUPABASE_URL=$PUBLIC_SUPABASE_URL \
    PUBLIC_SUPABASE_ANON_KEY=$PUBLIC_SUPABASE_ANON_KEY \
    PUBLIC_GA4_MEASUREMENT_ID=$PUBLIC_GA4_MEASUREMENT_ID \
    PUBLIC_POSTHOG_KEY=$PUBLIC_POSTHOG_KEY

# Build (astro build → dist/client + dist/server, then the audit chain)
COPY . .
RUN npm run build

# Drop devDependencies so only runtime deps ship to the runtime stage.
RUN npm prune --omit=dev

# ---- Stage 2: runtime ----
FROM node:22-alpine AS runtime
WORKDIR /app

# curl is required for Coolify's container healthcheck (node:22-alpine ships
# without it). Without curl the healthcheck fails and Coolify rolls back to the
# previous container — silently keeping stale env/config live.
RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

# Container-level healthcheck against the SSR server (belt-and-suspenders with
# Coolify's own check). Hits the prerendered homepage served by the Node server.
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -fsS http://localhost:4321/ || exit 1

# The standalone server entry + its prerendered client assets + runtime deps.
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
