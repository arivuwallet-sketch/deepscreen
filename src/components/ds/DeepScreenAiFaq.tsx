import { AI_CHAT_FAQ_GROUPS } from "@/lib/seo/ai-chat-faq";

/**
 * This content is intentionally server-rendered, fully visible and separate
 * from the local browser-only chat conversation. The exact same answers power
 * the chat page's FAQPage JSON-LD and the site's AI-readable knowledge index.
 */
export function DeepScreenAiFaq() {
  const count = AI_CHAT_FAQ_GROUPS.reduce((total, group) => total + group.faqs.length, 0);

  return (
    <section
      id="chatbot-faq"
      className="mx-auto w-full max-w-5xl scroll-mt-28 px-4 pb-20 pt-12 sm:px-6 lg:px-8"
      aria-labelledby="chatbot-faq-title"
    >
      <header className="max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          DeepScreen AI · Public questions and answers
        </p>
        <h2 id="chatbot-faq-title" className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          DeepScreen AI chatbot: Frequently asked questions
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          DeepScreen AI explains finance topics and helps you research supported companies across
          NSE, BSE, NYSE, Nasdaq and LSE. It can retrieve the latest available stock data where
          providers respond, but cannot guarantee live prices or investment outcomes. These
          {" "}
          {count} direct answers explain what it can do, how to verify results and how the
          browser-stored chat works.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Product capabilities checked against the DeepScreen chat implementation · Updated{" "}
          <time dateTime="2026-10-07">7 October 2026</time>
        </p>
      </header>

      <nav
        aria-label="Jump to DeepScreen AI chatbot FAQ topics"
        className="mt-7 flex flex-wrap gap-2"
      >
        {AI_CHAT_FAQ_GROUPS.map((group) => (
          <a
            key={group.id}
            href={`#${group.id}`}
            className="rounded-full border border-border bg-card/30 px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            {group.title}
          </a>
        ))}
      </nav>

      {AI_CHAT_FAQ_GROUPS.map((group) => (
        <section
          key={group.id}
          id={group.id}
          className="mt-11 scroll-mt-28 border-t border-border pt-8"
          aria-labelledby={`${group.id}-title`}
        >
          <h3 id={`${group.id}-title`} className="text-xl font-semibold tracking-tight sm:text-2xl">
            {group.title}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {group.description}
          </p>
          <dl className="mt-6 grid items-start gap-4 md:grid-cols-2">
            {group.faqs.map((faq) => (
              <div
                key={faq.id}
                id={faq.id}
                className="scroll-mt-28 rounded-xl border border-border bg-card/30 p-5"
              >
                <dt>
                  <h4 className="text-sm font-semibold leading-6 text-foreground">
                    {faq.question}
                  </h4>
                </dt>
                <dd className="mt-3 text-sm leading-7 text-muted-foreground">
                  <p>{faq.answer}</p>
                  <a
                    href={faq.link.href}
                    className="mt-3 inline-block font-medium text-primary hover:underline"
                  >
                    {faq.link.label} →
                  </a>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      <aside className="mt-12 rounded-xl border border-primary/20 bg-primary/5 p-5">
        <h3 className="font-semibold text-foreground">Verify before you act</h3>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          The chatbot is for education and research, not personal investment advice. Prices,
          fundamentals and regulations can change. Consult{" "}
          <a href="/data-sources" className="text-primary hover:underline">data sources</a>,{" "}
          <a href="/methodology" className="text-primary hover:underline">model methodology</a>,{" "}
          <a href="/research-checklist" className="text-primary hover:underline">research checks</a>{" "}
          and primary filings before relying on an answer. Do not paste confidential account
          credentials into chat.
        </p>
      </aside>
    </section>
  );
}
