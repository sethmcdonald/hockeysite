# AGENTS.md

## Project mission

Build a hockey decision intelligence platform with a clear, trustworthy product surface and a maintainable monorepo foundation.

## Current scaffold rules

- Use `apps/web` for the main product UI.
- Use Next.js with TypeScript and the App Router for web work.
- Keep styling simple unless a later task explicitly expands the design system.
- Use `packages/db` for Prisma models, migrations, and PostgreSQL access.
- Do not add authentication yet.
- Do not connect to paid or unofficial data sources yet.
- Prefer documented placeholders over speculative product behavior.

## Product canon that must stay aligned

- `SAUCE`
- `ANCHOR`
- `Anchors Away`
- historical contracts
- cap percentage normalization

When terminology changes, update `docs/product/canon.md` in the same change.

## Working style

- Favor small, composable packages and simple dependencies.
- Document assumptions in code or docs when the product surface is still a stub.
- Avoid introducing backend services or scraping pipelines until explicitly requested.

