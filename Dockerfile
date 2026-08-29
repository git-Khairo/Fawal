# syntax=docker/dockerfile:1

# Multi-stage so the shipped image carries the built server and nothing else:
# no toolchain, no dev dependencies, no source.

FROM node:22-alpine AS base
# Next's precompiled binaries expect glibc symbols that Alpine omits.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ---- dependencies --------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- build ---------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# public/ has to be present here, not only at runtime: pages are prerendered at
# build time and resolveProductImage() reads the filesystem to decide whether a
# photograph exists or the material placeholder is drawn instead.
RUN npm run build

# ---- runtime -------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/ar').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
