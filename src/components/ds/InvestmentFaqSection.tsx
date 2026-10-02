import type { InvestmentFaqItem } from "@/lib/seo/investment-faq";

export function InvestmentFaqSection({
  faqs,
  title = "Questions and answers",
  description,
}: {
  faqs: readonly InvestmentFaqItem[];
  title?: string;
  description?: string;
}) {
  return (
    <section className="mt-12 border-t border-border pt-9" aria-labelledby="investment-faq-heading">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Investment FAQ</p>
      <h2 id="investment-faq-heading" className="mt-2 text-2xl font-bold">{title}</h2>
      {description ? <p className="mt-3 max-w-4xl text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      <dl className="mt-7 grid gap-4 lg:grid-cols-2">
        {faqs.map((faq) => (
          <div key={faq.id} id={faq.id} className="rounded-xl border border-border bg-card/30 p-5">
            <dt className="text-base font-semibold leading-snug">{faq.question}</dt>
            <dd className="mt-3 text-sm leading-6 text-muted-foreground">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
