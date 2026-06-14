# Hockey Decision Intelligence Platform

Initial monorepo scaffold for a hockey decision intelligence platform.

## What is included

- `apps/web`: Next.js app using TypeScript and the App Router.
- `packages/db`: Prisma package configured for PostgreSQL.
- `docs/product/canon.md`: core product language and canon definitions.
- `AGENTS.md`: working instructions for future contributors and coding agents.
- `docker-compose.yml`: local PostgreSQL service for development.

## Setup

1. Install dependencies:

```bash
corepack enable
pnpm install
```

2. Copy the example environment file and set a PostgreSQL connection string:

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Start the local PostgreSQL container:

```bash
pnpm db:start
```

4. Generate the Prisma client:

```bash
pnpm db:generate
```

5. Push the schema to your local database:

```bash
pnpm db:push
```

6. Seed the sample hockey dataset:

```bash
pnpm db:seed
```

7. Start the web app:

```bash
pnpm dev
```

## Useful commands

```bash
pnpm build
pnpm lint
pnpm typecheck
pnpm db:start
pnpm db:stop
pnpm db:push
pnpm db:seed
pnpm db:migrate
pnpm db:studio
```

## Database notes

- The Prisma schema now models the initial hockey core: teams, players, contracts, transactions, and anchor scenarios.
- The current schema is intentionally local-first and does not assume any paid or unofficial source integration.
- `Contract.capPercentage` and `Contract.normalizedSeason` are included so cap percentage normalization can become a first-class workflow later.
- `pnpm db:seed` loads a tiny local contracts dataset so `/contracts` has real rows to render immediately.

## Test notes

- This scaffold still has placeholder pages only; no authentication or external data integrations are wired yet.
- Local verification now covers Prisma generation, web lint, typecheck, and production build.
- `pnpm db:start` and `pnpm db:push` are the intended first local database boot path.
- The default connection string uses `127.0.0.1` instead of `localhost` to avoid Windows host resolution quirks with local Postgres containers.
