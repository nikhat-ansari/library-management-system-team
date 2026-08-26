# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/report-service/package.json apps/backend/report-service/package.json
RUN npm ci
COPY . .
RUN npm run build --workspace=@lms/report-service
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3009
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nestjs
COPY package.json package-lock.json ./
COPY apps/backend/report-service/package.json apps/backend/report-service/package.json
RUN npm ci --omit=dev --workspace=@lms/report-service --include-workspace-root=false
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/report-service/dist apps/backend/report-service/dist
USER nestjs
EXPOSE 3009
CMD ["node", "apps/backend/report-service/dist/main.js"]

