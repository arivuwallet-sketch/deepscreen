import { useState } from "react";

import { dayLabel, economicCalendar } from "@/lib/deepscreen/calendar";
import { cn } from "@/lib/utils";

const impactDot: Record<string, string> = {
  high: "bg-bear",
  medium: "bg-warn",
  low: "bg-muted-foreground",
};

export function EconomicCalendar() {
  const [day, setDay] = useState(0);
  const events = economicCalendar().filter((e) => e.dayOffset === day);

  return (
    <section className="rounded-lg border border-border bg-panel">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide">Economic Calendar</h2>
        <div className="flex gap-1">
          {[0, 1, 2].map((d) => (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={cn(
                "num rounded px-2 py-1 text-xs transition-colors",
                d === day
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {d === 0 ? "Today" : d === 1 ? "Tomorrow" : "Day 3"}
            </button>
          ))}
        </div>
      </header>
      <p className="num border-b border-border px-4 py-2 text-xs text-muted-foreground">
        {dayLabel(day)} · times in GMT
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
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
            {events.map((e) => (
              <tr key={e.id} className="hover:bg-accent/40">
                <td className="num px-4 py-2.5 text-muted-foreground">{e.time}</td>
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
    </section>
  );
}
