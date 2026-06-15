import { prisma } from "@hockey/db";
import Link from "next/link";
import { PageContext } from "../components/page-context";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

function formatStatus(value: string) {
  return value.replace(/_/g, " ");
}

async function getRawImportBatches() {
  return prisma.rawImportBatch.findMany({
    orderBy: [{ started_at: "desc" }, { created_at: "desc" }],
    select: {
      id: true,
      source_system: true,
      source_entity: true,
      source_label: true,
      import_status: true,
      row_count: true,
      started_at: true,
      completed_at: true,
      notes: true,
      _count: {
        select: {
          raw_players: true,
          raw_teams: true,
          raw_seasons: true,
          raw_player_seasons: true,
          raw_contracts: true,
          raw_contract_years: true,
          raw_transactions: true,
          raw_roster_snapshots: true
        }
      }
    }
  });
}

function getBatchRowTotal(batch: Awaited<ReturnType<typeof getRawImportBatches>>[number]) {
  const counts = batch._count;

  return (
    counts.raw_players +
    counts.raw_teams +
    counts.raw_seasons +
    counts.raw_player_seasons +
    counts.raw_contracts +
    counts.raw_contract_years +
    counts.raw_transactions +
    counts.raw_roster_snapshots
  );
}

function EmptyState() {
  return (
    <main className="panel stack">
      <span className="eyebrow">Raw Imports</span>
      <h1>Raw ingestion workspace</h1>
      <p>There are no raw import batches in the local database yet.</p>
      <ol className="muted-list">
        <li>Keep Postgres running.</li>
        <li>Run `npm run db:seed` to load the sample local batches.</li>
        <li>Add future imports from local files only, not scraped pages.</li>
      </ol>
    </main>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <main className="stack">
      <section className="panel stack">
        <span className="eyebrow">Raw Imports</span>
        <h1>Raw ingestion workspace</h1>
        <p>The page is wired up, but the raw import tables are not reachable right now.</p>
      </section>

      <section className="warning stack">
        <strong>Database connection note</strong>
        <p>{message}</p>
      </section>
    </main>
  );
}

function BatchSummary({
  batches
}: {
  batches: Awaited<ReturnType<typeof getRawImportBatches>>;
}) {
  const totalBatches = batches.length;
  const totalSeededRows = batches.reduce(
    (sum, batch) => sum + getBatchRowTotal(batch),
    0
  );
  const loadedBatches = batches.filter(
    (batch) => batch.import_status.toLowerCase() === "loaded"
  ).length;

  return (
    <section className="stats-grid">
      <article className="stat-card">
        <span className="stat-label">Import Batches</span>
        <strong className="stat-value">{totalBatches}</strong>
        <p>Separate source loads staged before normalization runs.</p>
      </article>
      <article className="stat-card">
        <span className="stat-label">Loaded Batches</span>
        <strong className="stat-value">{loadedBatches}</strong>
        <p>Batches currently marked as ready for downstream warehouse work.</p>
      </article>
      <article className="stat-card">
        <span className="stat-label">Staged Raw Rows</span>
        <strong className="stat-value">{totalSeededRows}</strong>
        <p>Rows sitting in the `raw_*` tables, separate from normalized data.</p>
      </article>
      <article className="stat-card">
        <span className="stat-label">Source Policy</span>
        <strong className="stat-value">Local only</strong>
        <p>No scraping, no paid feeds, and no unofficial source pulls in this phase.</p>
      </article>
    </section>
  );
}

function BatchTable({
  batches
}: {
  batches: Awaited<ReturnType<typeof getRawImportBatches>>;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Batch</th>
            <th>Source</th>
            <th>Status</th>
            <th>Declared Rows</th>
            <th>Raw Table Rows</th>
            <th>Started</th>
            <th>View</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((batch) => (
            <tr key={batch.id}>
              <td>
                <div className="cell-title">
                  <strong>{batch.source_label ?? batch.source_entity}</strong>
                  <span className="caption">{batch.id}</span>
                </div>
              </td>
              <td>
                <div className="cell-title">
                  <strong>{batch.source_system}</strong>
                  <span className="caption">{batch.source_entity}</span>
                </div>
              </td>
              <td>{formatStatus(batch.import_status)}</td>
              <td>{batch.row_count ?? "Not set"}</td>
              <td>{getBatchRowTotal(batch)}</td>
              <td>{formatDate(batch.started_at)}</td>
              <td>
                <Link
                  className="button-secondary inline-button"
                  href={`/raw-imports/${batch.id}`}
                >
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function RawImportsPage() {
  try {
    const batches = await getRawImportBatches();

    if (batches.length === 0) {
      return <EmptyState />;
    }

    return (
      <main className="stack">
        <section className="panel stack">
          <div className="split">
            <div className="stack">
              <span className="eyebrow">Raw Imports</span>
              <h1>Raw ingestion workspace</h1>
            </div>
            <span className="label">{batches.length} visible batches</span>
          </div>

          <p>
            This surface keeps source rows visible before they become warehouse
            truth. It is meant for local file-based imports and sample seed data,
            not scraped web content.
          </p>

          <PageContext
            goal="Make staged source batches inspectable so future transforms can stay explainable and reversible."
            questions={[
              "Which source batch created these raw rows?",
              "How many rows are staged before normalization?",
              "Are we keeping raw source data separate from canonical warehouse tables?"
            ]}
          />

          <section className="warning stack">
            <strong>Safe sourcing note</strong>
            <p>
              This project does not scrape live websites. The raw layer is for
              local sample files, manually approved datasets, or future licensed
              feeds with documented provenance.
            </p>
          </section>

          <BatchSummary batches={batches} />
        </section>

        <section className="panel stack">
          <div className="stack">
            <span className="eyebrow">Batches</span>
            <h2>Staged source loads</h2>
            <p>Open a batch to inspect which `raw_*` tables it populated.</p>
          </div>

          <BatchTable batches={batches} />
        </section>
      </main>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error.";

    return <ErrorState message={message} />;
  }
}
