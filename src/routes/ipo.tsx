import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { Shell } from "@/components/ds/Shell";
import { TopicIndex } from "@/components/ds/TopicIndex";
import { ipoKeywords, metaKeywords, screenerKeywords } from "@/lib/seo/keywords";
import { EXCHANGES } from "@/lib/deepscreen/exchanges";
import { formatPrice } from "@/lib/deepscreen/format";
import { IPOS, daysAway, ipoStatus, type IpoStatus } from "@/lib/deepscreen/ipos";
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
      { title: "IPO Calendar — NSE, BSE, NYSE, NASDAQ, LSE — DeepScreen" },
      {
        name: "description",
        content:
          "Complete live IPO pipeline: every mainboard and SME issue on NSE/BSE plus the full US calendar (upcoming, priced, filed) with bands, lot sizes, issue sizes and key dates.",
      },
      { property: "og:title", content: "Live IPO Calendar — DeepScreen" },
      {
        property: "og:description",
        content:
          "Every open, upcoming, closed and listed IPO across NSE, BSE, NYSE, NASDAQ and LSE, refreshed live.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://deepscreen.online/ipo" },
      { name: "keywords", content: metaKeywords(ipoKeywords, screenerKeywords) },
    ],
    links: [{ rel: "canonical", href: "https://deepscreen.online/ipo" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
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

/** LSE has no public new-issues feed, so those stay curated. */
const CURATED_LSE: LiveIpo[] = IPOS.filter((i) => i.exchange === "LSE").map((i) => ({
  symbol: i.symbol,
  name: i.name,
  exchange: i.exchange,
  segment: "mainboard",
  bandLow: i.bandLow,
  bandHigh: i.bandHigh,
  sharesOffered: null,
  issueSize: i.issueSize,
  openDate: i.openDate,
  closeDate: i.closeDate,
  listingDate: i.listingDate,
  status: ipoStatus(i),
  note: `${i.note} Registrar: ${i.registrar}.`,
}));

const SEGMENTS = [
  { key: "ALL", label: "All segments" },
  { key: "mainboard", label: "Mainboard" },
  { key: "sme", label: "SME" },
  { key: "us", label: "US calendar" },
] as const;

function fmtBand(ipo: LiveIpo): string {
  if (ipo.bandLow == null && ipo.bandHigh == null) return "band TBA";
  const lo = formatPrice(ipo.bandLow ?? ipo.bandHigh ?? 0, ipo.exchange);
  const hi = formatPrice(ipo.bandHigh ?? ipo.bandLow ?? 0, ipo.exchange);
  return lo === hi ? lo : `${lo} – ${hi}`;
}

function fmtSize(ipo: LiveIpo): string {
  if (ipo.issueSize != null && ipo.issueSize > 0) {
    return `issue ${ipo.issueSize < 1 ? ipo.issueSize.toFixed(2) : ipo.issueSize.toFixed(1)}B`;
  }
  if (ipo.sharesOffered) return `${ipo.sharesOffered.toLocaleString()} shares`;
  return "size TBA";
}

function timing(ipo: LiveIpo): string {
  if (ipo.status === "upcoming" && ipo.openDate) return `in ${daysAway(ipo.openDate)}d`;
  if (ipo.status === "open" && ipo.closeDate) return `closes in ${daysAway(ipo.closeDate)}d`;
  if (ipo.status === "closed" && ipo.listingDate) return `lists in ${daysAway(ipo.listingDate)}d`;
  if (ipo.status === "listed" && ipo.listingDate)
    return `listed ${Math.abs(daysAway(ipo.listingDate))}d ago`;
  return "dates TBA";
}

function IpoPage() {
  const { initialIpos } = Route.useLoaderData();
  const fetchIpos = useServerFn(getLiveIpos);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["live-ipos"],
    queryFn: () => fetchIpos(),
    ...(initialIpos.length > 0 ? { initialData: initialIpos } : {}),
    refetchInterval: 10 * 60_000,
    staleTime: 5 * 60_000,
  });

  const [exchange, setExchange] = useState<string>("ALL");
  const [status, setStatus] = useState<IpoStatus | "ALL">("ALL");
  const [segment, setSegment] = useState<string>("ALL");
  const [query, setQuery] = useState("");

  const all = useMemo<LiveIpo[]>(() => {
    const live = (data as LiveIpo[] | undefined) ?? [];
    return [...live, ...CURATED_LSE].sort((a, b) =>
      (b.openDate ?? "").localeCompare(a.openDate ?? ""),
    );
  }, [data]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(
      (i) =>
        (exchange === "ALL" || i.exchange === exchange) &&
        (status === "ALL" || i.status === status) &&
        (segment === "ALL" || i.segment === segment) &&
        (q === "" || i.name.toLowerCase().includes(q) || i.symbol.toLowerCase().includes(q)),
    );
  }, [all, exchange, status, segment, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { open: 0, upcoming: 0, closed: 0, listed: 0 };
    for (const i of all) c[i.status] = (c[i.status] ?? 0) + 1;
    return c;
  }, [all]);

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">IPO Calendar</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Every live primary-market issue: NSE and BSE mainboard plus SME, and the complete US
          calendar (upcoming, priced and filed) for NYSE and NASDAQ. Listed issues are matched
          against the screener universe so you can jump straight to the analysis page.
        </p>

        <div className="num mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span>{all.length} issues tracked</span>
          <span className="text-bull">{counts["open"]} open</span>
          <span className="text-primary">{counts["upcoming"]} upcoming</span>
          <span>{counts["closed"]} closed</span>
          <span>{counts["listed"]} listed</span>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search issue or symbol…"
          className="mt-4 w-full rounded border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary sm:max-w-sm"
        />

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {["ALL", ...EXCHANGES.map((e) => e.code)].map((code) => (
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
          {(["ALL", "open", "upcoming", "closed", "listed"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cn(
                "rounded border border-border px-3 py-1.5 capitalize transition-colors",
                status === s ? "bg-primary text-primary-foreground" : "hover:bg-accent",
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {SEGMENTS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSegment(s.key)}
              className={cn(
                "rounded border border-border px-3 py-1.5 transition-colors",
                segment === s.key ? "bg-primary text-primary-foreground" : "hover:bg-accent",
              )}
            >
              {s.label}
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
          <ul className="mt-6 space-y-3">
            {rows.map((ipo) => {
              const tradable = ipo.status === "listed" && Boolean(findStock(ipo.exchange, ipo.symbol));
              return (
                <li
                  key={`${ipo.exchange}-${ipo.symbol}-${ipo.name}`}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="min-w-40 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">{ipo.symbol}</span>
                        <span className="num rounded bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {ipo.exchange}
                        </span>
                        {ipo.segment === "sme" ? (
                          <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                            SME
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
                      <div className="truncate text-xs text-muted-foreground">{ipo.name}</div>
                    </div>
                    <div className="num text-right text-xs">
                      <div className="font-semibold">{fmtBand(ipo)}</div>
                      <div className="text-muted-foreground">{fmtSize(ipo)}</div>
                    </div>
                  </div>

                  <div className="num mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
                    <div>
                      Opens <span className="text-foreground">{ipo.openDate ?? "TBA"}</span>
                    </div>
                    <div>
                      Closes <span className="text-foreground">{ipo.closeDate ?? "TBA"}</span>
                    </div>
                    <div>
                      Lists <span className="text-foreground">{ipo.listingDate ?? "TBA"}</span>
                    </div>
                    <div>{timing(ipo)}</div>
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">{ipo.note}</p>

                  {tradable ? (
                    <Link
                      to="/stock/$exchange/$symbol"
                      params={{ exchange: ipo.exchange, symbol: ipo.symbol }}
                      className="mt-3 inline-block rounded bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                    >
                      Open DeepScreen analysis
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <TopicIndex ids={["ipo"]} title={"IPO and new listing topics"} />
    </Shell>
  );
}
