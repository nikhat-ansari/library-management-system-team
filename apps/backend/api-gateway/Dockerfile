# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/api-gateway/package.json apps/backend/api-gateway/package.json
RUN npm ci
COPY . .
RUN npm run build --workspace=@lms/api-gateway

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nestjs
COPY package.json package-lock.json ./
COPY apps/backend/api-gateway/package.json apps/backend/api-gateway/package.json
RUN npm ci --omit=dev --workspace=@lms/api-gateway --include-workspace-root=false
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/api-gateway/dist apps/backend/api-gateway/dist
USER nestjs
EXPOSE 3000
CMD ["node", "apps/backend/api-gateway/dist/main.js"]
