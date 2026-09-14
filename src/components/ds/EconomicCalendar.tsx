import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { getEconomicEvents, type LiveEvent } from "@/lib/market/market.functions";
import { cn } from "@/lib/utils";

const impactDot: Record<string, string> = {
  high: "bg-bear",
  medium: "bg-warn",
  low: "bg-muted-foreground",
};

function dayKeyOf(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function EconomicCalendar() {
  const fetchEvents = useServerFn(getEconomicEvents);
  const [offset, setOffset] = useState(0);
  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ["economic-events"],
    queryFn: () => fetchEvents(),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const events = useMemo(() => {
    const target = new Date();
    target.setUTCDate(target.getUTCDate() + offset);
    const key = dayKeyOf(target);
    return (data ?? [])
      .filter((e: LiveEvent) => e.dayKey === key)
      .sort((a, b) => a.dateIso.localeCompare(b.dateIso));
  }, [data, offset]);

  const label = useMemo(() => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + offset);
    return d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" });
  }, [offset]);

  return (
    <section className="rounded-lg border border-border bg-panel">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide">Economic Calendar</h2>
        <div className="flex gap-1">
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
        </div>
      </header>
      <p className="num flex items-center justify-between border-b border-border px-4 py-2 text-xs text-muted-foreground">
        <span>{label} · local time</span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 animate-pulse rounded-full bg-bull" />
          {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : "LIVE"}
        </span>
      </p>
      {isLoading ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">Loading live calendar…</p>
      ) : events.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">No scheduled releases for this day.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="num border-b border-border text-left text-[11px] uppercase text-muted-foreground">
                <th scope="col" className="px-4 py-2 font-medium">Time</th>
                <th scope="col" className="px-2 py-2 font-medium">Cur</th>
                <th scope="col" className="px-2 py-2 font-medium">Impact</th>
                <th scope="col" className="px-2 py-2 font-medium">Event</th>
                <th scope="col" className="px-2 py-2 text-right font-medium">Actual</th>
                <th scope="col" className="px-2 py-2 text-right font-medium">Forecast</th>
                <th scope="col" className="px-4 py-2 text-right font-medium">Previous</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-accent/40">
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
                    <span className={cn("inline-block size-2 rounded-full", impactDot[e.impact])} />
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
