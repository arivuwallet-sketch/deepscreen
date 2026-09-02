import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RefreshCw } from "lucide-react";

import { getEconomicEvents, type LiveEvent } from "@/lib/market/market.functions";
import { cn } from "@/lib/utils";

const impactDot: Record<string, string> = {
  high: "bg-bear",
  medium: "bg-warn",
  low: "bg-muted-foreground",
};

/**
 * LOCAL calendar day, not UTC. The tab labels ("Today"/"Tomorrow") and each
 * event's displayed time are both local, so the day bucket they're filtered
 * into has to be local too — bucketing by UTC date (as toISOString() would)
 * means for roughly a third of the day, viewers east of UTC (e.g. India,
 * UTC+5:30) see "Today" silently querying what UTC still thinks is
 * yesterday, and the tab looks empty even though events exist.
 */
function localDayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function EconomicCalendar() {
  const fetchEvents = useServerFn(getEconomicEvents);
  const [offset, setOffset] = useState(0);
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useQuery({
    queryKey: ["economic-events"],
    queryFn: () => fetchEvents(),
    // Cheap to poll now — getEconomicEvents caches server-side, so this
    // mostly reads from memory rather than re-hitting the upstream feed.
    refetchInterval: 90_000,
    staleTime: 30_000,
  });

  const events = useMemo(() => {
    const target = new Date();
    target.setDate(target.getDate() + offset);
    const key = localDayKey(target);
    return (data ?? [])
      .filter((e: LiveEvent) => localDayKey(new Date(e.dateIso)) === key)
      .sort((a, b) => a.dateIso.localeCompare(b.dateIso));
  }, [data, offset]);

  const label = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" });
  }, [offset]);

  return (
    <section className="rounded-lg border border-border bg-panel">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide">Economic Calendar</h2>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((d) => (
            <button
              key={d}
              onClick={() => setOffset(d)}
              className={cn(
                "num rounded px-2 py-1 text-xs transition-colors",
                d === offset
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {d === 0 ? "Today" : d === 1 ? "Tomorrow" : "Day 3"}
            </button>
          ))}
          <button
            onClick={() => void refetch()}
            title="Refresh"
            className="ml-1 rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
          </button>
        </div>
      </header>
      <p className="num flex items-center justify-between border-b border-border px-4 py-2 text-xs text-muted-foreground">
        <span>{label} · local time</span>
        <span className="flex items-center gap-1.5">
          {!isError && <span className="size-1.5 animate-pulse rounded-full bg-bull" />}
          {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : "LIVE"}
        </span>
      </p>
      {isLoading ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">Loading live calendar…</p>
      ) : isError ? (
        <div className="px-4 py-6 text-sm text-muted-foreground">
          <p>Couldn't load the economic calendar right now — the upstream feed didn't respond.</p>
          <button
            onClick={() => void refetch()}
            className="num mt-2 rounded border border-border px-2.5 py-1 text-xs font-medium hover:bg-accent"
          >
            Try again
          </button>
        </div>
      ) : events.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">
          No scheduled releases for this day.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="num border-b border-border text-left text-[11px] uppercase text-muted-foreground">
                <th className="px-4 py-2 font-medium">Time</th>
                <th className="px-2 py-2 font-medium">Cur</th>
                <th className="px-2 py-2 font-medium">Impact</th>
                <th className="px-2 py-2 font-medium">Event</th>
                <th className="px-2 py-2 text-right font-medium">Actual</th>
                <th className="px-2 py-2 text-right font-medium">Forecast</th>
                <th className="px-4 py-2 text-right font-medium">Previous</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {events.map((e, i) => (
                <tr
                  key={e.id}
                  className="animate-fade-in hover:bg-accent/40"
                  style={{ animationDelay: `${Math.min(i, 15) * 25}ms` }}
                >
                  <td className="num px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                    {new Date(e.dateIso).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="num px-2 py-2.5 whitespace-nowrap">
                    {e.flag} {e.currency}
                  </td>
                  <td className="px-2 py-2.5">
                    <span
                      className={cn(
                        "inline-block size-2 rounded-full",
                        e.impact === "high" && "animate-pulse",
                        impactDot[e.impact],
                      )}
                    />
                  </td>
                  <td className="px-2 py-2.5">{e.title}</td>
                  <td className="num px-2 py-2.5 text-right font-semibold">{e.actual}</td>
                  <td className="num px-2 py-2.5 text-right text-muted-foreground">{e.forecast}</td>
                  <td className="num px-4 py-2.5 text-right text-muted-foreground">{e.previous}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
