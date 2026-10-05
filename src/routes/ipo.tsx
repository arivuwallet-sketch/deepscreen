import { jsonLd } from "@/lib/seo/json-ld";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { Shell } from "@/components/ds/Shell";
import { TopicIndex } from "@/components/ds/TopicIndex";
import { ipoKeywords, metaKeywords, screenerKeywords } from "@/lib/seo/keywords";
import { EXCHANGES } from "@/lib/deepscreen/exchanges";
import { formatPrice } from "@/lib/deepscreen/format";
import { analyzeIpoResearch } from "@/lib/deepscreen/ipo-analysis";
import { daysAway, type IpoStatus } from "@/lib/deepscreen/ipos";
import { findStock } from "@/lib/deepscreen/stocks";
import { getLiveIpos } from "@/lib/market/market.functions";
import type { LiveIpo } from "@/lib/market/ipo.server";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ipo")({
  staticData: { sitemap: true },
  loader: async () => {
    try {
      return { initialIpos: (await getLiveIpos()) as LiveIpo[] };
    } catch (error) {
      console.error("[ipo-route] live IPO feed unavailable", error);
      return { initialIpos: [] as LiveIpo[] };
    }
  },
  head: () => ({
    meta: [
      { title: "IPO Calendar & Analysis — NSE, BSE, NYSE, NASDAQ, LSE | DeepScreen" },
      {
        name: "description",
        content:
          "Live IPO calendar and research across NSE, BSE, NYSE, Nasdaq and LSE with official issue terms, subscription demand, offer size, dates, deal structure and transparent research signals.",
      },
      { property: "og:title", content: "Live IPO Calendar & Analysis — DeepScreen" },
      {
        property: "og:description",
        content:
          "Track IPO price bands, issue size, subscription demand, dates and research signals across India, the US and the UK.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://deepscreen.online/ipo" },
      { name: "twitter:title", content: "IPO Calendar & Analysis — DeepScreen" },
      {
        name: "twitter:description",
        content:
          "Official-source IPO data plus transparent demand, deal-structure and data-quality analysis across five exchanges.",
      },
      { name: "keywords", content: metaKeywords(ipoKeywords, screenerKeywords) },
    ],
    links: [{ rel: "canonical", href: "https://deepscreen.online/ipo" }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://deepscreen.online/" },
            { "@type": "ListItem", position: 2, name: "IPO calendar", item: "https://deepscreen.online/ipo" },
          ],
        }),
      },
    ],
  }),
  component: IpoPage,
});

const STATUS_STYLE: Record<IpoStatus, string> = {
  open: "bg-bull/15 text-bull",
  upcoming: "bg-primary/15 text-primary",
  closed: "bg-muted text-muted-foreground",
  listed: "bg-accent text-foreground",
};

const DEMAND_STYLE = {
  strong: "text-bull",
  positive: "text-bull",
  neutral: "text-warn",
  weak: "text-bear",
  unknown: "text-muted-foreground",
} as const;

const SEGMENTS = [
  { key: "ALL", label: "All segments" },
  { key: "mainboard", label: "Mainboard" },
  { key: "sme", label: "SME / AIM" },
  { key: "us", label: "US calendar" },
] as const;

type SortMode = "latest" | "subscription" | "size";

function fmtBand(ipo: LiveIpo): string {
  if (ipo.bandLow == null && ipo.bandHigh == null) return "TBA";
  const lo = formatPrice(ipo.bandLow ?? ipo.bandHigh ?? 0, ipo.exchange);
  const hi = formatPrice(ipo.bandHigh ?? ipo.bandLow ?? 0, ipo.exchange);
  return lo === hi ? lo : `${lo} – ${hi}`;
}

function currencySymbol(ipo: LiveIpo): string {
  const currency = (ipo.currency ?? "").toUpperCase();
  if (currency === "INR") return "₹";
  if (currency === "USD") return "$";
  if (currency === "GBP" || currency === "GBP") return "£";
  return currency ? `${currency} ` : "";
}

function fmtSize(ipo: LiveIpo): string {
  if (ipo.issueSize == null || ipo.issueSize <= 0) return "TBA";
  const digits = ipo.issueSize < 1 ? 2 : ipo.issueSize < 10 ? 2 : 1;
  return `${currencySymbol(ipo)}${ipo.issueSize.toFixed(digits)}B`;
}

function fmtCount(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "TBA";
  return Math.round(value).toLocaleString();
}

function fmtMultiple(value: number | null): string {
  return value == null || !Number.isFinite(value) ? "TBA" : `${value.toFixed(2)}x`;
}

function eventDate(ipo: LiveIpo): string {
  return (
    ipo.openDate ??
    ipo.expectedPricingDate ??
    ipo.listingDate ??
    ipo.closeDate ??
    ipo.filingDate ??
    ""
  );
}

