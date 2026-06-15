# Hockey Decision Intelligence Platform

Initial monorepo scaffold for a hockey decision intelligence platform.

## What is included

- `apps/web`: Next.js app using TypeScript and the App Router.
- `packages/db`: Prisma package configured for PostgreSQL.
- `docs/product/canon.md`: core product language and canon definitions.
- `AGENTS.md`: working instructions for future contributors and coding agents.
- `docker-compose.yml`: local PostgreSQL service for development.

## Database purpose

Phase 1 builds the NHL Salary Cap Era warehouse foundation for `2005-present`.
This database is meant to become the clean source of truth under future
decision-intelligence products, including player evaluation, contract analysis,
trade context, and roster construction workflows.

The current database package is intentionally focused on structure, not models:

- Raw ingestion tables that stage source rows before normalization.
- Canonical identity tables for players, teams, and seasons.
- Normalized season and roster history tables.
- Full contracts plus season-by-season contract breakdowns.
- Optional metrics layers for advanced, tracking, and internal feature rows.

## Table categories

- Raw ingestion: `raw_import_batches`, `raw_players`, `raw_teams`, `raw_seasons`, `raw_player_seasons`, `raw_contracts`, `raw_contract_years`, `raw_transactions`, `raw_roster_snapshots`
- Identity: `players`, `teams`, `seasons`
- Seasonal performance: `player_seasons`, `team_seasons`
- Contracts: `contracts`, `contract_years`
- Historical events: `transactions`, `roster_snapshots`
- Metrics layers: `player_advanced_seasons`, `player_tracking_seasons`, `player_features`

The raw ingestion layer is where source rows land first. The normalized
application tables stay separate so transforms can be re-run without losing the
original source payloads.

For players, the schema now keeps two different ID concepts separate:

- `player_number_id`: our internal stable sequential player number, starting at `1`
- `external_nhl_id`: a real NHL reference ID only when one is actually known

## Setup

1. Install dependencies:

```bash
npm install
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
npm run db:start
```

4. Generate the Prisma client:

```bash
npm run db:generate
```

This step also syncs Prisma's generated runtime files into the Next.js app so
server-rendered pages can query PostgreSQL correctly on Windows.

5. Run the initial migration:

```bash
npm run db:migrate
```

6. Seed the sample hockey dataset:

```bash
npm run db:seed
```

7. Validate the seeded data:

```bash
npm run db:validate
```

8. Start the web app:

```bash
npm run dev
```

## Useful commands

```bash
npm run build
npm run lint
npm run typecheck
npm run db:start
npm run db:stop
npm run db:generate
npm run db:migrate
npm run db:push
npm run db:seed
npm run db:validate
npm run db:studio
npm run import:raw:players -- --file ../../imports/raw/players.sample.csv
npm run import:raw:players -- --file ../../imports/raw/players-detroit.sample.csv --source-label "Detroit player CSV import"
npm run import:raw:teams -- --file ../../imports/raw/teams-detroit.sample.csv --source-label "Detroit team CSV import"
```

## Seed contents

The sample seed is intentionally small and readable. It loads:

- sample raw import batches
- sample raw player, team, season, contract, contract-year, roster, and transaction rows
- 3 players
- 3 teams
- 3 seasons
- sample player season rows
- sample team season rows
- sample contracts
- sample contract years
- sample transactions
- sample roster snapshots
- sample advanced metrics
- sample tracking metrics
- sample feature rows

## Local player CSV import

The first raw import utility is intentionally simple and safe:

- It imports a local CSV file that you provide.
- It writes a new `raw_import_batches` row plus `raw_players` rows.
- It does not scrape websites or call live endpoints.

Required CSV headers:

```text
source_record_id,external_nhl_id,full_name,birth_date,position_raw,shoots_catches_raw,source_updated_at
```

Example command from the repo root:

```bash
npm run import:raw:players -- --file ../../imports/raw/players.sample.csv
```

Detroit-only example:

```bash
npm run import:raw:players -- --file ../../imports/raw/players-detroit.sample.csv --source-label "Detroit player CSV import" --notes "Local Detroit-only player sample"
```

Optional flags:

```text
--source-system local_csv
--source-label "Manual player CSV import"
--notes "Anything helpful about where this file came from"
```

After the import finishes, open `/raw-imports` in the local app to inspect the new batch.

## Local team CSV import

The first raw team importer follows the same local-only rule:

- It imports a local CSV file that you provide.
- It writes a new `raw_import_batches` row plus `raw_teams` rows.
- It does not scrape websites or call live endpoints.

Required CSV headers:

```text
source_record_id,external_nhl_id,name,abbreviation,city,conference,division,source_updated_at
```

Detroit-only example:

```bash
npm run import:raw:teams -- --file ../../imports/raw/teams-detroit.sample.csv --source-label "Detroit team CSV import" --notes "Local Detroit team sample"
```

## What is intentionally not included yet

- No live scraping or unofficial source ingestion
- No paid data source integrations
- No automated transforms from `raw_*` into normalized tables yet
- No machine learning or projection models
- No SAUCE logic
- No ANCHOR logic or contract-risk scoring
- No authentication
- No production ETL or background services

## Notes

- The default connection string uses `127.0.0.1` instead of `localhost` to avoid Windows host resolution quirks with local Postgres containers.
- The sample `.env` in this repo uses port `5433` because the local Docker container is mapped from host port `5433` to container port `5432`.
- `npm run db:push` still exists for fast local iteration, but the intended phase-1 workflow is `migrate -> seed -> validate`.
- The sample dataset is for local development only. It is not a full historical NHL feed.
