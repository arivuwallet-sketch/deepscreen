type Answer = { id: string; question: string; answer: string; href: string; label: string };
export function AnswerList({ answers }: { answers: readonly Answer[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {answers.map((a) => (
        <section
          key={a.id}
          id={a.id}
          className="scroll-mt-40 rounded-lg border border-border bg-panel p-5"
        >
          <h3 className="font-semibold">{a.question}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a.answer}</p>
          <a className="mt-3 inline-block text-sm text-primary hover:underline" href={a.href}>
            {a.label} →
          </a>
        </section>
      ))}
    </div>
  );
}