function timing(ipo: LiveIpo): string {
  if (ipo.status === "open" && ipo.closeDate) return `closes in ${daysAway(ipo.closeDate)}d`;
  if (ipo.status === "upcoming" && ipo.openDate) return `opens in ${daysAway(ipo.openDate)}d`;
  if (ipo.expectedPricingDate) return `expected pricing in ${daysAway(ipo.expectedPricingDate)}d`;
  if (ipo.status === "upcoming" && ipo.exchange === "LSE" && ipo.listingDate) {
    return `expected trading in ${daysAway(ipo.listingDate)}d`;
  }
  if (ipo.status === "listed" && ipo.listingDate) {
    return `listed ${Math.abs(daysAway(ipo.listingDate))}d ago`;
  }
  if (ipo.status === "closed" && ipo.listingDate) return `lists in ${daysAway(ipo.listingDate)}d`;
  return "timeline incomplete";
}

function dateLabel(ipo: LiveIpo): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  if (ipo.openDate) rows.push({ label: "Opens", value: ipo.openDate });
  if (ipo.closeDate) rows.push({ label: "Closes", value: ipo.closeDate });
  if (ipo.expectedPricingDate) {
    rows.push({ label: "Expected pricing", value: ipo.expectedPricingDate });
  }
  if (ipo.listingDate) {
    rows.push({
      label: ipo.exchange === "LSE" && ipo.status !== "listed" ? "Expected trading" : "Lists",
      value: ipo.listingDate,
    });
  }
  if (ipo.filingDate) rows.push({ label: "Filed", value: ipo.filingDate });
  return rows;
}

