# syntax=docker/dockerfile:1.6
#
# Multi-stage build for the Pro Exteriors Astro site.
#  1. node:20-alpine builds the static output to /app/dist
#  2. nginx:alpine serves the built assets on port 80
#
# Coolify "dockerfile" build pack consumes this. Do not switch back to the
# "static" build pack — that pack only copies the repo verbatim and skips
# `npm run build`.

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

# Build (runs astro build + audit:schema + audit:silo + audit:orphans)
COPY . .
RUN npm run build

# ---- Stage 2: runtime ----
FROM nginx:alpine AS runtime

# Replace the default site config with one that serves /usr/share/nginx/html,
# adds a basic 404, and rewrites trailing-slash URLs cleanly.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Astro emits per-route index.html files under directories matching the
# canonical paths, so static serving is sufficient.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
