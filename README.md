# Hockey Decision Intelligence Platform

Initial monorepo scaffold for a hockey decision intelligence platform.

## What is included

- `apps/web`: Next.js app using TypeScript and the App Router.
- `packages/db`: Prisma package configured for PostgreSQL.
- `docs/product/canon.md`: core product language and canon definitions.
- `AGENTS.md`: working instructions for future contributors and coding agents.

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

3. Generate the Prisma client:

```bash
pnpm db:generate
```

4. Start the web app:

```bash
pnpm dev
```

## Useful commands

```bash
pnpm build
pnpm lint
pnpm typecheck
pnpm db:migrate
```

## Test notes

- This scaffold has placeholder pages only; no authentication or external data integrations are wired yet.
- In this workspace, dependencies were not installed, so `build`, `lint`, `typecheck`, and Prisma generation were not executed locally.
- After `pnpm install`, the main smoke-check path is `pnpm lint`, `pnpm typecheck`, and `pnpm build`.
