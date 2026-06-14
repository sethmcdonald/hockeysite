import { prisma } from "@hockey/db";
import Link from "next/link";
import { PageContext } from "../components/page-context";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  era?: string;
  sort?: string;
};

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

type ContractsSummary = {
  averageCapPercentage: number | null;
  currentContracts: number;
  historicalContracts: number;
  highestCapContract: ContractRow | null;
};

const sortOptions = [
  { value: "cap-desc", label: "Cap % (High to Low)" },
  { value: "cap-asc", label: "Cap % (Low to High)" },
  { value: "caphit-desc", label: "Cap Hit (High to Low)" },
  { value: "player-asc", label: "Player (A to Z)" },
  { value: "team-asc", label: "Team (A to Z)" },
  { value: "season-desc", label: "Newest Start Season" }
] as const;

function buildContractsUrl(searchParams: SearchParams) {
  const params = new URLSearchParams();

  if (searchParams.q?.trim()) {
    params.set("q", searchParams.q.trim());
  }

  if (searchParams.era && searchParams.era !== "all") {
    params.set("era", searchParams.era);
  }

  if (searchParams.sort && searchParams.sort !== "cap-desc") {
    params.set("sort", searchParams.sort);
  }

  const query = params.toString();
  return query.length > 0 ? `/contracts?${query}` : "/contracts";
}

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

function applyFilters(
  contracts: ContractRow[],
  searchParams: SearchParams
): ContractRow[] {
  const query = searchParams.q?.trim().toLowerCase() ?? "";
  const era = searchParams.era ?? "all";
  const sort = searchParams.sort ?? "cap-desc";

  let nextContracts = [...contracts];

  if (query.length > 0) {
    nextContracts = nextContracts.filter((contract) => {
      const playerMatch = contract.player.fullName.toLowerCase().includes(query);
      const teamMatch =
        contract.team.name.toLowerCase().includes(query) ||
        contract.team.abbreviation.toLowerCase().includes(query);

      return playerMatch || teamMatch;
    });
  }

  if (era === "current") {
    nextContracts = nextContracts.filter((contract) => !contract.isHistorical);
  }

  if (era === "historical") {
    nextContracts = nextContracts.filter((contract) => contract.isHistorical);
  }

  nextContracts.sort((left, right) => {
    switch (sort) {
      case "cap-asc":
        return (left.capPercentage ?? -1) - (right.capPercentage ?? -1);
      case "caphit-desc":
        return (right.capHitUsd ?? -1) - (left.capHitUsd ?? -1);
      case "player-asc":
        return left.player.fullName.localeCompare(right.player.fullName);
      case "team-asc":
        return left.team.name.localeCompare(right.team.name);
      case "season-desc":
        return right.startSeason - left.startSeason;
      case "cap-desc":
      default:
        return (right.capPercentage ?? -1) - (left.capPercentage ?? -1);
    }
  });

  return nextContracts;
}

function getSummary(contracts: ContractRow[]): ContractsSummary {
  const capPercentages = contracts
    .map((contract) => contract.capPercentage)
    .filter((value): value is number => value !== null);

  const highestCapContract =
    contracts.find((contract) => contract.capPercentage !== null) ?? null;

  return {
    averageCapPercentage:
      capPercentages.length > 0
        ? capPercentages.reduce((sum, value) => sum + value, 0) /
          capPercentages.length
        : null,
    currentContracts: contracts.filter((contract) => !contract.isHistorical)
      .length,
    historicalContracts: contracts.filter((contract) => contract.isHistorical)
      .length,
    highestCapContract
  };
}

function SummaryCards({ contracts }: { contracts: ContractRow[] }) {
  const summary = getSummary(contracts);

  return (
    <section className="stats-grid">
      <article className="stat-card">
        <span className="stat-label">Average Cap %</span>
        <strong className="stat-value">
          {formatPercent(summary.averageCapPercentage)}
        </strong>
        <p>Quick read on the current seeded market level.</p>
      </article>

      <article className="stat-card">
        <span className="stat-label">Current vs Historical</span>
        <strong className="stat-value">
          {summary.currentContracts} / {summary.historicalContracts}
        </strong>
        <p>Current contracts first, with historical context beside them.</p>
      </article>

      <article className="stat-card">
        <span className="stat-label">Top Anchor</span>
        <strong className="stat-value">
          {summary.highestCapContract?.player.fullName ?? "TBD"}
        </strong>
        <p>
          {summary.highestCapContract
            ? `${formatPercent(summary.highestCapContract.capPercentage)} cap share for ${summary.highestCapContract.team.abbreviation}.`
            : "No cap anchor available yet."}
        </p>
      </article>
    </section>
  );
}

