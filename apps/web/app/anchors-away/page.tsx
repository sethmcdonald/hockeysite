import Link from "next/link";
import { PageContext } from "../components/page-context";

export default function AnchorsAwayPage() {
  return (
    <main className="stack">
      <section className="panel stack">
        <div className="split">
          <div className="stack">
            <span className="eyebrow">Anchors Away</span>
            <h1>Not part of phase 1</h1>
          </div>
          <Link className="button-secondary inline-button" href="/contracts">
            View contracts
          </Link>
        </div>

        <p>
          The current phase is building the NHL Salary Cap Era warehouse
          foundation only. `ANCHOR` logic, scenario tooling, and risk framing
          are intentionally not implemented yet.
        </p>

        <PageContext
          goal="Make it explicit that the warehouse foundation comes first, and ANCHOR workflows will be layered on only after the historical data model is trustworthy."
          questions={[
            "Which warehouse tables need to exist before ANCHOR can be credible?",
            "How will contracts and roster history eventually feed anchor analysis?",
            "What is intentionally not modeled yet in this phase?"
          ]}
        />
      </section>

      <section className="warning stack">
        <strong>Phase boundary</strong>
        <p>
          This page is a deliberate placeholder so the product surface does not
          imply that contract-risk or anchor modeling already exists.
        </p>
      </section>
    </main>
  );
}
