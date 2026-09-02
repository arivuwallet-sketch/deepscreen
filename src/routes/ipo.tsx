import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { Shell } from "@/components/ds/Shell";
import { EXCHANGES } from "@/lib/deepscreen/exchanges";
import { formatPrice } from "@/lib/deepscreen/format";
import { IPOS, daysAway, ipoStatus, isTradable, type IpoStatus } from "@/lib/deepscreen/ipos";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ipo")({
  head: () => ({
    meta: [
      { title: "Upcoming IPOs — NSE, BSE, NYSE, NASDAQ, LSE — DeepScreen" },
      {
        name: "description",
        content:
          "Live IPO pipeline across five exchanges: price band, lot size, issue size, open, close and listing dates, with listed issues folding straight into the screener.",
      },
      { property: "og:title", content: "Upcoming IPOs — DeepScreen" },
      {
        property: "og:description",
        content: "IPO board for NSE, BSE, NYSE, NASDAQ and LSE with bands, lots and key dates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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

function IpoPage() {
  const [exchange, setExchange] = useState<string>("ALL");
  const [status, setStatus] = useState<IpoStatus | "ALL">("ALL");

  const rows = IPOS.filter(
    (i) =>
      (exchange === "ALL" || i.exchange === exchange) &&
      (status === "ALL" || ipoStatus(i) === status),
  );

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Upcoming IPOs</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Primary-market pipeline across NSE, BSE, NYSE, NASDAQ and LSE. Once an issue lists it is
          matched against the screener universe so you can jump straight to its analysis page.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
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

        {rows.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">No issues match this filter.</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {rows.map((ipo) => {
              const st = ipoStatus(ipo);
              const tradable = isTradable(ipo);
              return (
                <li key={`${ipo.exchange}-${ipo.symbol}`} className="rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="min-w-40 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{ipo.symbol}</span>
                        <span className="num rounded bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {ipo.exchange}
                        </span>
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide",
                            STATUS_STYLE[st],
                          )}
                        >
                          {st}
                        </span>
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {ipo.name} · {ipo.sector}
                      </div>
                    </div>
                    <div className="num text-right text-xs">
                      <div className="font-semibold">
                        {formatPrice(ipo.bandLow, ipo.exchange)} –{" "}
                        {formatPrice(ipo.bandHigh, ipo.exchange)}
                      </div>
                      <div className="text-muted-foreground">
                        lot {ipo.lotSize} · issue {ipo.issueSize}B
                      </div>
                    </div>
                  </div>

                  <div className="num mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
                    <div>
                      Opens <span className="text-foreground">{ipo.openDate}</span>
                    </div>
                    <div>
                      Closes <span className="text-foreground">{ipo.closeDate}</span>
                    </div>
                    <div>
                      Lists <span className="text-foreground">{ipo.listingDate}</span>
                    </div>
                    <div>
                      {st === "upcoming"
                        ? `in ${daysAway(ipo.openDate)}d`
                        : st === "open"
                          ? `closes in ${daysAway(ipo.closeDate)}d`
                          : st === "closed"
                            ? `lists in ${daysAway(ipo.listingDate)}d`
                            : `listed ${Math.abs(daysAway(ipo.listingDate))}d ago`}
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {ipo.note} Registrar: {ipo.registrar}.
                  </p>

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
    </Shell>
  );
}
