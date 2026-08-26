# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/fine-service/package.json apps/backend/fine-service/package.json
RUN npm ci
COPY . .
RUN npm run build --workspace=@lms/fine-service
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3006
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nestjs
COPY package.json package-lock.json ./
COPY apps/backend/fine-service/package.json apps/backend/fine-service/package.json
RUN npm ci --omit=dev --workspace=@lms/fine-service --include-workspace-root=false
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/fine-service/dist apps/backend/fine-service/dist
USER nestjs
EXPOSE 3006
CMD ["node", "apps/backend/fine-service/dist/main.js"]

