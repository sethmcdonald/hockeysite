import { prisma } from "@hockey/db";
import Link from "next/link";
import { PageContext } from "../components/page-context";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  position?: string;
  team?: string;
};

type PlayerRow = {
  id: string;
  full_name: string;
  position: string | null;
  shoots_catches: string | null;
  roster_snapshots: {
    snapshot_date: Date;
    team: {
      name: string;
      abbreviation: string;
    };
  }[];
  contracts: {
    id: string;
  }[];
  player_seasons: {
    id: string;
  }[];
  player_features: {
    id: string;
  }[];
};

async function getPlayers() {
  return prisma.player.findMany({
    orderBy: [{ full_name: "asc" }],
    select: {
      id: true,
      full_name: true,
      position: true,
      shoots_catches: true,
      roster_snapshots: {
        orderBy: [{ snapshot_date: "desc" }],
        take: 1,
        select: {
          snapshot_date: true,
          team: {
            select: {
              name: true,
              abbreviation: true
            }
          }
        }
      },
      contracts: {
        select: {
          id: true
        }
      },
      player_seasons: {
        select: {
          id: true
        }
      },
      player_features: {
        select: {
          id: true
        }
      }
    }
  });
}

function getCurrentTeam(player: PlayerRow) {
  return player.roster_snapshots[0]?.team ?? null;
}

function applyFilters(players: PlayerRow[], searchParams: SearchParams) {
  const query = searchParams.q?.trim().toLowerCase() ?? "";
  const position = searchParams.position ?? "all";
  const team = searchParams.team ?? "all";

  return players.filter((player) => {
    const currentTeam = getCurrentTeam(player);
    const matchesQuery =
      query.length === 0 ||
      player.full_name.toLowerCase().includes(query) ||
      currentTeam?.name.toLowerCase().includes(query) ||
      currentTeam?.abbreviation.toLowerCase().includes(query);

    const matchesPosition =
      position === "all" || (player.position ?? "unknown") === position;

    const matchesTeam =
      team === "all" ||
      currentTeam?.abbreviation === team ||
      currentTeam?.name === team;

    return matchesQuery && matchesPosition && matchesTeam;
  });
}

function getTeams(players: PlayerRow[]) {
  return Array.from(
    new Map(
      players
        .map((player) => getCurrentTeam(player))
        .filter((team): team is NonNullable<ReturnType<typeof getCurrentTeam>> => team !== null)
        .map((team) => [team.abbreviation, team.name])
    ).entries()
  );
}

function getPositions(players: PlayerRow[]) {
  return Array.from(
    new Set(
      players
        .map((player) => player.position)
        .filter((value): value is string => value !== null)
    )
  );
}

