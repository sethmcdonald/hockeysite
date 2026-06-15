import { prisma } from "@hockey/db";
import Link from "next/link";
import { PageContext } from "../components/page-context";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  conference?: string;
};

type TeamRow = {
  id: string;
  name: string;
  abbreviation: string;
  city: string;
  conference: string | null;
  division: string | null;
  roster_snapshots: {
    id: string;
    player: {
      full_name: string;
      position: string | null;
    };
  }[];
  signing_contracts: {
    id: string;
    average_annual_value: unknown;
  }[];
  team_seasons: {
    season: {
      season_code: string;
    };
    points: number | null;
    playoff_result: string | null;
  }[];
};

async function getTeams() {
  return prisma.team.findMany({
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      abbreviation: true,
      city: true,
      conference: true,
      division: true,
      roster_snapshots: {
        orderBy: [{ snapshot_date: "desc" }],
        take: 5,
        select: {
          id: true,
          player: {
            select: {
              full_name: true,
              position: true
            }
          }
        }
      },
      signing_contracts: {
        select: {
          id: true,
          average_annual_value: true
        }
      },
      team_seasons: {
        orderBy: [{ season: { start_year: "desc" } }],
        take: 1,
        select: {
          points: true,
          playoff_result: true,
          season: {
            select: {
              season_code: true
            }
          }
        }
      }
    }
  });
}

function applyFilters(teams: TeamRow[], searchParams: SearchParams) {
  const query = searchParams.q?.trim().toLowerCase() ?? "";
  const conference = searchParams.conference ?? "all";

  return teams.filter((team) => {
    const matchesQuery =
      query.length === 0 ||
      team.name.toLowerCase().includes(query) ||
      team.abbreviation.toLowerCase().includes(query) ||
      team.city.toLowerCase().includes(query);

    const matchesConference =
      conference === "all" || (team.conference ?? "Unknown") === conference;

    return matchesQuery && matchesConference;
  });
}

function getConferences(teams: TeamRow[]) {
  return Array.from(
    new Set(
      teams
        .map((team) => team.conference)
        .filter((value): value is string => value !== null)
    )
  );
}

function formatMoney(value: unknown) {
  if (value === null || value === undefined) {
    return "TBD";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Number(value));
}

function TeamFilters({
  teams,
  searchParams
}: {
  teams: TeamRow[];
  searchParams: SearchParams;
}) {
  const conferences = getConferences(teams);

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
        <label htmlFor="conference">Conference</label>
        <select
          defaultValue={searchParams.conference ?? "all"}
          id="conference"
          name="conference"
        >
          <option value="all">All conferences</option>
          {conferences.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
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
      <h1>Team warehouse surface</h1>
      <p>The team surface is wired up, but there are no local teams yet.</p>
      <ol className="muted-list">
        <li>Keep Postgres running.</li>
        <li>Run `npm run db:migrate`.</li>
        <li>Run `npm run db:seed` to load the sample teams.</li>
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
      <h1>Team warehouse surface</h1>
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
        <h1>Team warehouse surface</h1>
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
        const latestSeason = team.team_seasons[0] ?? null;
        const topAav = [...team.signing_contracts]
          .sort(
            (left, right) =>
              Number(right.average_annual_value ?? 0) -
              Number(left.average_annual_value ?? 0)
          )[0];

        return (
          <article key={team.id} className="panel stack">
            <div className="split">
              <div className="stack">
                <span className="eyebrow">Team</span>
                <h2>{team.city} {team.name}</h2>
              </div>
              <span className="soft-label">{team.abbreviation}</span>
            </div>

            <p>
              {team.conference ?? "Conference TBD"} | {team.division ?? "Division TBD"} |{" "}
              {team.roster_snapshots.length} seeded roster snapshot row
              {team.roster_snapshots.length === 1 ? "" : "s"}
            </p>

            <div className="stats-grid">
              <article className="stat-card">
                <span className="stat-label">Roster Snapshots</span>
                <strong className="stat-value">{team.roster_snapshots.length}</strong>
                <p>Historical roster rows currently connected to this team.</p>
              </article>
              <article className="stat-card">
                <span className="stat-label">Contracts</span>
                <strong className="stat-value">{team.signing_contracts.length}</strong>
                <p>Full contract records signed by this club in the sample set.</p>
              </article>
              <article className="stat-card">
                <span className="stat-label">Top AAV</span>
                <strong className="stat-value">
                  {formatMoney(topAav?.average_annual_value ?? null)}
                </strong>
                <p>Largest average annual value currently tied to this team.</p>
              </article>
            </div>

            <div className="subpanel stack">
              <h3>Latest seeded season</h3>
              <p>
                {latestSeason
                  ? `${latestSeason.season.season_code}: ${latestSeason.points ?? "TBD"} points | ${latestSeason.playoff_result ?? "Playoff result TBD"}`
                  : "No team season rows seeded yet."}
              </p>
            </div>

            <div className="subpanel stack">
              <h3>Roster sample</h3>
              <div className="chip-row">
                {team.roster_snapshots.map((snapshot) => (
                  <span key={snapshot.id} className="soft-label">
                    {snapshot.player.full_name}
                    {snapshot.player.position ? ` | ${snapshot.player.position}` : ""}
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
              <h1>Team warehouse surface</h1>
            </div>
            <span className="label">{filteredTeams.length} visible teams</span>
          </div>

          <p>
            This slice keeps team context grounded in the data warehouse:
            canonical team identities, season outcomes, signed contracts, and
            roster snapshots.
          </p>

          <PageContext
            goal="Show how a team's historical roster, contract, and season tables fit together before any decision model is layered on top."
            questions={[
              "Which team identities and season rows are already normalized?",
              "How many contract and roster records do we have for a club?",
              "Which team should we inspect next from the contract warehouse?"
            ]}
          />

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
