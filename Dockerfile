# syntax=docker/dockerfile:1

# Next.js 16 braucht Node >= 20.9 (vgl. README). Node 22 LTS als Basis.
FROM node:22-alpine AS base

# ---------- 1) Abhängigkeiten installieren ----------
FROM base AS deps
# libc6-compat wird von einigen nativen Modulen unter Alpine benötigt
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- 2) Build (Standalone-Output) ----------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------- 3) Laufzeit-Image ----------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Standalone-Server hört standardmäßig auf 0.0.0.0:3000
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Persistenter Datenordner (JSON-Dateien, siehe lib/storage.ts).
# Der Container läuft als `node` (uid 1000) – derselbe uid wie der typische
# erste Host-Nutzer. Ein Bind-Mount auf einen Ordner des Host-Nutzers ist
# dadurch ohne `chown` beschreibbar.
RUN mkdir -p /app/data && chown node:node /app/data

COPY --from=builder /app/public ./public
RUN mkdir -p .next && chown node:node .next

# Standalone-Output enthält nur die benötigten Laufzeit-Dateien.
# `public/` und `.next/static` werden nicht automatisch mitkopiert.
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Nicht-root: der im Basis-Image vorhandene `node`-Nutzer (uid 1000)
USER node
EXPOSE 3000

CMD ["node", "server.js"]
