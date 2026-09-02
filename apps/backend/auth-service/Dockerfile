# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/auth-service/package.json apps/backend/auth-service/package.json
RUN npm ci
COPY . .
RUN npm run build --workspace=@lms/auth-service
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3001
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nestjs
COPY package.json package-lock.json ./
COPY apps/backend/auth-service/package.json apps/backend/auth-service/package.json
RUN npm ci --omit=dev
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/auth-service/dist apps/backend/auth-service/dist
USER nestjs
EXPOSE 3001
CMD ["node", "apps/backend/auth-service/dist/main.js"]
