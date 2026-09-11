import { Link } from "@tanstack/react-router";

import { keywordGroups } from "@/lib/seo/keywords";

type Props = {
  /** Group ids to render. Omit to render every topic group. */
  ids?: string[];
  title?: string;
  intro?: string;
  /** Total number of keyword phrases shown on the page, spread across groups. */
  limit?: number;
  /** Set when the parent already provides a max-width container with padding. */
  inContainer?: boolean;
};

const GROUP_LINK: Record<string, { to: string; label: string }> = {
  screener: { to: "/", label: "Open the screener" },
  stocks: { to: "/", label: "Search any stock" },
  learn: { to: "/learn", label: "Read the guides" },
  options: { to: "/options", label: "Options tools" },
  calendar: { to: "/calendar", label: "Earnings & dividend calendar" },
  ipo: { to: "/ipo", label: "IPO calendar" },
  portfolio: { to: "/portfolio", label: "Build a portfolio" },
  india: { to: "/exchange/NSE", label: "NSE & BSE screener" },
  us: { to: "/exchange/NYSE", label: "NYSE & Nasdaq screener" },
  uk: { to: "/exchange/LSE", label: "LSE screener" },
};

export function TopicIndex({
  ids,
  title = "Topics covered on DeepScreen",
  intro,
  limit = 45,
  inContainer = false,
}: Props) {
  const selected = ids ? keywordGroups.filter((g) => ids.includes(g.id)) : keywordGroups;
  if (selected.length === 0) return null;

  // Spread the page-wide keyword budget evenly across the selected groups so no
  // page ever renders a wall of terms.
  const perGroup = Math.max(4, Math.floor(limit / selected.length));
  const groups = selected.map((g) => ({ ...g, keywords: g.keywords.slice(0, perGroup) }));

  const body = (
    <>
      <h2 id="topic-index" className="text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      {intro ? (
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{intro}</p>
      ) : null}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => {
          const link = GROUP_LINK[group.id];
          return (
            <div
              key={group.id}
              className="rounded-lg border border-border bg-card/40 p-5 sm:p-6"
            >
              <h3 className="text-sm font-semibold text-foreground">{group.title}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.keywords.map((k) => (
                  <li
                    key={k}
                    className="rounded-full border border-border px-3 py-1 text-xs leading-5 text-muted-foreground"
                  >
                    {k}
                  </li>
                ))}
              </ul>
              {link ? (
                <Link
                  to={link.to}
                  className="mt-5 inline-block text-xs font-medium text-primary hover:underline"
                >
                  {link.label}
                </Link>
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );

  if (inContainer) {
    return (
      <section aria-labelledby="topic-index" className="mt-14 border-t border-border pt-10">
        {body}
      </section>
    );
  }

  return (
    <section aria-labelledby="topic-index" className="mt-14 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{body}</div>
    </section>
  );
}
