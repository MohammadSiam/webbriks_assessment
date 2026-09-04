# Webbriks Mini Kanban Board

A full-stack Kanban board: token-based auth, board ownership + sharing with
role-based access control, Board/Column/Task CRUD, drag-and-drop with a
conflict-free move endpoint, and dark-mode support.

## Stack

- **Monorepo:** Turborepo + pnpm workspaces (`apps/web`, `apps/api`, `packages/shared-types`, `packages/config`)
- **Backend:** NestJS, PostgreSQL, Prisma (driver-adapter mode via `@prisma/adapter-pg`), Zod validation, JWT auth
- **Frontend:** Next.js (App Router), react-hook-form + Zod, `@hello-pangea/dnd`, Tailwind CSS
- **Shared contracts:** `packages/shared-types` — Zod schemas + inferred types used by both apps, so a request body is validated with the exact same shape it's typed with on the frontend

## Architecture notes

- **Ordering:** columns and tasks use string-based fractional indexing (`fractional-indexing`) instead of integer positions. Moving an item only ever updates that one row — no renumbering transaction across a whole column. A `@@unique([columnId, position])` constraint turns a race between two concurrent moves into a Postgres conflict, which `tasks.service.ts`'s `move()` catches and retries (bounded) before returning `409`.
- **Access control:** a single declarative `BoardAccessGuard` + `@RequireBoardRole(role)` + `@ResolveBoardIdFrom(...)` decorator pair, applied per-route, resolves the board a request touches (directly, or via a `columnId`/`taskId` param) and checks the caller's role in one query. `boardId` is denormalized onto `Column` and `Task` specifically so this stays a single indexed lookup.
- **Response envelope:** every response follows one shape — `{ success: true, data }` on success, `{ success: false, message, error }` on failure — applied globally via a `ResponseInterceptor`/`HttpExceptionFilter`, so the frontend's `api-client.ts` unwraps it in exactly one place.
- **Auth:** a single long-lived JWT (7-day expiry) in `localStorage`, `Authorization: Bearer` header. See [Known limitations](#known-limitations-and-production-considerations) for what a production setup would do differently.

## Prerequisites

- Node.js 22+ (see `.nvmrc`)
- pnpm (`corepack enable` picks up the pinned version automatically)
- Docker + Docker Compose (either setup path uses it for Postgres)

## Setup

Clone the repo, then pick one of the two paths below.

### Path A — `pnpm dev` (Postgres in Docker, apps run on the host)

```bash
pnpm install

# env files — defaults already work for local dev
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

docker compose -f infra/docker-compose.db.yml up -d

pnpm --filter api exec prisma migrate deploy
pnpm --filter api run prisma:seed   # optional: 2 demo users + 1 demo board

pnpm dev   # api on :4000, web on :3000
```

Demo login (from the seed script): `owner@webbriks.local` / `password123` (owns the seeded board), `member@webbriks.local` / `password123` (shared as EDITOR).

### Path B — `docker compose up --build` (everything containerized)

```bash
cp .env.example .env
# edit .env and set JWT_SECRET — it has no default and the api container
# will refuse to start without it (generate one with: openssl rand -base64 32)

docker compose up --build
```

This builds and runs Postgres, the API (running `prisma migrate deploy` on startup, then the server), and the web app — reachable at `http://localhost:3000` / `http://localhost:4000` once healthy. To seed demo data into the containerized DB: `docker compose exec api pnpm --filter api run prisma:seed`.

Each compose file is independently runnable for its own concern, e.g. `docker compose -f infra/docker-compose.db.yml up -d` on its own exposes Postgres on `localhost:5433` for a local pgAdmin/DBeaver connection without starting the app containers. Run compose commands from the repo root so the three files resolve as one project.

### Tests

```bash
pnpm turbo run test          # unit tests (fractional-index ordering, etc.)
pnpm --filter api test:e2e   # e2e tests — needs the DB up and apps/api/.env present
```

### Swagger

With the API running: `http://localhost:4000/api/docs`.

## Environment variables

| Variable | Used by | Purpose |
|---|---|---|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | `infra/docker-compose.db.yml` | Postgres container credentials/database name |
| `POSTGRES_PORT` | `infra/docker-compose.db.yml` | Host port Postgres is published on (default `5433`, avoids clashing with a local Postgres on `5432`) |
| `DATABASE_URL` | `apps/api` (local dev) | Full Postgres connection string; the containerized api instead builds this itself from the `POSTGRES_*` vars |
| `JWT_SECRET` | `apps/api` | Signs auth tokens. No default — required |
| `CORS_ORIGIN` | `apps/api` | Origin allowed to call the API (the web app's URL) |
| `PORT` | `apps/api` | Port the API listens on (default `4000`) |
| `NEXT_PUBLIC_API_URL` | `apps/web` | Base URL the frontend calls. For Docker, this is baked into the browser bundle at *build* time (see `apps/web/Dockerfile`), not read at runtime |

## Known limitations and production considerations

- **No key-rebalancing job for fractional-index positions.** Positions are short base62 strings that get longer the more times you insert between the same two neighbors. In practice a board would need an enormous number of moves between the same two items before this became a real concern, but a production system would run a periodic job to rebalance a column's/board's positions back to short, evenly-spaced keys.
- **Single long-lived JWT, no refresh rotation.** Chosen for simplicity within the assessment timeframe. Production would use a short-lived access token with refresh-token rotation, or a Redis-backed session/user cache to support fast revocation without a DB round-trip on every authenticated request.
- **No ownership transfer.** A board's owner is fixed at creation; transferring ownership isn't implemented.
- **No live deployment.** This README covers local/Docker setup only.
