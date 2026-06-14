import { prisma } from "@hockey/db";
import Link from "next/link";
import { PageContext } from "../../components/page-context";

export const dynamic = "force-dynamic";

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

async function getContract(id: string) {
  return prisma.contract.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      startSeason: true,
      endSeason: true,
      signedDate: true,
      totalValueUsd: true,
      capHitUsd: true,
      capPercentage: true,
      normalizedSeason: true,
      isHistorical: true,
      sourceLabel: true,
      notes: true,
      player: {
        select: {
          fullName: true,
          position: true,
          shoots: true
        }
      },
      team: {
        select: {
          name: true,
          abbreviation: true,
          league: true
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
            <h1>{contract.player.fullName}</h1>
            <p>
              {contract.team.name} ({contract.team.abbreviation}) |{" "}
              {contract.player.position ?? "Position TBD"} | {contract.status}
            </p>
          </div>
          <Link className="button-secondary inline-button" href="/contracts">
            Back to contracts
          </Link>
        </div>

        <PageContext
          goal="Turn an individual contract into a decision-ready snapshot with player context, team context, and normalized cap framing in one place."
          questions={[
            "Why does this specific contract matter for roster construction?",
            "How expensive is it relative to the cap environment?",
            "What additional comparison or risk work should eventually be layered onto this deal?"
          ]}
        />

        <section className="stats-grid">
          <article className="stat-card">
            <span className="stat-label">Cap Hit</span>
            <strong className="stat-value">
              {formatMoney(contract.capHitUsd)}
            </strong>
            <p>Raw annual cap hit for the seeded contract record.</p>
          </article>
          <article className="stat-card">
            <span className="stat-label">Cap %</span>
            <strong className="stat-value">
              {formatPercent(contract.capPercentage)}
            </strong>
            <p>Share of cap environment used for normalization work.</p>
          </article>
          <article className="stat-card">
            <span className="stat-label">Contract Term</span>
            <strong className="stat-value">
              {contract.startSeason}-{contract.endSeason}
            </strong>
            <p>Start and end seasons for this current local record.</p>
          </article>
        </section>
      </section>

      <section className="detail-grid">
        <article className="panel stack">
          <h2>Player and Team</h2>
          <DetailRow label="Player" value={contract.player.fullName} />
          <DetailRow
            label="Position"
            value={contract.player.position ?? "Position TBD"}
          />
          <DetailRow label="Shoots" value={contract.player.shoots ?? "TBD"} />
          <DetailRow label="Team" value={contract.team.name} />
          <DetailRow label="League" value={contract.team.league ?? "TBD"} />
        </article>

        <article className="panel stack">
          <h2>Contract Context</h2>
          <DetailRow
            label="Total Value"
            value={formatMoney(contract.totalValueUsd)}
          />
          <DetailRow
            label="Normalized Season"
            value={contract.normalizedSeason ?? "Not normalized yet"}
          />
          <DetailRow
            label="Historical"
            value={contract.isHistorical ? "Yes" : "No"}
          />
          <DetailRow
            label="Signed Date"
            value={
              contract.signedDate
                ? contract.signedDate.toISOString().slice(0, 10)
                : "Unknown"
            }
          />
          <DetailRow
            label="Source"
            value={contract.sourceLabel ?? "Local seed"}
          />
        </article>
      </section>

      <section className="panel stack">
        <h2>Notes</h2>
        <p>
          {contract.notes ??
            "No extra notes yet. This page is ready for future market comps, anchor scenarios, and contract rationale."}
        </p>
      </section>
    </main>
  );
}
