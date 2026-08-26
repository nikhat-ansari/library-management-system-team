# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/reservation-service/package.json apps/backend/reservation-service/package.json
RUN npm ci
COPY . .
RUN npm run build --workspace=@lms/reservation-service
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3005
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nestjs
COPY package.json package-lock.json ./
COPY apps/backend/reservation-service/package.json apps/backend/reservation-service/package.json
RUN npm ci --omit=dev --workspace=@lms/reservation-service --include-workspace-root=false
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/reservation-service/dist apps/backend/reservation-service/dist
USER nestjs
EXPOSE 3005
CMD ["node", "apps/backend/reservation-service/dist/main.js"]

