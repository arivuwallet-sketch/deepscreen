import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { getMarketIndexTape, type MarketIndexQuote } from "@/lib/market/market.functions";
import { useMotionPreference } from "@/hooks/useMotionPreference";
import { cn } from "@/lib/utils";

import "./market-index-marquee.css";

function formatNumber(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatSigned(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value)}`;
}

function formatPct(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function normalizedState(state: string): string {
  const value = state.trim().toUpperCase();
  if (!value) return "SOURCE";
  if (value === "REGULAR") return "OPEN";
  if (value === "CLOSED") return "CLOSED";
  if (value === "PRE") return "PRE";
  if (value === "POST") return "POST";
  return value.slice(0, 10);
}

function IndexTile({ item }: { item: MarketIndexQuote }) {
  const change = item.change ?? 0;
  const direction = change > 0 ? "up" : change < 0 ? "down" : "flat";

  return (
    <div className="ds-index-tile">
      <div className="ds-index-identity">
        <span className="ds-index-exchange">
          {item.flag} {item.exchange}
        </span>
        <strong>{item.name}</strong>
      </div>
      <div className="ds-index-price">
        <span>{formatNumber(item.price)}</span>
        <span
          className={cn(
            "ds-index-move",
            direction === "up" && "is-up",
            direction === "down" && "is-down",
          )}
        >
          <b aria-hidden="true">{direction === "up" ? "▲" : direction === "down" ? "▼" : "•"}</b>
          {formatSigned(item.change)} <em>{formatPct(item.changePct)}</em>
        </span>
      </div>
      <span className="ds-index-state">{normalizedState(item.marketState)}</span>
    </div>
  );
}

function TapeSet({
  items,
  hidden = false,
}: {
  items: MarketIndexQuote[];
  hidden?: boolean;
}) {
  return (
    <div className="ds-index-set" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <IndexTile key={hidden ? `copy-${item.id}` : item.id} item={item} />
      ))}
    </div>
  );
}

export function MarketIndexMarquee() {
  const fetchTape = useServerFn(getMarketIndexTape);
  const { paused } = useMotionPreference();
  const { data = [], isLoading, dataUpdatedAt } = useQuery({
    queryKey: ["global-market-index-tape"],
    queryFn: () => fetchTape(),
    refetchInterval: 10_000,
    staleTime: 7_500,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const hasData = data.some((item) => item.price !== null);
  const checked = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <section className="ds-index-marquee-shell" aria-label="Major market indices">
      <div className="ds-index-marquee-heading">
        <div>
          <span className="ds-index-live-dot" aria-hidden="true" />
          <strong>GLOBAL INDEX TAPE</strong>
        </div>
        <span>
          {isLoading && !hasData
            ? "LOADING MARKET DATA"
            : checked
              ? `REFRESHED ${checked} · SOURCE MAY BE DELAYED`
              : "SOURCE MAY BE DELAYED"}
        </span>
      </div>

      {data.length ? (
        <div className="ds-index-marquee-window">
          <div className={cn("ds-index-marquee-track", paused && "is-paused")}>
            <TapeSet items={data} />
            <TapeSet items={data} hidden />
          </div>
        </div>
      ) : (
        <div className="ds-index-marquee-empty">
          Live index quotes are temporarily unavailable.
        </div>
      )}
    </section>
  );
}
