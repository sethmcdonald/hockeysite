import { prisma } from "@hockey/db";
import Link from "next/link";
import { PageContext } from "../../components/page-context";

export const dynamic = "force-dynamic";

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

async function getContract(id: string) {
  return prisma.contract.findUnique({
    where: { id },
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
          position: true,
          shoots_catches: true
        }
      },
      signing_team: {
        select: {
          name: true,
          abbreviation: true,
          city: true,
          conference: true,
          division: true
        }
      },
      start_season: {
        select: {
          season_code: true
        }
      },
      end_season: {
        select: {
          season_code: true
        }
      },
      contract_years: {
        orderBy: [{ season: { start_year: "asc" } }],
        select: {
          id: true,
          cap_hit: true,
          base_salary: true,
          signing_bonus: true,
          performance_bonus: true,
          total_salary: true,
          season: {
            select: {
              season_code: true
            }
          },
          team: {
            select: {
              abbreviation: true
            }
          }
        }
      }
    }
  });
}

function DetailRow({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default async function ContractDetailPage({
  params
}: {
  params: { id: string };
}) {
  const contract = await getContract(params.id);

  if (!contract) {
    return (
      <main className="panel stack">
        <span className="eyebrow">Contracts</span>
        <h1>Contract not found</h1>
        <p>The selected contract could not be found in the local dataset.</p>
        <Link className="button-secondary inline-button" href="/contracts">
          Back to contracts
        </Link>
      </main>
    );
  }

  return (
    <main className="stack">
      <section className="panel stack">
        <div className="split">
          <div className="stack">
            <span className="eyebrow">Contract Detail</span>
            <h1>{contract.player.full_name}</h1>
            <p>
              {contract.signing_team.city} {contract.signing_team.name} ({contract.signing_team.abbreviation}) |{" "}
              {contract.player.position ?? "Position TBD"} | {contract.term_years} year term
            </p>
          </div>
          <Link className="button-secondary inline-button" href="/contracts">
            Back to contracts
          </Link>
        </div>

        <PageContext
          goal="Turn an individual contract into a clean warehouse snapshot with the full agreement and its year-by-year rows in one place."
          questions={[
            "What is the agreement-level contract record?",
            "How do the yearly salary rows break down by season?",
            "Which additional cap-normalized or risk views should be layered on later?"
          ]}
        />

        <section className="stats-grid">
          <article className="stat-card">
            <span className="stat-label">Total Value</span>
            <strong className="stat-value">
              {formatMoney(contract.total_value)}
            </strong>
            <p>Full agreement value stored on the contract row.</p>
          </article>
          <article className="stat-card">
            <span className="stat-label">AAV</span>
            <strong className="stat-value">
              {formatMoney(contract.average_annual_value)}
            </strong>
            <p>Average annual value stored for the full contract.</p>
          </article>
          <article className="stat-card">
            <span className="stat-label">Contract Years</span>
            <strong className="stat-value">
              {contract.contract_years.length}
            </strong>
            <p>Season-level rows attached to this agreement.</p>
          </article>
        </section>
      </section>

      <section className="detail-grid">
        <article className="panel stack">
          <h2>Player and Team</h2>
          <DetailRow label="Player" value={contract.player.full_name} />
          <DetailRow
            label="Position"
            value={contract.player.position ?? "Position TBD"}
          />
          <DetailRow
            label="Shoots/Catches"
            value={contract.player.shoots_catches ?? "TBD"}
          />
          <DetailRow
            label="Team"
            value={`${contract.signing_team.city} ${contract.signing_team.name}`}
          />
          <DetailRow
            label="Conference"
            value={contract.signing_team.conference ?? "TBD"}
          />
          <DetailRow
            label="Division"
            value={contract.signing_team.division ?? "TBD"}
          />
        </article>

        <article className="panel stack">
          <h2>Contract Context</h2>
          <DetailRow
            label="Contract Type"
            value={contract.contract_type ?? "TBD"}
          />
          <DetailRow
            label="Signing Status"
            value={contract.signing_status ?? "TBD"}
          />
          <DetailRow
            label="Signed Date"
            value={
              contract.sign_date
                ? contract.sign_date.toISOString().slice(0, 10)
                : "Unknown"
            }
          />
          <DetailRow
            label="Start Season"
            value={contract.start_season.season_code}
          />
          <DetailRow
            label="End Season"
            value={contract.end_season.season_code}
          />
        </article>
      </section>

      <section className="panel stack">
        <h2>Contract Years</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Season</th>
                <th>Team</th>
                <th>Cap Hit</th>
                <th>Base Salary</th>
                <th>Signing Bonus</th>
                <th>Performance Bonus</th>
                <th>Total Salary</th>
              </tr>
            </thead>
            <tbody>
              {contract.contract_years.map((year) => (
                <tr key={year.id}>
                  <td>{year.season.season_code}</td>
                  <td>{year.team.abbreviation}</td>
                  <td>{formatMoney(year.cap_hit)}</td>
                  <td>{formatMoney(year.base_salary)}</td>
                  <td>{formatMoney(year.signing_bonus)}</td>
                  <td>{formatMoney(year.performance_bonus)}</td>
                  <td>{formatMoney(year.total_salary)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
