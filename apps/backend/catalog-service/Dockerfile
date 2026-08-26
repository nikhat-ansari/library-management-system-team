# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/catalog-service/package.json apps/backend/catalog-service/package.json
RUN npm ci
COPY . .
RUN npm run build --workspace=@lms/catalog-service
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3003
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nestjs
COPY package.json package-lock.json ./
COPY apps/backend/catalog-service/package.json apps/backend/catalog-service/package.json
RUN npm ci --omit=dev --workspace=@lms/catalog-service --include-workspace-root=false
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/catalog-service/dist apps/backend/catalog-service/dist
USER nestjs
EXPOSE 3003
CMD ["node", "apps/backend/catalog-service/dist/main.js"]

