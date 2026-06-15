import { prisma } from "@hockey/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContext } from "../../components/page-context";

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

function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

async function getRawImportBatch(id: string) {
  return prisma.rawImportBatch.findUnique({
    where: { id },
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
      raw_players: {
        orderBy: [{ created_at: "asc" }],
        take: 3,
        select: {
          id: true,
          source_record_id: true,
          full_name: true,
          external_nhl_id: true,
          payload: true
        }
      },
      raw_teams: {
        orderBy: [{ created_at: "asc" }],
        take: 3,
        select: {
          id: true,
          source_record_id: true,
          name: true,
          abbreviation: true,
          payload: true
        }
      },
      raw_seasons: {
        orderBy: [{ created_at: "asc" }],
        take: 3,
        select: {
          id: true,
          source_record_id: true,
          season_code: true,
          start_year: true,
          payload: true
        }
      },
      raw_player_seasons: {
        orderBy: [{ created_at: "asc" }],
        take: 3,
        select: {
          id: true,
          source_record_id: true,
          source_player_id: true,
          season_code: true,
          points: true,
          payload: true
        }
      },
      raw_contracts: {
        orderBy: [{ created_at: "asc" }],
        take: 3,
        select: {
          id: true,
          source_record_id: true,
          source_player_id: true,
          term_years: true,
          total_value: true,
          payload: true
        }
      },
      raw_contract_years: {
        orderBy: [{ created_at: "asc" }],
        take: 3,
        select: {
          id: true,
          source_record_id: true,
          source_contract_id: true,
          season_code: true,
          total_salary: true,
          payload: true
        }
      },
      raw_transactions: {
        orderBy: [{ created_at: "asc" }],
        take: 3,
        select: {
          id: true,
          source_record_id: true,
          transaction_type: true,
          transaction_date: true,
          description: true,
          payload: true
        }
      },
      raw_roster_snapshots: {
        orderBy: [{ created_at: "asc" }],
        take: 3,
        select: {
          id: true,
          source_record_id: true,
          source_player_id: true,
          snapshot_date: true,
          roster_status: true,
          payload: true
        }
      },
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

type BatchRecordProps = {
  title: string;
  subtitle: string;
  payload: unknown;
};

function BatchRecord({ title, subtitle, payload }: BatchRecordProps) {
  return (
    <article className="subpanel stack">
      <div className="stack">
        <strong>{title}</strong>
        <span className="caption">{subtitle}</span>
      </div>
      <pre className="payload-block">{prettyJson(payload)}</pre>
    </article>
  );
}

function BatchSection({
  title,
  description,
  count,
  children
}: {
  title: string;
  description: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="panel stack">
      <div className="split">
        <div className="stack">
          <span className="eyebrow">{title}</span>
          <h2>{title}</h2>
        </div>
        <span className="label">{count} staged rows</span>
      </div>
      <p>{description}</p>
      {count > 0 ? children : <p>No rows from this raw table are attached to the batch.</p>}
    </section>
  );
}

export default async function RawImportBatchPage({
  params
}: {
  params: { id: string };
}) {
  const batch = await getRawImportBatch(params.id);

  if (!batch) {
    notFound();
  }

  return (
    <main className="stack">
      <section className="panel stack">
        <div className="split">
          <div className="stack">
            <span className="eyebrow">Raw Import Batch</span>
            <h1>{batch.source_label ?? batch.source_entity}</h1>
          </div>
          <span className="label">{formatStatus(batch.import_status)}</span>
        </div>

        <p>
          This batch detail view stays intentionally simple: it shows what was
          staged, how many raw rows landed, and small payload samples before any
          transform logic touches the data.
        </p>

        <PageContext
          goal="Inspect one raw source batch deeply enough to trust the staging layer before normalization work is introduced."
          questions={[
            "Which raw tables were populated by this batch?",
            "Do the source payloads look like what we expected to import?",
            "Can we trace future normalized rows back to this batch cleanly?"
          ]}
        />

        <div className="stats-grid">
          <article className="stat-card">
            <span className="stat-label">Source System</span>
            <strong className="stat-value">{batch.source_system}</strong>
            <p>Current phase uses local sample batches and manual local inputs only.</p>
          </article>
          <article className="stat-card">
            <span className="stat-label">Source Entity</span>
            <strong className="stat-value">{batch.source_entity}</strong>
            <p>Primary domain this load was meant to stage.</p>
          </article>
          <article className="stat-card">
            <span className="stat-label">Declared Rows</span>
            <strong className="stat-value">{batch.row_count ?? 0}</strong>
            <p>Top-line row count recorded for the batch itself.</p>
          </article>
          <article className="stat-card">
            <span className="stat-label">Batch Timing</span>
            <strong className="stat-value">{formatDate(batch.started_at)}</strong>
            <p>Completed {formatDate(batch.completed_at)}.</p>
          </article>
        </div>

        <div className="detail-grid">
          <article className="subpanel stack">
            <h3>Notes</h3>
            <p>{batch.notes ?? "No batch notes were recorded."}</p>
          </article>
          <article className="warning stack">
            <strong>Source policy</strong>
            <p>
              This raw layer is for local files, sample data, and future approved
              licensed feeds. It is not a web scraping surface.
            </p>
          </article>
        </div>

        <div className="chip-row">
          <Link className="button-secondary inline-button" href="/raw-imports">
            Back to batches
          </Link>
          <Link className="button-secondary inline-button" href="/contracts">
            View normalized contracts
          </Link>
        </div>
      </section>

      <BatchSection
        title="Raw Players"
        description="Identity rows are staged first so canonical player mapping can stay explainable later."
        count={batch._count.raw_players}
      >
        <div className="detail-grid">
          {batch.raw_players.map((record) => (
            <BatchRecord
              key={record.id}
              title={record.full_name ?? "Unnamed raw player"}
              subtitle={`${record.source_record_id} | NHL ID ${record.external_nhl_id ?? "n/a"}`}
              payload={record.payload}
            />
          ))}
        </div>
      </BatchSection>

      <BatchSection
        title="Raw Teams"
        description="Team source rows stay separate until we decide how to normalize relocations, naming, and IDs."
        count={batch._count.raw_teams}
      >
        <div className="detail-grid">
          {batch.raw_teams.map((record) => (
            <BatchRecord
              key={record.id}
              title={record.name ?? "Unnamed raw team"}
              subtitle={`${record.source_record_id} | ${record.abbreviation ?? "no abbr"}`}
              payload={record.payload}
            />
          ))}
        </div>
      </BatchSection>

      <BatchSection
        title="Raw Seasons"
        description="Season rows let the raw layer preserve original cap-era inputs before canonical season matching."
        count={batch._count.raw_seasons}
      >
        <div className="detail-grid">
          {batch.raw_seasons.map((record) => (
            <BatchRecord
              key={record.id}
              title={record.season_code ?? "Unknown season"}
              subtitle={`${record.source_record_id} | Start ${record.start_year ?? "n/a"}`}
              payload={record.payload}
            />
          ))}
        </div>
      </BatchSection>

      <BatchSection
        title="Raw Player Seasons"
        description="Performance rows stay raw so split-team seasons and duplicate source rows can be reconciled later."
        count={batch._count.raw_player_seasons}
      >
        <div className="detail-grid">
          {batch.raw_player_seasons.map((record) => (
            <BatchRecord
              key={record.id}
              title={record.source_player_id ?? "Unknown source player"}
              subtitle={`${record.source_record_id} | ${record.season_code ?? "n/a"} | ${record.points ?? 0} points`}
              payload={record.payload}
            />
          ))}
        </div>
      </BatchSection>

      <BatchSection
        title="Raw Contracts"
        description="Agreement-level contract rows are staged here before we map them into canonical player, team, and season IDs."
        count={batch._count.raw_contracts}
      >
        <div className="detail-grid">
          {batch.raw_contracts.map((record) => (
            <BatchRecord
              key={record.id}
              title={record.source_player_id ?? "Unknown source player"}
              subtitle={`${record.source_record_id} | ${record.term_years ?? 0} years | ${record.total_value ?? "n/a"}`}
              payload={record.payload}
            />
          ))}
        </div>
      </BatchSection>

      <BatchSection
        title="Raw Contract Years"
        description="Year-by-year salary rows stay independent so contract math can be checked before normalization."
        count={batch._count.raw_contract_years}
      >
        <div className="detail-grid">
          {batch.raw_contract_years.map((record) => (
            <BatchRecord
              key={record.id}
              title={record.source_contract_id ?? "Unknown source contract"}
              subtitle={`${record.source_record_id} | ${record.season_code ?? "n/a"} | ${record.total_salary ?? "n/a"}`}
              payload={record.payload}
            />
          ))}
        </div>
      </BatchSection>

      <BatchSection
        title="Raw Transactions"
        description="Transaction event rows are visible here before any modeling or intent inference is layered on top."
        count={batch._count.raw_transactions}
      >
        <div className="detail-grid">
          {batch.raw_transactions.map((record) => (
            <BatchRecord
              key={record.id}
              title={record.transaction_type ?? "Unknown transaction"}
              subtitle={`${record.source_record_id} | ${formatDate(record.transaction_date)}`}
              payload={record.payload}
            />
          ))}
        </div>
      </BatchSection>

      <BatchSection
        title="Raw Roster Snapshots"
        description="Roster state rows stay raw so historical availability and status can be reprocessed safely later."
        count={batch._count.raw_roster_snapshots}
      >
        <div className="detail-grid">
          {batch.raw_roster_snapshots.map((record) => (
            <BatchRecord
              key={record.id}
              title={record.source_player_id ?? "Unknown source player"}
              subtitle={`${record.source_record_id} | ${record.roster_status ?? "n/a"} | ${formatDate(record.snapshot_date)}`}
              payload={record.payload}
            />
          ))}
        </div>
      </BatchSection>
    </main>
  );
}