function FilterControls({
  totalContracts,
  searchParams
}: {
  totalContracts: number;
  searchParams: SearchParams;
}) {
  return (
    <form className="filters" method="get">
      <div className="filter-field filter-field-wide">
        <label htmlFor="q">Search player or team</label>
        <input
          defaultValue={searchParams.q ?? ""}
          id="q"
          name="q"
          placeholder="Matthews, Avalanche, TOR..."
          type="text"
        />
      </div>

      <div className="filter-field">
        <label htmlFor="era">Era</label>
        <select defaultValue={searchParams.era ?? "all"} id="era" name="era">
          <option value="all">All contracts</option>
          <option value="current">Current only</option>
          <option value="historical">Historical only</option>
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="sort">Sort by</label>
        <select
          defaultValue={searchParams.sort ?? "cap-desc"}
          id="sort"
          name="sort"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-actions">
        <button className="button-primary" type="submit">
          Apply
        </button>
        <a className="button-secondary" href="/contracts">
          Reset
        </a>
        <span className="caption">{totalContracts} total rows in seed set</span>
      </div>
    </form>
  );
}

function SortChips({ searchParams }: { searchParams: SearchParams }) {
  const activeSort = searchParams.sort ?? "cap-desc";

  return (
    <div className="chip-row">
      {sortOptions.map((option) => {
        const href = buildContractsUrl({
          ...searchParams,
          sort: option.value
        });

        return (
          <Link
            key={option.value}
            className={
              activeSort === option.value ? "sort-chip active" : "sort-chip"
            }
            href={href}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}

function ContractsTable({
  contracts,
  totalContracts,
  searchParams
}: {
  contracts: ContractRow[];
  totalContracts: number;
  searchParams: SearchParams;
}) {
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

      <PageContext
        goal="Help evaluate whether a contract looks fair, expensive, or risky once cap context is normalized across eras."
        questions={[
          "How large is this contract relative to the cap environment?",
          "Which deals stand out as market anchors or warning signs?",
          "How does this player's contract compare to similar roster decisions?"
        ]}
      />

      <FilterControls
        searchParams={searchParams}
        totalContracts={totalContracts}
      />

      <section className="subpanel stack">
        <div className="stack">
          <h2>Quick sorting</h2>
          <p>
            Use the chips for the most common sort pivots without reopening the
            dropdown.
          </p>
        </div>
        <SortChips searchParams={searchParams} />
      </section>

      <SummaryCards contracts={contracts} />

      <section className="subpanel stack">
        <div className="split">
          <div className="stack">
            <h2>What this slice proves</h2>
            <p>
              We now have a real end-to-end contracts surface: Prisma query,
              seeded local data, and a UI that starts to frame contract values
              as cap-share decisions instead of just dollar figures.
            </p>
          </div>
          <span className="soft-label">Local-first workflow</span>
        </div>
      </section>

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
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract) => (
              <tr key={contract.id}>
                <td>
                  <div className="cell-title">
                    <strong>
                      <Link
                        className="table-link"
                        href={`/contracts/${contract.id}`}
                      >
                        {contract.player.fullName}
                      </Link>
                    </strong>
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
                <td>
                  <Link
                    className="button-secondary inline-button"
                    href={`/contracts/${contract.id}`}
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NoResultsState({
  totalContracts,
  searchParams
}: {
  totalContracts: number;
  searchParams: SearchParams;
}) {
  return (
    <main className="panel stack">
      <span className="eyebrow">Contracts</span>
      <h1>Contract analysis workspace</h1>
      <p>No contracts matched the current filters.</p>
      <FilterControls
        searchParams={searchParams}
        totalContracts={totalContracts}
      />
      <a className="button-secondary inline-button" href="/contracts">
        Clear filters
      </a>
    </main>
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

export default async function ContractsPage({
  searchParams
}: {
  searchParams?: SearchParams;
}) {
  try {
    const allContracts = await getContracts();

    if (allContracts.length === 0) {
      return <EmptyState />;
    }

    const filteredContracts = applyFilters(allContracts, searchParams ?? {});

    if (filteredContracts.length === 0) {
      return (
        <NoResultsState
          searchParams={searchParams ?? {}}
          totalContracts={allContracts.length}
        />
      );
    }

    return (
      <ContractsTable
        contracts={filteredContracts}
        searchParams={searchParams ?? {}}
        totalContracts={allContracts.length}
      />
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error.";

    return <ErrorState message={message} />;
  }
}
