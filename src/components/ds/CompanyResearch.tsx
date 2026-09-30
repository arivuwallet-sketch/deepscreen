import { Link } from "@tanstack/react-router";
import type { Stock } from "@/lib/deepscreen/types";
import type { LiveFundamentals } from "@/lib/market/yahoo.server";
import { STOCK_COMPARISONS } from "@/lib/seo/content";

/** SSR-readable identity and profile. Directory estimates are never company facts here. */
export function CompanyResearch({
  stock,
  profile,
}: {
  stock: Stock;
  profile?: LiveFundamentals | null;
}) {
  const summary = profile?.summary?.trim();
  // Use the exact provider ticker when available. Fallback follows the existing
  // Yahoo integration's exchange mapping without changing its data requests.
  const suffix: Record<string, string> = { NSE: ".NS", BSE: ".BO", LSE: ".L" };
  const ticker =
    profile?.symbol?.trim() ||
    `${stock.symbol.trim().toUpperCase().replace(/\s+/g, "-")}${suffix[stock.exchange.toUpperCase()] ?? ""}`;
  const sourceUrl = `https://finance.yahoo.com/quote/${encodeURIComponent(ticker)}/profile/`;
  let companyWebsite: string | null = null;
  if (profile?.website) {
    try {
      const url = new URL(profile.website);
      if (["https:", "http:"].includes(url.protocol) && !url.username && !url.password)
        companyWebsite = url.href;
    } catch {
      /* Omit malformed provider URLs. */
    }
  }
  const comparisons = STOCK_COMPARISONS.filter((pair) =>
    [pair.left, pair.right].some(
      (item) => item.exchange === stock.exchange && item.symbol === stock.symbol,
    ),
  );
  return (
    <section
      className="mt-8 rounded-xl border border-border bg-card p-5 sm:p-6"
      aria-label={`${stock.name} company research`}
    >
      <h2 className="text-xl font-semibold">About {stock.name}</h2>
      <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Listed company</dt>
          <dd className="mt-1 font-medium">{stock.name}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Exchange and ticker</dt>
          <dd className="mt-1">
            <Link
              to="/exchange/$code"
              params={{ code: stock.exchange }}
              className="text-primary hover:underline"
            >
              {stock.exchange} stock directory
            </Link>{" "}
            · {stock.symbol}
          </dd>
        </div>
        {profile?.sector && (
          <div>
            <dt className="text-muted-foreground">Provider sector</dt>
            <dd className="mt-1">{profile.sector}</dd>
          </div>
        )}
        {profile?.industry && (
          <div>
            <dt className="text-muted-foreground">Provider industry</dt>
            <dd className="mt-1">{profile.industry}</dd>
          </div>
        )}
      </dl>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {summary ||
          `${stock.name} is listed in DeepScreen’s ${stock.exchange} directory under the ticker ${stock.symbol}. A verified business description is currently unavailable; consult the company profile or its annual report for products, services and operating segments.`}
      </p>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span>
          {summary ? "Source: " : "Company profile reference: "}
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Yahoo Finance — {stock.name} company profile
          </a>
        </span>
        {companyWebsite && (
          <a
            href={companyWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Company website
          </a>
        )}
      </p>
      <h3 className="mt-6 font-semibold">Financial statements and reporting periods</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Available ratios are snapshots. This page does not provide a complete historical
        quarterly-results, profit-and-loss, balance-sheet or shareholding series. Use company
        filings to verify reporting periods, accounting changes and trends.
      </p>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm">
        <Link
          to="/learn/$slug"
          params={{ slug: "free-cash-flow-analysis-guide" }}
          className="text-primary hover:underline"
        >
          How to read operating and free cash flow
        </Link>
        <Link
          to="/learn/$slug"
          params={{ slug: "how-to-detect-a-debt-trap" }}
          className="text-primary hover:underline"
        >
          Balance-sheet and debt checklist
        </Link>
        {comparisons.map((pair) => (
          <Link
            key={pair.slug}
            to="/compare/$slug"
            params={{ slug: pair.slug }}
            className="text-primary hover:underline"
          >
            Compare {pair.left.symbol} and {pair.right.symbol}: model inputs
          </Link>
        ))}
      </div>
    </section>
  );
}
