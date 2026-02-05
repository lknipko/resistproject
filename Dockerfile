FROM node:20.18-alpine3.20 AS base

# Cache buster - change this value to force rebuild
ARG CACHEBUST=2026-02-04-v2
RUN echo "Cache bust: ${CACHEBUST}"

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy package files from resist-project subdirectory
COPY resist-project/package.json resist-project/package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY resist-project/ .

# Generate Prisma Client
RUN npx prisma generate

# Ensure public directory exists
RUN mkdir -p public

# Debug: Check if content directory exists
RUN ls -la content/ || echo "Content directory not found!"
RUN ls -la content/learn/ || echo "Learn directory not found!"
RUN ls -la content/act/ || echo "Act directory not found!"

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy content directory (MDX files)
COPY --from=builder /app/content ./content

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma files for migrations (if needed at runtime)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Copy migration startup script
COPY --from=builder /app/migrate-and-start.js ./migrate-and-start.js

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "migrate-and-start.js"]
