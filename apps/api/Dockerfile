# Build context is the repo root (pnpm workspace), not this directory.
# Build: docker build -f apps/api/Dockerfile -t webbriks-api .

FROM node:22-alpine AS base
RUN apk add --no-cache openssl
RUN corepack enable
WORKDIR /app

FROM base AS build
RUN apk add --no-cache python3 make g++
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
COPY packages/config/package.json packages/config/package.json
RUN pnpm install --frozen-lockfile

COPY packages packages
COPY apps/api apps/api
RUN pnpm --filter @webbriks/shared-types build
RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app /app
EXPOSE 4000
CMD ["sh", "-c", "pnpm --filter api exec prisma migrate deploy && node apps/api/dist/main.js"]
