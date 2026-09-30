import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { STOCK_FILTER_PRESETS } from "@/lib/deepscreen/stock-filter-presets";
import { cn } from "@/lib/utils";

export function StockFilterDirectory() {
  const [query, setQuery] = useState("");
  const [showNeedsData, setShowNeedsData] = useState(true);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = STOCK_FILTER_PRESETS.filter((preset) => {
      if (!showNeedsData && preset.status === "needs-data") return false;
      if (!q) return true;
      return (
        preset.label.toLowerCase().includes(q) ||
        preset.group.toLowerCase().includes(q) ||
        preset.description.toLowerCase().includes(q) ||
        preset.missingData?.toLowerCase().includes(q)
      );
    });

    const grouped = new Map<string, typeof filtered>();
    for (const preset of filtered) {
      const list = grouped.get(preset.group);
      if (list) list.push(preset);
      else grouped.set(preset.group, [preset]);
    }

    return [...grouped.entries()]
      .map(([group, presets]) => [
        group,
        [...presets].sort((a, b) => a.label.localeCompare(b.label)),
      ] as const)
      .sort(([a], [b]) => a.localeCompare(b));
  }, [query, showNeedsData]);

  const available = STOCK_FILTER_PRESETS.filter((preset) => preset.status === "available").length;
  const needsData = STOCK_FILTER_PRESETS.length - available;

  return (
    <section>
      <div className="rounded-xl border border-border bg-panel p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="num text-xs uppercase tracking-[0.18em] text-primary">Filter directory</p>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Every category below has its own permanent URL. Data-backed filters open a live stock
              list; categories that require unavailable historical, ownership, technical or event
              data remain accessible as transparent reference pages instead of being populated with
              guessed companies.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {STOCK_FILTER_PRESETS.length.toLocaleString()} category URLs · {available.toLocaleString()} data-backed · {needsData.toLocaleString()} awaiting additional verified data
            </p>
          </div>

          <div className="w-full lg:max-w-md">
            <label className="relative block">
              <span className="sr-only">Search stock filter pages</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search value, growth, ROCE, dividend, Nifty..."
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-primary"
              />
            </label>
            <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={showNeedsData}
                onChange={(event) => setShowNeedsData(event.target.checked)}
              />
              Show categories awaiting additional data
            </label>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {groups.map(([group, presets]) => (
          <section key={group} aria-labelledby={`filter-group-${group.replace(/[^a-z0-9]+/gi, "-")}`}>
            <div className="mb-3 flex items-end justify-between gap-3 border-b border-border pb-2">
              <h2
                id={`filter-group-${group.replace(/[^a-z0-9]+/gi, "-")}`}
                className="text-lg font-semibold"
              >
                {group}
              </h2>
              <span className="num text-xs text-muted-foreground">{presets.length} filters</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {presets.map((preset) => (
                <Link
                  key={preset.id}
                  to="/stock-filters/$slug"
                  params={{ slug: preset.id }}
                  className={cn(
                    "group rounded-lg border p-3 transition-colors",
                    preset.status === "available"
                      ? "border-border bg-card/40 hover:border-primary/60 hover:bg-card"
                      : "border-border/70 bg-background/30 hover:border-border",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium leading-snug group-hover:text-primary">
                      {preset.label}
                    </h3>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-wide",
                        preset.status === "available"
                          ? "border-primary/30 text-primary"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {preset.status === "available" ? "live" : "needs data"}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {preset.status === "available" ? preset.description : preset.missingData}
                  </p>
                  <p className="mt-3 text-[11px] text-primary">/stock-filters/{preset.id}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {groups.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No stock-filter pages match this search.
          </div>
        )}
      </div>
    </section>
  );
}
