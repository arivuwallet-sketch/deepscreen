import type { MarketGuideFaq } from "@/lib/seo/market-guide-faq";

export function MarketGuideFaqSection({
  faqs,
  title,
  description,
}: {
  faqs: readonly MarketGuideFaq[];
  title: string;
  description: string;
}) {
  return (
    <section className="mt-14 border-t border-border pt-10" aria-labelledby="market-guide-faq">
      <p className="font-mono text-xs uppercase text-primary">Questions &amp; answers</p>
      <h2 id="market-guide-faq" className="mt-3 text-2xl font-semibold">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
      <dl className="mt-7 grid gap-4 lg:grid-cols-2">
        {faqs.map((faq) => (
          <div key={faq.id} id={faq.id} className="rounded-xl border border-border bg-card/30 p-5">
            <dt className="font-semibold leading-snug text-foreground">{faq.question}</dt>
            <dd className="mt-3 text-sm leading-6 text-muted-foreground">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
