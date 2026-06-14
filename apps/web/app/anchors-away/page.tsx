import { prisma } from "@hockey/db";
import Link from "next/link";
import { PageContext } from "../components/page-context";

export const dynamic = "force-dynamic";

type ScenarioRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  baselineSeason: number | null;
  assumptionsJson: unknown;
  anchorPlayer: {
    fullName: string;
    position: string | null;
  } | null;
  anchorTeam: {
    name: string;
    abbreviation: string;
  } | null;
};

type MarketContractRow = {
  id: string;
  player: {
    fullName: string;
  };
  team: {
    abbreviation: string;
  };
  capPercentage: number | null;
  normalizedSeason: string | null;
};

function formatPercent(value: number | null) {
  if (value === null) {
    return "TBD";
  }

  return `${value.toFixed(2)}%`;
}

function renderAssumptions(value: unknown) {
  if (!value || typeof value !== "object") {
    return [];
  }

  return Object.entries(value as Record<string, unknown>).map(([key, entry]) => ({
    key,
    value: String(entry)
  }));
}

async function getScenarioData() {
  const [scenarios, marketContracts] = await Promise.all([
    prisma.anchorScenario.findMany({
      orderBy: [{ baselineSeason: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        baselineSeason: true,
        assumptionsJson: true,
        anchorPlayer: {
          select: {
            fullName: true,
            position: true
          }
        },
        anchorTeam: {
          select: {
            name: true,
            abbreviation: true
          }
        }
      }
    }),
    prisma.contract.findMany({
      orderBy: [{ capPercentage: "desc" }],
      take: 3,
      select: {
        id: true,
        capPercentage: true,
        normalizedSeason: true,
        player: {
          select: {
            fullName: true
          }
        },
        team: {
          select: {
            abbreviation: true
          }
        }
      }
    })
  ]);

  return { scenarios, marketContracts };
}

function EmptyState() {
  return (
    <main className="panel stack">
      <span className="eyebrow">Anchors Away</span>
      <h1>Scenario exploration workspace</h1>
      <p>
        The page is wired up, but there are no anchor scenarios in your local
        dataset yet.
      </p>
      <ol className="muted-list">
        <li>Make sure Postgres is running.</li>
        <li>Run `pnpm db:push`.</li>
        <li>Run `pnpm db:seed` to load the sample anchor scenario.</li>
      </ol>
    </main>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <main className="stack">
      <section className="panel stack">
        <span className="eyebrow">Anchors Away</span>
        <h1>Scenario exploration workspace</h1>
        <p>
          The scenario explorer is connected, but the database is not available
          to query right now.
        </p>
      </section>

      <section className="warning stack">
        <strong>Database connection note</strong>
        <p>{message}</p>
        <ol className="muted-list">
          <li>Keep Docker/Postgres running.</li>
          <li>Start the web app with the same `DATABASE_URL` you used for seed.</li>
          <li>Refresh this page after the database is reachable again.</li>
        </ol>
      </section>
    </main>
  );
}

function MarketPanel({ contracts }: { contracts: MarketContractRow[] }) {
  return (
    <section className="panel stack">
      <div className="split">
        <div className="stack">
          <span className="eyebrow">Market Reads</span>
          <h2>Current top cap anchors</h2>
        </div>
        <Link className="button-secondary inline-button" href="/contracts">
          View contracts
        </Link>
      </div>

      <div className="stats-grid">
        {contracts.map((contract) => (
          <article key={contract.id} className="stat-card">
            <span className="stat-label">{contract.team.abbreviation}</span>
            <strong className="stat-value">{contract.player.fullName}</strong>
            <p>
              {formatPercent(contract.capPercentage)} in{" "}
              {contract.normalizedSeason ?? "an unnormalized season"}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ScenarioCards({ scenarios }: { scenarios: ScenarioRow[] }) {
  return (
    <section className="detail-grid">
      {scenarios.map((scenario) => {
        const assumptions = renderAssumptions(scenario.assumptionsJson);

        return (
          <article key={scenario.id} className="panel stack">
            <div className="split">
              <div className="stack">
                <span className="eyebrow">Scenario</span>
                <h2>{scenario.name}</h2>
              </div>
              <span className="soft-label">
                {scenario.baselineSeason ?? "No baseline"} baseline
              </span>
            </div>

            <p>
              {scenario.description ??
                "No description yet. This scenario is ready for future anchor-based experimentation."}
            </p>

            <div className="detail-grid">
              <div className="subpanel stack">
                <h3>Anchor focus</h3>
                <div className="detail-row">
                  <span className="detail-label">Player</span>
                  <strong>
                    {scenario.anchorPlayer?.fullName ?? "No player anchor"}
                  </strong>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Position</span>
                  <strong>
                    {scenario.anchorPlayer?.position ?? "Position TBD"}
                  </strong>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Team</span>
                  <strong>
                    {scenario.anchorTeam
                      ? `${scenario.anchorTeam.name} (${scenario.anchorTeam.abbreviation})`
                      : "No team anchor"}
                  </strong>
                </div>
              </div>

              <div className="subpanel stack">
                <h3>Assumptions</h3>
                {assumptions.length > 0 ? (
                  assumptions.map((assumption) => (
                    <div key={assumption.key} className="detail-row">
                      <span className="detail-label">{assumption.key}</span>
                      <strong>{assumption.value}</strong>
                    </div>
                  ))
                ) : (
                  <p>No assumptions captured yet.</p>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

export default async function AnchorsAwayPage() {
  try {
    const { scenarios, marketContracts } = await getScenarioData();

    if (scenarios.length === 0) {
      return <EmptyState />;
    }

    return (
      <main className="stack">
        <section className="panel stack">
          <div className="split">
            <div className="stack">
              <span className="eyebrow">Anchors Away</span>
              <h1>Scenario exploration workspace</h1>
            </div>
            <span className="label">{scenarios.length} seeded scenario</span>
          </div>

          <p>
            Anchors Away is where we test how contract conclusions shift when a
            market anchor is emphasized, removed, or reframed. This first slice
            stays intentionally small, but it gives the product a real scenario
            surface instead of a placeholder.
          </p>

          <PageContext
            goal="Explore how contract conclusions change when a player or team anchor becomes the framing point for the market."
            questions={[
              "Which contracts are setting the tone for a market segment?",
              "What happens if a high-end anchor is emphasized or removed?",
              "Which scenarios should feed future ANCHOR risk work?"
            ]}
          />
        </section>

        <MarketPanel contracts={marketContracts} />
        <ScenarioCards scenarios={scenarios} />
      </main>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error.";

    return <ErrorState message={message} />;
  }
}
