# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/ai-service/package.json apps/backend/ai-service/package.json
RUN npm ci
COPY . .
RUN npm run build --workspace=@lms/ai-service
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3011
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nestjs
COPY package.json package-lock.json ./
COPY apps/backend/ai-service/package.json apps/backend/ai-service/package.json
RUN npm ci --omit=dev --workspace=@lms/ai-service --include-workspace-root=false
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/ai-service/dist apps/backend/ai-service/dist
USER nestjs
EXPOSE 3011
CMD ["node", "apps/backend/ai-service/dist/main.js"]

