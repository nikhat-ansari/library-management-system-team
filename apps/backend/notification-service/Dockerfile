# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/notification-service/package.json apps/backend/notification-service/package.json
RUN npm ci
COPY . .
RUN npm run build --workspace=@lms/notification-service
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3008
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nestjs
COPY package.json package-lock.json ./
COPY apps/backend/notification-service/package.json apps/backend/notification-service/package.json
RUN npm ci --omit=dev --workspace=@lms/notification-service --include-workspace-root=false
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/notification-service/dist apps/backend/notification-service/dist
USER nestjs
EXPOSE 3008
CMD ["node", "apps/backend/notification-service/dist/main.js"]

