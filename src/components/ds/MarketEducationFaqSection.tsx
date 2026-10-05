import type { MarketEducationFaq } from "@/lib/seo/market-education-faq";

export function MarketEducationFaqSection({
  faqs,
  title,
  description,
}: {
  faqs: readonly MarketEducationFaq[];
  title: string;
  description: string;
}) {
  return (
    <section className="mt-12 border-t border-border pt-9" aria-labelledby="market-education-faq-heading">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Questions &amp; answers</p>
      <h2 id="market-education-faq-heading" className="mt-2 text-2xl font-bold">{title}</h2>
      <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">{description}</p>
      <dl className="mt-7 grid gap-4 lg:grid-cols-2">
        {faqs.map((faq) => (
          <div key={faq.id} id={faq.id} className="scroll-mt-28 rounded-xl border border-border bg-card/30 p-5">
            <dt className="font-semibold leading-snug text-foreground">{faq.question}</dt>
            <dd className="mt-3 text-sm leading-6 text-muted-foreground">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
