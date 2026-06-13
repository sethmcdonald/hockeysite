export default function HomePage() {
  return (
    <main className="stack">
      <section className="hero">
        <span className="eyebrow">Initial Scaffold</span>
        <h1>Decision support for hockey roster, contract, and team context.</h1>
        <p>
          This starter app establishes the product shell for player, team,
          contract, transaction, and Anchors Away workflows without introducing
          authentication or external data dependencies yet.
        </p>
        <span className="label">No auth, no paid feeds, no unofficial sources</span>
      </section>

      <section className="grid">
        <article className="panel">
          <h2>SAUCE</h2>
          <p>Structured insight surfaces will live here once trusted inputs are defined.</p>
        </article>
        <article className="panel">
          <h2>ANCHOR</h2>
          <p>Anchor concepts will support stable comparison across teams, players, and eras.</p>
        </article>
        <article className="panel">
          <h2>Cap Context</h2>
          <p>Historical contract analysis will eventually rely on cap percentage normalization.</p>
        </article>
      </section>
    </main>
  );
}

