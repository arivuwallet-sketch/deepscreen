import type { InvestmentFaqItem } from "@/lib/seo/investment-faq";

const GROUPS = [
  ["ALL", "General investment questions"],
  ["FUND", "Mutual fund FAQ"],
  ["ETF", "ETF FAQ"],
  ["REIT", "REIT FAQ"],
] as const;

export function InvestmentFaqSection({
  faqs,
  title = "Questions and answers",
  description,
}: {
  faqs: readonly InvestmentFaqItem[];
  title?: string;
  description?: string;
}) {
  const groups = GROUPS
    .map(([type, label]) => ({ type, label, items: faqs.filter((faq) => faq.type === type) }))
    .filter((group) => group.items.length);

  return (
    <section className="mt-12 border-t border-border pt-9" aria-labelledby="investment-faq-heading">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Investment FAQ</p>
      <h2 id="investment-faq-heading" className="mt-2 text-2xl font-bold">{title}</h2>
      {description ? <p className="mt-3 max-w-4xl text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      <div className="mt-8 space-y-9">
        {groups.map((group) => (
          <section key={group.type} aria-labelledby={"faq-group-" + group.type.toLowerCase()}>
            <h3 id={"faq-group-" + group.type.toLowerCase()} className="text-lg font-semibold">{group.label}</h3>
            <dl className="mt-4 grid gap-4 lg:grid-cols-2">
              {group.items.map((faq) => (
                <div key={faq.id} id={faq.id} className="rounded-xl border border-border bg-card/30 p-5">
                  <dt className="text-base font-semibold leading-snug">{faq.question}</dt>
                  <dd className="mt-3 text-sm leading-6 text-muted-foreground">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </section>
  );
}
