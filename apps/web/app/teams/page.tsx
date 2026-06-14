import { prisma } from "@hockey/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  league?: string;
};

type TeamRow = {
  id: string;
  name: string;
  slug: string;
  abbreviation: string;
  league: string | null;
  currentRoster: {
    id: string;
    fullName: string;
    position: string | null;
  }[];
  contracts: {
    id: string;
    capPercentage: number | null;
    isHistorical: boolean;
  }[];
  anchorScenarios: {
    id: string;
    name: string;
  }[];
};

async function getTeams() {
  return prisma.team.findMany({
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      abbreviation: true,
      league: true,
      currentRoster: {
        select: {
          id: true,
          fullName: true,
          position: true
        }
      },
      contracts: {
        select: {
          id: true,
          capPercentage: true,
          isHistorical: true
        }
      },
      anchorScenarios: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
}

function applyFilters(teams: TeamRow[], searchParams: SearchParams) {
  const query = searchParams.q?.trim().toLowerCase() ?? "";
  const league = searchParams.league ?? "all";

  return teams.filter((team) => {
    const matchesQuery =
      query.length === 0 ||
      team.name.toLowerCase().includes(query) ||
      team.abbreviation.toLowerCase().includes(query);

    const matchesLeague =
      league === "all" || (team.league ?? "Unknown") === league;

    return matchesQuery && matchesLeague;
  });
}

function getLeagues(teams: TeamRow[]) {
  return Array.from(
    new Set(
      teams
        .map((team) => team.league)
        .filter((value): value is string => value !== null)
    )
  );
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "TBD";
  }

  return `${value.toFixed(2)}%`;
}

function TeamFilters({
  teams,
  searchParams
}: {
  teams: TeamRow[];
  searchParams: SearchParams;
}) {
  const leagues = getLeagues(teams);

  return (
    <form className="filters" method="get">
      <div className="filter-field filter-field-wide">
        <label htmlFor="q">Search team</label>
        <input
          defaultValue={searchParams.q ?? ""}
          id="q"
          name="q"
          placeholder="Maple Leafs, Avalanche, TOR..."
          type="text"
        />
      </div>

      <div className="filter-field">
        <label htmlFor="league">League</label>
        <select defaultValue={searchParams.league ?? "all"} id="league" name="league">
          <option value="all">All leagues</option>
          {leagues.map((league) => (
            <option key={league} value={league}>
              {league}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-actions">
        <button className="button-primary" type="submit">
          Apply
        </button>
        <a className="button-secondary" href="/teams">
          Reset
        </a>
      </div>
    </form>
  );
}

function EmptyState() {
  return (
    <main className="panel stack">
      <span className="eyebrow">Teams</span>
      <h1>Team context workspace</h1>
      <p>The team surface is wired up, but there are no local teams yet.</p>
      <ol className="muted-list">
        <li>Keep Postgres running.</li>
        <li>Run `pnpm db:push`.</li>
        <li>Run `pnpm db:seed` to load the sample teams.</li>
      </ol>
    </main>
  );
}

function NoResultsState({
  teams,
  searchParams
}: {
  teams: TeamRow[];
  searchParams: SearchParams;
}) {
  return (
    <main className="panel stack">
      <span className="eyebrow">Teams</span>
      <h1>Team context workspace</h1>
      <p>No teams matched the current filters.</p>
      <TeamFilters searchParams={searchParams} teams={teams} />
      <a className="button-secondary inline-button" href="/teams">
        Clear filters
      </a>
    </main>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <main className="stack">
      <section className="panel stack">
        <span className="eyebrow">Teams</span>
        <h1>Team context workspace</h1>
        <p>The team surface is connected, but the database is not reachable right now.</p>
      </section>

      <section className="warning stack">
        <strong>Database connection note</strong>
        <p>{message}</p>
      </section>
    </main>
  );
}

function TeamGrid({ teams }: { teams: TeamRow[] }) {
  return (
    <section className="detail-grid">
      {teams.map((team) => {
        const currentContracts = team.contracts.filter(
          (contract) => !contract.isHistorical
        );
        const highestCapContract = [...currentContracts].sort(
          (left, right) => (right.capPercentage ?? -1) - (left.capPercentage ?? -1)
        )[0];

        return (
          <article key={team.id} className="panel stack">
            <div className="split">
              <div className="stack">
                <span className="eyebrow">Team</span>
                <h2>{team.name}</h2>
              </div>
              <span className="soft-label">{team.abbreviation}</span>
            </div>

            <p>
              {team.league ?? "League TBD"} · {team.currentRoster.length} seeded roster
              player{team.currentRoster.length === 1 ? "" : "s"} ·{" "}
              {team.anchorScenarios.length} anchor scenario
              {team.anchorScenarios.length === 1 ? "" : "s"}
            </p>

            <div className="stats-grid">
              <article className="stat-card">
                <span className="stat-label">Roster Size</span>
                <strong className="stat-value">{team.currentRoster.length}</strong>
                <p>Current locally seeded players tied to this team.</p>
              </article>
              <article className="stat-card">
                <span className="stat-label">Current Contracts</span>
                <strong className="stat-value">{currentContracts.length}</strong>
                <p>Non-historical contracts connected to this roster snapshot.</p>
              </article>
              <article className="stat-card">
                <span className="stat-label">Top Cap Anchor</span>
                <strong className="stat-value">
                  {formatPercent(highestCapContract?.capPercentage ?? null)}
                </strong>
                <p>Highest current cap-share contract in the local sample set.</p>
              </article>
            </div>

            <div className="subpanel stack">
              <h3>Roster snapshot</h3>
              <div className="chip-row">
                {team.currentRoster.map((player) => (
                  <span key={player.id} className="soft-label">
                    {player.fullName} {player.position ? `· ${player.position}` : ""}
                  </span>
                ))}
              </div>
            </div>

            <div className="chip-row">
              <Link className="button-secondary inline-button" href="/players">
                View players
              </Link>
              <Link className="button-secondary inline-button" href="/contracts">
                View contracts
              </Link>
              <Link
                className="button-secondary inline-button"
                href="/anchors-away"
              >
                View anchors
              </Link>
            </div>
          </article>
        );
      })}
    </section>
  );
}

export default async function TeamsPage({
  searchParams
}: {
  searchParams?: SearchParams;
}) {
  try {
    const teams = await getTeams();

    if (teams.length === 0) {
      return <EmptyState />;
    }

    const filteredTeams = applyFilters(teams, searchParams ?? {});

    if (filteredTeams.length === 0) {
      return <NoResultsState searchParams={searchParams ?? {}} teams={teams} />;
    }

    return (
      <main className="stack">
        <section className="panel stack">
          <div className="split">
            <div className="stack">
              <span className="eyebrow">Teams</span>
              <h1>Team context workspace</h1>
            </div>
            <span className="label">{filteredTeams.length} visible teams</span>
          </div>

          <p>
            This slice gives the product a team-level surface: searchable clubs,
            roster snapshots, contract concentration, and direct links back into
            player and anchor analysis.
          </p>

          <TeamFilters searchParams={searchParams ?? {}} teams={teams} />
        </section>

        <TeamGrid teams={filteredTeams} />
      </main>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error.";

    return <ErrorState message={message} />;
  }
}
