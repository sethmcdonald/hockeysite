type PageContextProps = {
  goal: string;
  questions: string[];
  title?: string;
};

export function PageContext({
  goal,
  questions,
  title = "Page Context"
}: PageContextProps) {
  return (
    <section className="context-card">
      <div className="stack">
        <span className="eyebrow">{title}</span>
        <p>
          <strong className="context-strong">Goal:</strong> {goal}
        </p>
      </div>

      <div className="stack">
        <span className="context-subtitle">This page should help answer:</span>
        <ul className="context-list">
          {questions.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
