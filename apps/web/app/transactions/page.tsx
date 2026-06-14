import { PageContext } from "../components/page-context";

export default function TransactionsPage() {
  return (
    <main className="stack">
      <section className="panel stack">
        <span className="eyebrow">Transactions</span>
        <h1>Transaction context workspace</h1>
        <p>
          Placeholder for trades, signings, waivers, and other future movement
          analysis once approved data sources are introduced.
        </p>
      </section>

      <PageContext
        goal="Explain roster movement and eventually connect transactions back to contract value, cap pressure, and team intent."
        questions={[
          "What roster move happened and why did it matter?",
          "Which transactions changed contract or cap outlook most?",
          "Which teams are signaling future decisions through their moves?"
        ]}
      />
    </main>
  );
}

