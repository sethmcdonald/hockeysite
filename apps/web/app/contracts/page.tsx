import { prisma } from "@hockey/db";
import Link from "next/link";
import { PageContext } from "../components/page-context";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  sort?: string;
};

type ContractRow = {
  id: string;
  sign_date: Date | null;
  term_years: number;
  total_value: unknown;
  average_annual_value: unknown;
  contract_type: string | null;
  signing_status: string | null;
  player: {
    full_name: string;
    position: string | null;
  };
  signing_team: {
    name: string;
    abbreviation: string;
  };
  start_season: {
    season_code: string;
    start_year: number;
  };
  end_season: {
    season_code: string;
  };
  contract_years: {
    id: string;
  }[];
};

type ContractsSummary = {
  totalContracts: number;
  totalContractYears: number;
  averageAav: number | null;
  largestContract: ContractRow | null;
};

const sortOptions = [
  { value: "aav-desc", label: "AAV (High to Low)" },
  { value: "value-desc", label: "Total Value (High to Low)" },
  { value: "term-desc", label: "Term (Long to Short)" },
  { value: "player-asc", label: "Player (A to Z)" },
  { value: "team-asc", label: "Team (A to Z)" },
  { value: "season-desc", label: "Newest Start Season" }
] as const;

function buildContractsUrl(searchParams: SearchParams) {
  const params = new URLSearchParams();

  if (searchParams.q?.trim()) {
    params.set("q", searchParams.q.trim());
  }

  if (searchParams.sort && searchParams.sort !== "aav-desc") {
    params.set("sort", searchParams.sort);
  }

  const query = params.toString();
  return query.length > 0 ? `/contracts?${query}` : "/contracts";
}

function toNumber(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  return Number(value);
}

