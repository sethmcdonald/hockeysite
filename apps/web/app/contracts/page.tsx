import { prisma } from "@hockey/db";

export const dynamic = "force-dynamic";

type ContractRow = {
  id: string;
  player: {
    fullName: string;
    position: string | null;
  };
  team: {
    name: string;
    abbreviation: string;
  };
  startSeason: number;
  endSeason: number;
  capHitUsd: number | null;
  capPercentage: number | null;
  normalizedSeason: string | null;
  isHistorical: boolean;
  sourceLabel: string | null;
};

function formatMoney(value: number | null) {
  if (value === null) {
    return "TBD";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "TBD";
  }

  return `${value.toFixed(2)}%`;
}

async function getContracts() {
  return prisma.contract.findMany({
    orderBy: [{ capPercentage: "desc" }, { startSeason: "desc" }],
    select: {
      id: true,
      startSeason: true,
      endSeason: true,
      capHitUsd: true,
      capPercentage: true,
      normalizedSeason: true,
      isHistorical: true,
      sourceLabel: true,
      player: {
        select: {
          fullName: true,
          position: true
        }
      },
      team: {
        select: {
          name: true,
          abbreviation: true
        }
      }
    }
  });
}

function ContractsTable({ contracts }: { contracts: ContractRow[] }) {
  return (
    <div className="panel stack">
      <div className="split">
        <div className="stack">
          <span className="eyebrow">Contracts</span>
          <h1>Contract analysis workspace</h1>
        </div>
        <span className="label">{contracts.length} seeded contracts</span>
      </div>

      <p>
        This first slice is local and intentionally small. It gives us a place
        to inspect historical contracts and cap percentage normalization before
        we add external ingestion.
      </p>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Team</th>
              <th>Term</th>
              <th>Cap Hit</th>
              <th>Cap %</th>
              <th>Normalized Season</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract) => (
              <tr key={contract.id}>
                <td>
                  <div className="cell-title">
                    <strong>{contract.player.fullName}</strong>
                    <span className="caption">
                      {contract.player.position ?? "Position TBD"}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="cell-title">
                    <strong>{contract.team.abbreviation}</strong>
                    <span className="caption">{contract.team.name}</span>
                  </div>
                </td>
                <td>
                  {contract.startSeason}-{contract.endSeason}
                </td>
                <td>{formatMoney(contract.capHitUsd)}</td>
                <td>{formatPercent(contract.capPercentage)}</td>
                <td>{contract.normalizedSeason ?? "Not normalized yet"}</td>
                <td>
                  <div className="cell-title">
                    <strong>
                      {contract.isHistorical ? "Historical" : "Current"}
                    </strong>
                    <span className="caption">
                      {contract.sourceLabel ?? "Local seed"}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <main className="panel stack">
      <span className="eyebrow">Contracts</span>
      <h1>Contract analysis workspace</h1>
      <p>
        The contracts table is wired up, but there is no seeded data yet in
        your local database.
      </p>
      <ol className="muted-list">
        <li>Start Postgres with `pnpm db:start`.</li>
        <li>Apply the schema with `pnpm db:push`.</li>
        <li>Seed sample contracts with `pnpm db:seed`.</li>
      </ol>
    </main>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <main className="stack">
      <section className="panel stack">
        <span className="eyebrow">Contracts</span>
        <h1>Contract analysis workspace</h1>
        <p>
          The page is connected to Prisma, but the database is not available to
          query yet.
        </p>
      </section>

      <section className="warning stack">
        <strong>Database connection note</strong>
        <p>{message}</p>
        <ol className="muted-list">
          <li>Start Postgres with `pnpm db:start`.</li>
          <li>Copy `.env.example` to `.env` if needed.</li>
          <li>Run `pnpm db:push` and then `pnpm db:seed`.</li>
        </ol>
      </section>
    </main>
  );
}

export default async function ContractsPage() {
  try {
    const contracts = await getContracts();

    if (contracts.length === 0) {
      return <EmptyState />;
    }

    return <ContractsTable contracts={contracts} />;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error.";

    return <ErrorState message={message} />;
  }
}