function PlayerFilters({
  players,
  searchParams
}: {
  players: PlayerRow[];
  searchParams: SearchParams;
}) {
  const teams = getTeams(players);
  const positions = getPositions(players);

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
        <label htmlFor="position">Position</label>
        <select
          defaultValue={searchParams.position ?? "all"}
          id="position"
          name="position"
        >
          <option value="all">All positions</option>
          {positions.map((position) => (
            <option key={position} value={position}>
              {position}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="team">Team</label>
        <select defaultValue={searchParams.team ?? "all"} id="team" name="team">
          <option value="all">All teams</option>
          {teams.map(([abbreviation, name]) => (
            <option key={abbreviation} value={abbreviation}>
              {name} ({abbreviation})
            </option>
          ))}
        </select>
      </div>

      <div className="filter-actions">
        <button className="button-primary" type="submit">
          Apply
        </button>
        <a className="button-secondary" href="/players">
          Reset
        </a>
      </div>
    </form>
  );
}

function EmptyState() {
  return (
    <main className="panel stack">
      <span className="eyebrow">Players</span>
      <h1>Player warehouse surface</h1>
      <p>The player surface is wired up, but there are no local player rows yet.</p>
      <ol className="muted-list">
        <li>Keep Postgres running.</li>
        <li>Run `npm run db:migrate`.</li>
        <li>Run `npm run db:seed` to load the sample roster.</li>
      </ol>
    </main>
  );
}

function NoResultsState({
  players,
  searchParams
}: {
  players: PlayerRow[];
  searchParams: SearchParams;
}) {
  return (
    <main className="panel stack">
      <span className="eyebrow">Players</span>
      <h1>Player warehouse surface</h1>
      <p>No players matched the current filters.</p>
      <PlayerFilters players={players} searchParams={searchParams} />
      <a className="button-secondary inline-button" href="/players">
        Clear filters
      </a>
    </main>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <main className="stack">
      <section className="panel stack">
        <span className="eyebrow">Players</span>
        <h1>Player warehouse surface</h1>
        <p>
          The player surface is connected, but the database is not reachable
          right now.
        </p>
      </section>

      <section className="warning stack">
        <strong>Database connection note</strong>
        <p>{message}</p>
      </section>
    </main>
  );
}

function PlayerGrid({ players }: { players: PlayerRow[] }) {
  return (
    <section className="detail-grid">
      {players.map((player) => {
        const currentTeam = getCurrentTeam(player);

        return (
          <article key={player.id} className="panel stack">
            <div className="split">
              <div className="stack">
                <span className="eyebrow">Player</span>
                <h2>{player.full_name}</h2>
              </div>
              <span className="soft-label">
                {currentTeam?.abbreviation ?? "Unassigned"}
              </span>
            </div>

            <p>
              {currentTeam
                ? `${currentTeam.name} | ${player.position ?? "Position TBD"} | Shoots/Catches ${player.shoots_catches ?? "TBD"}`
                : `No roster snapshot yet | ${player.position ?? "Position TBD"} | Shoots/Catches ${player.shoots_catches ?? "TBD"}`}
            </p>

            <div className="stats-grid">
              <article className="stat-card">
                <span className="stat-label">Contracts</span>
                <strong className="stat-value">{player.contracts.length}</strong>
                <p>Full contract rows tied to this player.</p>
              </article>
              <article className="stat-card">
                <span className="stat-label">Player Seasons</span>
                <strong className="stat-value">{player.player_seasons.length}</strong>
                <p>Normalized player/team/season rows in the warehouse.</p>
              </article>
              <article className="stat-card">
                <span className="stat-label">Feature Rows</span>
                <strong className="stat-value">{player.player_features.length}</strong>
                <p>Future-ready internal features, without modeling logic yet.</p>
              </article>
            </div>

            <div className="chip-row">
              <Link className="button-secondary inline-button" href="/contracts">
                View contracts
              </Link>
              <Link className="button-secondary inline-button" href="/teams">
                View teams
              </Link>
            </div>
          </article>
        );
      })}
    </section>
  );
}

export default async function PlayersPage({
  searchParams
}: {
  searchParams?: SearchParams;
}) {
  try {
    const players = await getPlayers();

    if (players.length === 0) {
      return <EmptyState />;
    }

    const filteredPlayers = applyFilters(players, searchParams ?? {});

    if (filteredPlayers.length === 0) {
      return (
        <NoResultsState players={players} searchParams={searchParams ?? {}} />
      );
    }

    return (
      <main className="stack">
        <section className="panel stack">
          <div className="split">
            <div className="stack">
              <span className="eyebrow">Players</span>
              <h1>Player warehouse surface</h1>
            </div>
            <span className="label">{filteredPlayers.length} visible players</span>
          </div>

          <p>
            This phase-1 view keeps players grounded in warehouse primitives:
            canonical identities, roster snapshots, contracts, and season-level
            records.
          </p>

          <PageContext
            goal="Give a quick player-level entry point into the warehouse foundation without implying SAUCE or ANCHOR logic already exists."
            questions={[
              "Which player identities and historical season rows do we already have?",
              "How many contract and feature records are attached to a player?",
              "Which player should we inspect next in the contract warehouse?"
            ]}
          />

          <PlayerFilters players={players} searchParams={searchParams ?? {}} />
        </section>

        <PlayerGrid players={filteredPlayers} />
      </main>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error.";

    return <ErrorState message={message} />;
  }
}