function formatMoney(value: unknown) {
  const numeric = toNumber(value);

  if (numeric === null) {
    return "TBD";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(numeric);
}

async function getContracts() {
  return prisma.contract.findMany({
    orderBy: [{ average_annual_value: "desc" }, { sign_date: "desc" }],
    select: {
      id: true,
      sign_date: true,
      term_years: true,
      total_value: true,
      average_annual_value: true,
      contract_type: true,
      signing_status: true,
      player: {
        select: {
          full_name: true,
          position: true
        }
      },
      signing_team: {
        select: {
          name: true,
          abbreviation: true
        }
      },
      start_season: {
        select: {
          season_code: true,
          start_year: true
        }
      },
      end_season: {
        select: {
          season_code: true
        }
      },
      contract_years: {
        select: {
          id: true
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
  const sort = searchParams.sort ?? "aav-desc";

  const nextContracts = contracts.filter((contract) => {
    if (query.length === 0) {
      return true;
    }

    return (
      contract.player.full_name.toLowerCase().includes(query) ||
      contract.signing_team.name.toLowerCase().includes(query) ||
      contract.signing_team.abbreviation.toLowerCase().includes(query)
    );
  });

  nextContracts.sort((left, right) => {
    switch (sort) {
      case "value-desc":
        return (toNumber(right.total_value) ?? -1) - (toNumber(left.total_value) ?? -1);
      case "term-desc":
        return right.term_years - left.term_years;
      case "player-asc":
        return left.player.full_name.localeCompare(right.player.full_name);
      case "team-asc":
        return left.signing_team.name.localeCompare(right.signing_team.name);
      case "season-desc":
        return right.start_season.start_year - left.start_season.start_year;
      case "aav-desc":
      default:
        return (
          (toNumber(right.average_annual_value) ?? -1) -
          (toNumber(left.average_annual_value) ?? -1)
        );
    }
  });

  return nextContracts;
}

function getSummary(contracts: ContractRow[]): ContractsSummary {
  const aavs = contracts
    .map((contract) => toNumber(contract.average_annual_value))
    .filter((value): value is number => value !== null);

  const largestContract = [...contracts].sort(
    (left, right) =>
      (toNumber(right.total_value) ?? -1) - (toNumber(left.total_value) ?? -1)
  )[0] ?? null;

  return {
    totalContracts: contracts.length,
    totalContractYears: contracts.reduce(
      (sum, contract) => sum + contract.contract_years.length,
      0
    ),
    averageAav:
      aavs.length > 0
        ? aavs.reduce((sum, value) => sum + value, 0) / aavs.length
        : null,
    largestContract
  };
}

function SummaryCards({ contracts }: { contracts: ContractRow[] }) {
  const summary = getSummary(contracts);

  return (
    <section className="stats-grid">
      <article className="stat-card">
        <span className="stat-label">Contracts</span>
        <strong className="stat-value">{summary.totalContracts}</strong>
        <p>Full agreement records in the current sample warehouse.</p>
      </article>

      <article className="stat-card">
        <span className="stat-label">Contract Years</span>
        <strong className="stat-value">{summary.totalContractYears}</strong>
        <p>Season-level salary rows attached to those contracts.</p>
      </article>

      <article className="stat-card">
        <span className="stat-label">Average AAV</span>
        <strong className="stat-value">{formatMoney(summary.averageAav)}</strong>
        <p>Warehouse-friendly baseline before cap normalization logic exists.</p>
      </article>

      <article className="stat-card">
        <span className="stat-label">Largest Sample Contract</span>
        <strong className="stat-value">
          {summary.largestContract?.player.full_name ?? "TBD"}
        </strong>
        <p>
          {summary.largestContract
            ? `${formatMoney(summary.largestContract.total_value)} signed by ${summary.largestContract.signing_team.abbreviation}.`
            : "No contract rows yet."}
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
        <label htmlFor="sort">Sort by</label>
        <select
          defaultValue={searchParams.sort ?? "aav-desc"}
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
  const activeSort = searchParams.sort ?? "aav-desc";

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
          <h1>Contract warehouse workspace</h1>
        </div>
        <span className="label">{contracts.length} seeded contracts</span>
      </div>

      <p>
        This phase-1 slice stays focused on contract structure: full agreements,
        year-by-year breakdowns, and stable player/team/season links. Cap
        percentage normalization will come later on top of this base.
      </p>

      <PageContext
        goal="Expose clean contract warehouse tables so future risk, comp, and roster tooling has a trustworthy base to build on."
        questions={[
          "What is the full contract and what are its year-by-year rows?",
          "Which player, team, and season IDs does this agreement connect to?",
          "Which contracts should be easiest to compare once modeling exists?"
        ]}
      />

      <FilterControls
        searchParams={searchParams}
        totalContracts={totalContracts}
      />

      <section className="subpanel stack">
        <div className="stack">
          <h2>Quick sorting</h2>
          <p>Use the chips for the most common warehouse pivots.</p>
        </div>
        <SortChips searchParams={searchParams} />
      </section>

      <SummaryCards contracts={contracts} />

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Team</th>
              <th>Term</th>
              <th>Total Value</th>
              <th>AAV</th>
              <th>Start Season</th>
              <th>Contract Years</th>
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
                        {contract.player.full_name}
                      </Link>
                    </strong>
                    <span className="caption">
                      {contract.player.position ?? "Position TBD"}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="cell-title">
                    <strong>{contract.signing_team.abbreviation}</strong>
                    <span className="caption">{contract.signing_team.name}</span>
                  </div>
                </td>
                <td>{contract.term_years} years</td>
                <td>{formatMoney(contract.total_value)}</td>
                <td>{formatMoney(contract.average_annual_value)}</td>
                <td>{contract.start_season.season_code}</td>
                <td>{contract.contract_years.length}</td>
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
      <h1>Contract warehouse workspace</h1>
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
      <h1>Contract warehouse workspace</h1>
      <p>
        The contracts table is wired up, but there is no seeded data yet in
        your local database.
      </p>
      <ol className="muted-list">
        <li>Start Postgres with `npm run db:start`.</li>
        <li>Apply the migration with `npm run db:migrate`.</li>
        <li>Seed sample contracts with `npm run db:seed`.</li>
      </ol>
    </main>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <main className="stack">
      <section className="panel stack">
        <span className="eyebrow">Contracts</span>
        <h1>Contract warehouse workspace</h1>
        <p>
          The page is connected to Prisma, but the database is not available to
          query yet.
        </p>
      </section>

      <section className="warning stack">
        <strong>Database connection note</strong>
        <p>{message}</p>
        <ol className="muted-list">
          <li>Start Postgres with `npm run db:start`.</li>
          <li>Copy `.env.example` to `.env` if needed.</li>
          <li>Run `npm run db:migrate` and then `npm run db:seed`.</li>
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
