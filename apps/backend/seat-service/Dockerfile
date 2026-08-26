# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/seat-service/package.json apps/backend/seat-service/package.json
RUN npm ci
COPY . .
RUN npm run build --workspace=@lms/seat-service
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3007
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nestjs
COPY package.json package-lock.json ./
COPY apps/backend/seat-service/package.json apps/backend/seat-service/package.json
RUN npm ci --omit=dev --workspace=@lms/seat-service --include-workspace-root=false
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/seat-service/dist apps/backend/seat-service/dist
USER nestjs
EXPOSE 3007
CMD ["node", "apps/backend/seat-service/dist/main.js"]

