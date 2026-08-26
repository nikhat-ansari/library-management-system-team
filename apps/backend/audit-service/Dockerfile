# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/audit-service/package.json apps/backend/audit-service/package.json
RUN npm ci
COPY . .
RUN npm run build --workspace=@lms/audit-service
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3010
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nestjs
COPY package.json package-lock.json ./
COPY apps/backend/audit-service/package.json apps/backend/audit-service/package.json
RUN npm ci --omit=dev --workspace=@lms/audit-service --include-workspace-root=false
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/audit-service/dist apps/backend/audit-service/dist
USER nestjs
EXPOSE 3010
CMD ["node", "apps/backend/audit-service/dist/main.js"]

