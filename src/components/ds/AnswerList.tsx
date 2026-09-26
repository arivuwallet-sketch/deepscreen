type Answer = { id: string; question: string; answer: string; href: string; label: string };

export function AnswerList({ answers }: { answers: readonly Answer[] }) {
  const normalize = (href: string) => href === "/compare" ? "/compare/pe-vs-peg-ratio" : href;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {answers.map((answer) => (
        <section key={answer.id} id={answer.id} className="scroll-mt-40 rounded-lg border border-border bg-panel p-5">
          <h3 className="font-semibold">{answer.question}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{answer.answer}</p>
          <a className="mt-3 inline-block text-sm text-primary hover:underline" href={normalize(answer.href)}>
            {answer.label} →
          </a>
        </section>
      ))}
    </div>
  );
}
