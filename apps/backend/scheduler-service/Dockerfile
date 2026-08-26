# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/scheduler-service/package.json apps/backend/scheduler-service/package.json
RUN npm ci
COPY . .
RUN npm run build --workspace=@lms/scheduler-service
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3012
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nestjs
COPY package.json package-lock.json ./
COPY apps/backend/scheduler-service/package.json apps/backend/scheduler-service/package.json
RUN npm ci --omit=dev --workspace=@lms/scheduler-service --include-workspace-root=false
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/scheduler-service/dist apps/backend/scheduler-service/dist
USER nestjs
EXPOSE 3012
CMD ["node", "apps/backend/scheduler-service/dist/main.js"]
