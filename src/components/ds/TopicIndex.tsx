import { Link } from "@tanstack/react-router";
import { useId } from "react";

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
  stocks: { to: "/methodology", label: "Read the methodology" },
  learn: { to: "/learn", label: "Read the guides" },
  options: { to: "/options", label: "Options tools" },
  calendar: { to: "/calendar", label: "Economic calendar" },
  ipo: { to: "/ipo", label: "IPO calendar" },
  portfolio: { to: "/portfolio", label: "Build a portfolio" },
  india: { to: "/exchange/NSE", label: "NSE screener" },
  us: { to: "/exchange/NYSE", label: "NYSE screener" },
  uk: { to: "/exchange/LSE", label: "LSE screener" },
};

export function TopicIndex({
  ids,
  title = "Topics covered on DeepScreen",
  intro,
  inContainer = false,
}: Props) {
  const headingId = useId();
  const selected = ids ? keywordGroups.filter((g) => ids.includes(g.id)) : keywordGroups;
  if (selected.length === 0) return null;

  const descriptions: Record<string, string> = {
    screener: "Compare supported markets and explore the stock screening tools.",
    stocks: "Review the scoring factors, underlying data and limitations before comparing companies.",
    learn: "Learn how valuation, profitability and leverage inform company research.",
    options: "Explore strategy construction, expiry breakevens and potential losses.",
    calendar: "Follow scheduled economic releases that can affect financial markets.",
    ipo: "Review available offering information and risks before researching a new listing.",
    portfolio: "Keep the companies you are researching together in your watchlist.",
    india: "Explore NSE listings and fundamental research for Indian companies.",
    us: "Browse NYSE listings and company research across US industries.",
    uk: "Explore supported London listings and the available company fundamentals.",
  };
  const groups = selected;

  const body = (
    <>
      <h2 id={headingId} className="text-lg font-semibold tracking-tight text-foreground">
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
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{descriptions[group.id]}</p>
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
      <section aria-labelledby={headingId} className="mt-14 border-t border-border pt-10">
        {body}
      </section>
    );
  }

  return (
    <section aria-labelledby={headingId} className="mt-14 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{body}</div>
    </section>
  );
}
