import { useMemo, useState } from "react";
import { Lock, Search, SlidersHorizontal } from "lucide-react";

import { StockTable } from "@/components/ds/StockTable";
import { PaywallGate } from "@/components/ds/PaywallGate";
import { useSubscription } from "@/hooks/useSubscription";
import {
  STOCK_FILTER_PRESETS,
  filterStocksByPreset,
  stockFilterRequiresPro,
  type StockFilterPreset,
} from "@/lib/deepscreen/stock-filter-presets";
import type { Stock } from "@/lib/deepscreen/types";
import { cn } from "@/lib/utils";

const FEATURED_LABELS = new Set([
  "Value stocks",
  "Growth stocks",
  "Income stocks",
  "Quality stocks",
  "Momentum stocks",
  "Blue chip stocks",
  "Large cap stocks",
  "Mid cap stocks",
  "Small cap stocks",
  "Penny stocks",
  "Undervalued stocks",
  "High ROE stocks",
  "High ROCE stocks",
  "Debt free stocks",
  "Low debt stocks",
  "High dividend yield stocks",
  "High growth stocks",
  "Potential multibagger stocks",
  "Quality compounder stocks",
  "High ROE low PE stocks",
  "High ROCE low debt stocks",
  "Top gainers",
  "Top losers",
  "High volume stocks",
  "Defensive stocks",
  "Cyclical stocks",
  "Nifty 50 stocks",
  "S&P 500 stocks",
  "Nasdaq 100 stocks",
  "FTSE 100 stocks",
]);

function sortByMarketCap(stocks: Stock[]): Stock[] {
  return [...stocks].sort(
    (a, b) =>
      b.marketCap - a.marketCap ||
      a.name.localeCompare(b.name) ||
      a.symbol.localeCompare(b.symbol),
  );
}

export function StockCategoryScreener({
  stocks,
  title = "Stock categories & preset filters",
}: {
  stocks: Stock[];
  title?: string;
}) {
  const { isPro } = useSubscription();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCatalog, setShowCatalog] = useState(false);
  const [limit, setLimit] = useState(100);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const preset of STOCK_FILTER_PRESETS) {
      if (!preset.test || (!isPro && stockFilterRequiresPro(preset))) continue;
      let count = 0;
      for (const stock of stocks) if (preset.test(stock)) count += 1;
      map.set(preset.id, count);
    }
    return map;
  }, [stocks, isPro]);

  const selected = useMemo(
    () => STOCK_FILTER_PRESETS.find((preset) => preset.id === selectedId),
    [selectedId],
  );

  const selectedRequiresPro = selected ? stockFilterRequiresPro(selected) : false;
  const totalMatches = selected && (!selectedRequiresPro || isPro) ? counts.get(selected.id) ?? 0 : 0;
  const matches = useMemo(() => {
    if (!selected || (stockFilterRequiresPro(selected) && !isPro)) return [];
    return sortByMarketCap(filterStocksByPreset(stocks, selected)).slice(0, limit);
  }, [stocks, selected, limit, isPro]);

  const visiblePresets = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? STOCK_FILTER_PRESETS.filter(
          (preset) =>
            preset.label.toLowerCase().includes(q) ||
            preset.group.toLowerCase().includes(q),
        )
      : showCatalog
        ? STOCK_FILTER_PRESETS
        : STOCK_FILTER_PRESETS.filter((preset) => FEATURED_LABELS.has(preset.label));

    return [...base].sort((a, b) => a.label.localeCompare(b.label));
  }, [query, showCatalog]);

  const groups = useMemo(() => {
    const map = new Map<string, StockFilterPreset[]>();
    for (const preset of visiblePresets) {
      const list = map.get(preset.group);
      if (list) list.push(preset);
      else map.set(preset.group, [preset]);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [visiblePresets]);

  const choose = (preset: StockFilterPreset) => {
    setSelectedId((current) => (current === preset.id ? null : preset.id));
    setLimit(100);
  };

  return (
    <section className="rounded-xl border border-border bg-panel p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-primary" />
            <h2 className="text-base font-semibold">{title}</h2>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Search the live category catalog and open any preset. A stock can belong to multiple
            categories at the same time. Every published category uses an existing DeepScreen
            directory field and a working classification rule.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {STOCK_FILTER_PRESETS.length.toLocaleString()} live, data-backed category filters
          </p>
        </div>

        <div className="w-full lg:max-w-sm">
          <label className="relative block">
            <span className="sr-only">Search stock filters</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search value, ROCE, dividend, Nifty..."
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none transition focus:border-primary"
            />
          </label>
          <button
            type="button"
            onClick={() => setShowCatalog((value) => !value)}
            className="mt-2 text-xs font-medium text-primary hover:underline"
          >
            {showCatalog
              ? "Show featured filters"
              : `Browse all ${STOCK_FILTER_PRESETS.length} filters`}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "mt-5 space-y-5",
          (showCatalog || query) && "max-h-[34rem] overflow-y-auto pr-1",
        )}
      >
        {groups.map(([group, presets]) => (
          <div key={group}>
            <p className="num mb-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {group}
            </p>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => {
                const active = selectedId === preset.id;
                const requiresPro = stockFilterRequiresPro(preset);
                const count = counts.get(preset.id);
                return (
                  <button
                    type="button"
                    key={preset.id}
                    onClick={() => choose(preset)}
                    title={preset.description}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-left text-xs transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/60 hover:text-foreground",
                    )}
                  >
                    {preset.label}
                    {!isPro && requiresPro ? (
                      <span className={cn("ml-1.5 inline-flex items-center gap-1", active ? "text-primary-foreground/80" : "text-primary")}>
                        <Lock className="size-3" /> Pro
                      </span>
                    ) : typeof count === "number" ? (
                      <span
                        className={cn(
                          "ml-1.5",
                          active ? "text-primary-foreground/75" : "text-muted-foreground/70",
                        )}
                      >
                        {count.toLocaleString()}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="mt-6 border-t border-border pt-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">{selected.label}</h3>
              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                {selected.description}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {!isPro && selectedRequiresPro
                  ? "This preset uses DeepScreen Pro score/PEG intelligence. Its definition stays public; the matching-company set requires Pro."
                  : `${totalMatches.toLocaleString()} of ${stocks.length.toLocaleString()} companies match this rule. Directory ratios and classifications can be modeled or inferred; verify live/provider-backed values on the company page before making decisions.`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="rounded border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear category
            </button>
          </div>

          {!isPro && selectedRequiresPro ? (
            <PaywallGate
              strict
              feature={`${selected.label} matching-company screen`}
              minHeight="min-h-[280px]"
            >
              <StockTable stocks={[]} />
            </PaywallGate>
          ) : totalMatches > 0 ? (
            <>
              <StockTable stocks={matches} />
              {totalMatches > limit && (
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setLimit((value) => value + 100)}
                    className="rounded border border-border px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground hover:border-primary/60 hover:text-foreground"
                  >
                    Load 100 more
                  </button>
                  <span className="num text-xs text-muted-foreground">
                    showing {Math.min(limit, totalMatches).toLocaleString()} of{" "}
                    {totalMatches.toLocaleString()}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
              No companies in this universe currently match the selected rule.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
