import { prisma } from "@hockey/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  position?: string;
  team?: string;
};

type PlayerRow = {
  id: string;
  fullName: string;
  slug: string;
  position: string | null;
  shoots: string | null;
  currentTeam: {
    name: string;
    abbreviation: string;
  } | null;
  contracts: { id: string; isHistorical: boolean }[];
  anchorScenarios: { id: string }[];
};

async function getPlayers() {
  return prisma.player.findMany({
    orderBy: [{ fullName: "asc" }],
    select: {
      id: true,
      fullName: true,
      slug: true,
      position: true,
      shoots: true,
      currentTeam: {
        select: {
          name: true,
          abbreviation: true
        }
      },
      contracts: {
        select: {
          id: true,
          isHistorical: true
        }
      },
      anchorScenarios: {
        select: {
          id: true
        }
      }
    }
  });
}

function applyFilters(players: PlayerRow[], searchParams: SearchParams) {
  const query = searchParams.q?.trim().toLowerCase() ?? "";
  const position = searchParams.position ?? "all";
  const team = searchParams.team ?? "all";

  return players.filter((player) => {
    const matchesQuery =
      query.length === 0 ||
      player.fullName.toLowerCase().includes(query) ||
      player.currentTeam?.name.toLowerCase().includes(query) ||
      player.currentTeam?.abbreviation.toLowerCase().includes(query);

    const matchesPosition =
      position === "all" || (player.position ?? "unknown") === position;

    const matchesTeam =
      team === "all" ||
      player.currentTeam?.abbreviation === team ||
      player.currentTeam?.name === team;

    return matchesQuery && matchesPosition && matchesTeam;
  });
}

function getTeams(players: PlayerRow[]) {
  return Array.from(
    new Map(
      players
        .filter((player) => player.currentTeam)
        .map((player) => [
          player.currentTeam!.abbreviation,
          player.currentTeam!.name
        ])
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
      <h1>Player intelligence workspace</h1>
      <p>The player surface is wired up, but there are no local player rows yet.</p>
      <ol className="muted-list">
        <li>Keep Postgres running.</li>
        <li>Run `pnpm db:push`.</li>
        <li>Run `pnpm db:seed` to load the sample roster.</li>
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
      <h1>Player intelligence workspace</h1>
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
        <h1>Player intelligence workspace</h1>
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
        const currentContracts = player.contracts.filter(
          (contract) => !contract.isHistorical
        ).length;
        const historicalContracts = player.contracts.filter(
          (contract) => contract.isHistorical
        ).length;

        return (
          <article key={player.id} className="panel stack">
            <div className="split">
              <div className="stack">
                <span className="eyebrow">Player</span>
                <h2>{player.fullName}</h2>
              </div>
              <span className="soft-label">
                {player.currentTeam?.abbreviation ?? "FA"}
              </span>
            </div>

            <p>
              {player.currentTeam
                ? `${player.currentTeam.name} · ${player.position ?? "Position TBD"} · Shoots ${player.shoots ?? "TBD"}`
                : `No team assigned · ${player.position ?? "Position TBD"} · Shoots ${player.shoots ?? "TBD"}`}
            </p>

            <div className="stats-grid">
              <article className="stat-card">
                <span className="stat-label">Current Contracts</span>
                <strong className="stat-value">{currentContracts}</strong>
                <p>Active seeded contract records tied to this player.</p>
              </article>
              <article className="stat-card">
                <span className="stat-label">Historical Contracts</span>
                <strong className="stat-value">{historicalContracts}</strong>
                <p>Historical comparables already connected locally.</p>
              </article>
              <article className="stat-card">
                <span className="stat-label">Anchor Scenarios</span>
                <strong className="stat-value">{player.anchorScenarios.length}</strong>
                <p>Scenario entries where this player acts as an anchor.</p>
              </article>
            </div>

            <div className="chip-row">
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
              <h1>Player intelligence workspace</h1>
            </div>
            <span className="label">{filteredPlayers.length} visible players</span>
          </div>

          <p>
            This slice brings the roster into the product properly: searchable
            players, team and position filtering, and direct links back into
            contract and anchor context.
          </p>

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
