# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/user-service/package.json apps/backend/user-service/package.json
RUN npm ci
COPY . .
RUN npm run build --workspace=@lms/user-service
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3002
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nestjs
COPY package.json package-lock.json ./
COPY apps/backend/user-service/package.json apps/backend/user-service/package.json
RUN npm ci --omit=dev
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/user-service/dist apps/backend/user-service/dist
USER nestjs
EXPOSE 3002
CMD ["node", "apps/backend/user-service/dist/main.js"]
