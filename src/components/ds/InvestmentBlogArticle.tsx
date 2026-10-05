import { Link } from "@tanstack/react-router";
import type { BlogParagraph, BlogPost, BlogTable } from "@/lib/content/investment-blog";
import { faqAnchor } from "@/lib/seo/faq-anchor";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value + "T00:00:00Z"));
}

function SourceRefs({ ids, post }: { ids: string[] | undefined; post: BlogPost }) {
  if (!ids?.length) return null;
  const index = new Map(post.sources.map((source, i) => [source.id, i + 1]));
  return (
    <>
      {" "}
      {ids.map((id) => {
        const n = index.get(id);
        return n ? (
          <a key={id} href={"#source-" + id} className="whitespace-nowrap align-super text-[10px] font-semibold text-primary hover:underline" aria-label={"Source " + n}>
            [{n}]
          </a>
        ) : null;
      })}
    </>
  );
}

function Paragraph({ paragraph, post }: { paragraph: BlogParagraph; post: BlogPost }) {
  return (
    <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
      {paragraph.text}
      <SourceRefs ids={paragraph.sources} post={post} />
    </p>
  );
}

function DataTable({ table }: { table: BlogTable }) {
  return (
    <figure className="mt-6">
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead className="bg-card/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {table.headers.map((header) => (
                <th key={header} className="border-b border-border px-4 py-3 font-semibold">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-border/60 last:border-0">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className={"px-4 py-3 align-top leading-6 " + (cellIndex === 0 ? "font-medium text-foreground" : "text-muted-foreground")}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="mt-2 text-xs leading-5 text-muted-foreground">{table.caption}</figcaption>
    </figure>
  );
}

export function InvestmentBlogArticle({ post }: { post: BlogPost }) {
  return (
    <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header>
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-primary">
          <Link to="/blog" className="hover:underline">DeepScreen research</Link>
          <span aria-hidden="true">/</span>
          <span>{post.category}</span>
        </div>
        <h1 className="mt-4 max-w-4xl text-3xl font-bold leading-tight sm:text-4xl">{post.h1}</h1>
        <p className="mt-4 max-w-4xl text-base leading-7 text-muted-foreground">{post.excerpt}</p>
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span>By <strong className="text-foreground">Sooraj</strong> · Founder, DeepScreen</span>
          <span>Published <time dateTime={post.published}>{formatDate(post.published)}</time></span>
          {post.updated !== post.published ? <span>Updated <time dateTime={post.updated}>{formatDate(post.updated)}</time></span> : null}
          <span>{post.readingMinutes} min read</span>
        </div>
      </header>

      <section className="mt-8 rounded-xl border border-primary/25 bg-primary/5 p-5" aria-labelledby="direct-answer">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Direct answer</p>
        <h2 id="direct-answer" className="sr-only">Direct answer</h2>
        <p className="mt-2 text-base leading-7 text-foreground">{post.directAnswer}</p>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-card/30 p-5" aria-labelledby="key-takeaways">
        <h2 id="key-takeaways" className="text-lg font-semibold">Key takeaways</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
          {post.keyTakeaways.map((item) => <li key={item}>• {item}</li>)}
        </ul>
      </section>

      <section className="mt-8 rounded-xl border border-border p-5" aria-labelledby="unique-angle">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">DeepScreen original framework</p>
        <h2 id="unique-angle" className="mt-2 text-lg font-semibold">What this guide adds</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{post.uniqueAngle}</p>
      </section>

      <nav className="mt-8 rounded-xl border border-border bg-panel p-5" aria-label="Article contents">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contents</p>
        <ol className="mt-3 grid gap-2 text-sm md:grid-cols-2">
          {post.sections.map((section, index) => (
            <li key={section.id}>
              <a href={"#" + section.id} className="text-primary hover:underline">
                {index + 1}. {section.heading}
              </a>
            </li>
          ))}
          <li><a href="#faq" className="text-primary hover:underline">FAQ</a></li>
          <li><a href="#sources" className="text-primary hover:underline">Sources</a></li>
        </ol>
      </nav>

      <div className="mt-10 space-y-12">
        {post.sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24 border-t border-border pt-8">
            <h2 className="text-2xl font-bold leading-tight">{section.heading}</h2>
            <p className="mt-3 text-base font-medium leading-7 text-foreground">{section.answer}</p>
            {section.paragraphs?.map((paragraph, index) => <Paragraph key={index} paragraph={paragraph} post={post} />)}
            {section.bullets?.length ? (
              <ul className="mt-5 space-y-3 text-[15px] leading-7 text-muted-foreground">
                {section.bullets.map((item) => <li key={item} className="pl-1">• {item}</li>)}
              </ul>
            ) : null}
            {section.table ? <DataTable table={section.table} /> : null}
            {section.note ? (
              <p className="mt-4 rounded-lg border border-border bg-card/30 p-4 text-xs leading-6 text-muted-foreground">
                <strong className="text-foreground">Method note:</strong> {section.note}
              </p>
            ) : null}
          </section>
        ))}
      </div>

      <section id="faq" className="mt-12 scroll-mt-24 border-t border-border pt-9" aria-labelledby="faq-title">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">FAQ</p>
        <h2 id="faq-title" className="mt-2 text-2xl font-bold">Common questions</h2>
        <dl className="mt-6 space-y-4">
          {post.faqs.map((faq) => (
            <div key={faq.q} id={faqAnchor(faq.q)} className="scroll-mt-24 rounded-xl border border-border bg-card/30 p-5">
              <dt className="font-semibold text-foreground">{faq.q}</dt>
              <dd className="mt-2 text-sm leading-6 text-muted-foreground">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12 border-t border-border pt-9" aria-labelledby="next-step">
        <h2 id="next-step" className="text-xl font-semibold">Continue your research</h2>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {post.relatedLinks.map((link) => (
            link.href.startsWith("/") ? (
              <a key={link.href} href={link.href} className="text-primary hover:underline">{link.label}</a>
            ) : (
              <a key={link.href} href={link.href} className="text-primary hover:underline">{link.label}</a>
            )
          ))}
        </div>
      </section>

      <section id="sources" className="mt-12 scroll-mt-24 border-t border-border pt-9" aria-labelledby="sources-title">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Sources</p>
        <h2 id="sources-title" className="mt-2 text-2xl font-bold">References</h2>
        <ol className="mt-5 space-y-3 text-sm leading-6 text-muted-foreground">
          {post.sources.map((source, index) => (
            <li key={source.id} id={"source-" + source.id}>
              <span className="font-medium text-foreground">[{index + 1}] {source.title}</span> · {source.publisher} · {source.date}.{" "}
              <a href={source.href} className="text-primary hover:underline">Primary/source page</a>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10 rounded-xl border border-border bg-panel p-5" aria-labelledby="editorial-disclosure">
        <h2 id="editorial-disclosure" className="font-semibold">Editorial disclosure</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          DeepScreen is a financial-research platform. This article is educational and is not personalized investment, tax or legal advice. Market data, regulations, contract specifications and issuer disclosures can change; verify the latest exchange, issuer and regulator material before acting.
        </p>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Author: Sooraj, Founder of DeepScreen. Facts were checked against the cited regulator, exchange, industry-association and issuer sources on {formatDate(post.updated)}. No independent credentialed reviewer has been claimed.
        </p>
      </section>
    </article>
  );
}