function IpoPage() {
  const { initialIpos } = Route.useLoaderData();
  const fetchIpos = useServerFn(getLiveIpos);
  const { data, isLoading, isError, dataUpdatedAt } = useQuery({
    queryKey: ["live-ipos"],
    queryFn: () => fetchIpos(),
    ...(initialIpos.length > 0 ? { initialData: initialIpos } : {}),
    refetchInterval: 5 * 60_000,
    staleTime: 2 * 60_000,
  });

  const [exchange, setExchange] = useState<string>("ALL");
  const [status, setStatus] = useState<IpoStatus | "ALL">("ALL");
  const [segment, setSegment] = useState<string>("ALL");
  const [sort, setSort] = useState<SortMode>("latest");
  const [query, setQuery] = useState("");

  const all = useMemo<LiveIpo[]>(() => {
    const live = (data as LiveIpo[] | undefined) ?? [];
    return [...live].sort((a, b) => eventDate(b).localeCompare(eventDate(a)));
  }, [data]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = all.filter(
      (ipo) =>
        (exchange === "ALL" || ipo.exchange === exchange) &&
        (status === "ALL" || ipo.status === status) &&
        (segment === "ALL" || ipo.segment === segment) &&
        (q === "" ||
          ipo.name.toLowerCase().includes(q) ||
          ipo.symbol.toLowerCase().includes(q) ||
          (ipo.market ?? "").toLowerCase().includes(q)),
    );

    return filtered.sort((a, b) => {
      if (sort === "subscription") {
        return (b.subscriptionMultiple ?? -1) - (a.subscriptionMultiple ?? -1);
      }
      if (sort === "size") return (b.issueSize ?? -1) - (a.issueSize ?? -1);
      return eventDate(b).localeCompare(eventDate(a));
    });
  }, [all, exchange, status, segment, sort, query]);

  const counts = useMemo(() => {
    const value: Record<string, number> = { open: 0, upcoming: 0, closed: 0, listed: 0 };
    for (const ipo of all) value[ipo.status] = (value[ipo.status] ?? 0) + 1;
    return value;
  }, [all]);

  const demandLeader = useMemo(
    () =>
      all
        .filter((ipo) => ipo.subscriptionMultiple !== null)
        .sort((a, b) => (b.subscriptionMultiple ?? 0) - (a.subscriptionMultiple ?? 0))[0] ?? null,
    [all],
  );

  const largestIssue = useMemo(
    () =>
      all
        .filter((ipo) => ipo.issueSize !== null)
        .sort((a, b) => (b.issueSize ?? 0) - (a.issueSize ?? 0))[0] ?? null,
    [all],
  );

  const nextIssue = useMemo(
    () =>
      all
        .filter((ipo) => ipo.status === "upcoming" && eventDate(ipo))
        .sort((a, b) => eventDate(a).localeCompare(eventDate(b)))[0] ?? null,
    [all],
  );

  const sourceCount = useMemo(() => new Set(all.map((ipo) => ipo.source)).size, [all]);

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">IPO Data & Analysis</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">
          Official-source IPO research across NSE, BSE, NYSE, Nasdaq and LSE. DeepScreen separates
          verified offer terms from estimates, shows live subscription demand where the exchange
          publishes it, and flags missing information instead of filling gaps with synthetic data.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-panel p-4">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Pipeline</p>
            <p className="num mt-2 text-2xl font-semibold">{all.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {counts.open} open · {counts.upcoming} upcoming
            </p>
          </div>
          <div className="rounded-lg border border-border bg-panel p-4">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Demand leader</p>
            <p className="num mt-2 truncate text-lg font-semibold">
              {demandLeader ? demandLeader.symbol : "No live demand"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {demandLeader
                ? `${fmtMultiple(demandLeader.subscriptionMultiple)} · ${demandLeader.name}`
                : "Subscription data appears when officially published."}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-panel p-4">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Largest tracked offer</p>
            <p className="num mt-2 truncate text-lg font-semibold">
              {largestIssue ? largestIssue.symbol : "TBA"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {largestIssue ? `${fmtSize(largestIssue)} · ${largestIssue.name}` : "No reported size."}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-panel p-4">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Next event</p>
            <p className="num mt-2 truncate text-lg font-semibold">
              {nextIssue ? nextIssue.symbol : "TBA"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {nextIssue ? `${eventDate(nextIssue)} · ${timing(nextIssue)}` : "No dated upcoming issue."}
            </p>
          </div>
        </div>

        <div className="num mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          {(["NSE", "BSE", "NYSE", "NASDAQ", "LSE"] as const).map((code) => (
            <span key={code}>
              {code}: {all.filter((ipo) => ipo.exchange === code).length}
            </span>
          ))}
          <span>{sourceCount} source feeds active</span>
          <span>
            Page refresh: {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleString() : "pending"}
          </span>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search company, symbol or market…"
            className="w-full rounded border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <div className="flex flex-wrap gap-2 text-xs">
            {([
              ["latest", "Latest"],
              ["subscription", "Subscription"],
              ["size", "Issue size"],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSort(key)}
                className={cn(
                  "rounded border border-border px-3 py-2 transition-colors",
                  sort === key ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {["ALL", ...EXCHANGES.map((item) => item.code)].map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setExchange(code)}
              className={cn(
                "num rounded border border-border px-3 py-1.5 transition-colors",
                exchange === code ? "bg-primary text-primary-foreground" : "hover:bg-accent",
              )}
            >
              {code}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {(["ALL", "open", "upcoming", "closed", "listed"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              className={cn(
                "rounded border border-border px-3 py-1.5 capitalize transition-colors",
                status === value ? "bg-primary text-primary-foreground" : "hover:bg-accent",
              )}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {SEGMENTS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setSegment(item.key)}
              className={cn(
                "rounded border border-border px-3 py-1.5 transition-colors",
                segment === item.key ? "bg-primary text-primary-foreground" : "hover:bg-accent",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading the live IPO pipeline…</p>
        ) : isError && all.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">
            Exchange IPO feeds are unreachable right now. Retrying automatically.
          </p>
        ) : rows.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">No issues match this filter.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {rows.map((ipo) => {
              const tradable =
                ipo.status === "listed" && Boolean(findStock(ipo.exchange, ipo.symbol));
              const analysis = analyzeIpoResearch(ipo);
              const dates = dateLabel(ipo);

              return (
                <li
                  key={`${ipo.exchange}-${ipo.symbol}-${ipo.name}`}
                  className="rounded-xl border border-border bg-panel/40 p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="num text-base font-semibold text-primary">{ipo.symbol}</span>
                        <span className="num rounded bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {ipo.exchange}
                        </span>
                        {ipo.market ? (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {ipo.market}
                          </span>
                        ) : null}
                        {ipo.segment === "sme" ? (
                          <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                            SME / AIM
                          </span>
                        ) : null}
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide",
                            STATUS_STYLE[ipo.status],
                          )}
                        >
                          {ipo.status}
                        </span>
                      </div>
                      <h2 className="mt-1 text-sm font-semibold sm:text-base">{ipo.name}</h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {ipo.securityType ?? "Equity"} · {ipo.source}
                      </p>
                    </div>

                    <div className="min-w-36 text-right">
                      <p className="num text-sm font-semibold">{fmtBand(ipo)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Issue size {fmtSize(ipo)}
                      </p>
                      <p className="num mt-1 text-[10px] text-muted-foreground">{timing(ipo)}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6">
                    <div className="rounded border border-border/70 bg-card/40 p-3">
                      <p className="text-[10px] uppercase text-muted-foreground">Subscription</p>
                      <p className={cn("num mt-1 font-semibold", DEMAND_STYLE[analysis.demandTone])}>
                        {fmtMultiple(ipo.subscriptionMultiple)}
                      </p>
                    </div>
                    <div className="rounded border border-border/70 bg-card/40 p-3">
                      <p className="text-[10px] uppercase text-muted-foreground">Offered</p>
                      <p className="num mt-1 font-semibold">{fmtCount(ipo.sharesOffered)}</p>
                    </div>
                    <div className="rounded border border-border/70 bg-card/40 p-3">
                      <p className="text-[10px] uppercase text-muted-foreground">Bids</p>
                      <p className="num mt-1 font-semibold">{fmtCount(ipo.bidsReceived)}</p>
                    </div>
                    <div className="rounded border border-border/70 bg-card/40 p-3">
                      <p className="text-[10px] uppercase text-muted-foreground">Lot / minimum</p>
                      <p className="num mt-1 font-semibold">{fmtCount(ipo.lotSize)}</p>
                    </div>
                    <div className="rounded border border-border/70 bg-card/40 p-3">
                      <p className="text-[10px] uppercase text-muted-foreground">Data completeness</p>
                      <p className="num mt-1 font-semibold">{analysis.dataCompleteness}%</p>
                    </div>
                    <div className="rounded border border-border/70 bg-card/40 p-3">
                      <p className="text-[10px] uppercase text-muted-foreground">Confidence</p>
                      <p className="mt-1 font-semibold capitalize">{analysis.confidence}</p>
                    </div>
                  </div>

                  {ipo.primaryOfferSize !== null || ipo.secondaryOfferSize !== null ? (
                    <div className="num mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        Primary:{" "}
                        <span className="text-foreground">
                          {ipo.primaryOfferSize === null
                            ? "TBA"
                            : `${currencySymbol(ipo)}${ipo.primaryOfferSize.toFixed(2)}B`}
                        </span>
                      </span>
                      <span>
                        Secondary:{" "}
                        <span className="text-foreground">
                          {ipo.secondaryOfferSize === null
                            ? "TBA"
                            : `${currencySymbol(ipo)}${ipo.secondaryOfferSize.toFixed(2)}B`}
                        </span>
                      </span>
                    </div>
                  ) : null}

                  {dates.length > 0 ? (
                    <div className="num mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-3 lg:grid-cols-5">
                      {dates.map((item) => (
                        <div key={item.label}>
                          {item.label} <span className="text-foreground">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-4 rounded-lg border border-border bg-card/30 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                          DeepScreen IPO research snapshot
                        </p>
                        <p className={cn("mt-1 text-sm font-semibold", DEMAND_STYLE[analysis.demandTone])}>
                          {analysis.demandLabel}
                          {analysis.demandScore !== null ? ` · Demand score ${analysis.demandScore}/100` : ""}
                        </p>
                      </div>
                      <span className="num text-[10px] text-muted-foreground">
                        {analysis.dataCompleteness}% data coverage · {analysis.confidence} confidence
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{analysis.summary}</p>

                    <div className="mt-3 grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-bull">
                          Evidence / positives
                        </p>
                        {analysis.positives.length ? (
                          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                            {analysis.positives.map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-xs text-muted-foreground">
                            No additional positive signal can be established from the available feed fields.
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-warn">
                          What to watch
                        </p>
                        {analysis.watchItems.length ? (
                          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                            {analysis.watchItems.map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-xs text-muted-foreground">
                            No feed-level warning triggered. Prospectus and valuation review is still required.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                    <a
                      href={ipo.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      Verify at {ipo.source} ↗
                    </a>
                    <span className="text-muted-foreground">{ipo.timelineBasis}</span>
                    <span className="num text-muted-foreground">
                      Source fetched {new Date(ipo.fetchedAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-muted-foreground">{ipo.note}</p>

                  {tradable ? (
                    <Link
                      to="/stock/$exchange/$symbol"
                      params={{ exchange: ipo.exchange, symbol: ipo.symbol }}
                      className="mt-3 inline-block rounded bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                    >
                      Open post-listing DeepScreen analysis
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}

        <section className="mt-8 rounded-lg border border-border bg-panel p-5">
          <h2 className="font-semibold">How DeepScreen reads IPO data</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Subscription demand is useful evidence, but it is not valuation. A heavily subscribed
            issue can still list poorly, and a weak early book can strengthen before the close.
            DeepScreen therefore keeps demand, offer mechanics and timeline quality separate from
            company fundamentals. For an application decision, verify the prospectus/RHP, audited
            financials, use of proceeds, promoter or selling-shareholder details, peer valuation,
            risks and final exchange notices. Grey-market premiums are unofficial and are not mixed
            into the verified IPO score shown here.
          </p>
        </section>
      </div>
      <TopicIndex ids={["ipo"]} title="IPO and new listing topics" />
    </Shell>
  );
}
