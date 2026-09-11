import { Link } from "@tanstack/react-router";

import { keywordGroups } from "@/lib/seo/keywords";

type Props = {
  /** Group ids to render. Omit to render every topic group. */
  ids?: string[];
  title?: string;
  intro?: string;
};

const GROUP_LINK: Record<string, { to: string; label: string }> = {
  screener: { to: "/", label: "Open the screener" },
  stocks: { to: "/", label: "Search any stock" },
  learn: { to: "/", label: "Start screening" },
  options: { to: "/options", label: "Options tools" },
  calendar: { to: "/calendar", label: "Earnings & dividend calendar" },
  ipo: { to: "/ipo", label: "IPO calendar" },
  portfolio: { to: "/portfolio", label: "Build a portfolio" },
  india: { to: "/exchange/NSE", label: "NSE & BSE screener" },
  us: { to: "/exchange/NYSE", label: "NYSE & Nasdaq screener" },
  uk: { to: "/exchange/LSE", label: "LSE screener" },
};

export function TopicIndex({ ids, title = "Topics covered on DeepScreen", intro }: Props) {
  const groups = ids ? keywordGroups.filter((g) => ids.includes(g.id)) : keywordGroups;
  if (groups.length === 0) return null;

  return (
    <section aria-labelledby="topic-index" className="mt-12 border-t border-border pt-8">
      <h2 id="topic-index" className="text-lg font-semibold text-foreground">
        {title}
      </h2>
      {intro ? <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{intro}</p> : null}
      <div className="mt-6 space-y-6">
        {groups.map((group) => {
          const link = GROUP_LINK[group.id];
          return (
            <div key={group.id}>
              <h3 className="text-sm font-semibold text-foreground">{group.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {group.keywords.join(" · ")}
              </p>
              {link ? (
                <Link
                  to={link.to}
                  className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                >
                  {link.label}
                </Link>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
