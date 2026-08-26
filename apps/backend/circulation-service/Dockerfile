# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/circulation-service/package.json apps/backend/circulation-service/package.json
RUN npm ci
COPY . .
RUN npm run build --workspace=@lms/circulation-service
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3004
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nestjs
COPY package.json package-lock.json ./
COPY apps/backend/circulation-service/package.json apps/backend/circulation-service/package.json
RUN npm ci --omit=dev --workspace=@lms/circulation-service --include-workspace-root=false
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/circulation-service/dist apps/backend/circulation-service/dist
USER nestjs
EXPOSE 3004
CMD ["node", "apps/backend/circulation-service/dist/main.js"]

