import { featuredInvestment } from "@/lib/deepscreen/investment-featured";
import type { EnhancedInvestmentAnalysisData } from "@/lib/deepscreen/investment-official";
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { INVESTMENTS, type InvestmentType } from "@/lib/deepscreen/investments";
import { InvestmentAnalysisAvailable } from "@/components/ds/InvestmentAnalysisAvailable";
export function InvestmentExplorer({
  type,
  initialData,
}: {
  type: InvestmentType;
  initialData?: EnhancedInvestmentAnalysisData | null;
}) {
  const items = useMemo(() => INVESTMENTS.filter((i) => i.type === type), [type]);
  const [query, setQuery] = useState("");
  const [market, setMarket] = useState("all");
  const [item, setItem] = useState(() => featuredInvestment(type));
  const matches = useMemo(
    () =>
      items
        .filter(
          (i) =>
            (market === "all" || i.market === market) &&
            `${i.code} ${i.name}`.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, 12),
    [items, query, market],
  );
  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className="text-2xl font-semibold">
        Explore real {type === "FUND" ? "mutual fund" : type} data
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Choose a listing to load its provider history and specialist analysis. Fund NAVs update
        daily; exchange quotes may be delayed. Selection is for research, not a recommendation.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_160px]">
        <label className="text-xs">
          Search name or code
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search investments"
            className="mt-2 w-full rounded-lg border border-border bg-background p-3 text-sm"
          />
        </label>
        <label className="text-xs">
          Market
          <select
            value={market}
            onChange={(e) => setMarket(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-background p-3 text-sm"
          >
            <option value="all">All markets</option>
            {[...new Set(items.map((i) => i.market))].sort().map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
        {matches.map((i) => (
          <button
            type="button"
            key={`${i.market}:${i.code}`}
            aria-pressed={i === item}
            onClick={() => setItem(i)}
            className={`rounded-lg border p-3 text-left text-sm ${i === item ? "border-primary bg-primary/5" : "border-border"}`}
          >
            <strong>
              {i.code} · {i.market}
            </strong>
            <span className="mt-1 block text-xs text-muted-foreground">{i.name}</span>
          </button>
        ))}
        {!matches.length && <p className="text-sm">No matching listings.</p>}
      </div>
      <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-5">
        <p className="text-xs text-primary">Selected investment · {item.market}</p>
        <h3 className="mt-2 text-xl font-semibold">{item.name}</h3>
        <Link
          to="/investment/$market/$type/$code"
          params={{
            market: item.market.toLowerCase(),
            type: item.type.toLowerCase(),
            code: item.code.toLowerCase(),
          }}
          className="mt-3 inline-block text-sm text-primary hover:underline"
        >
          Open full research for {item.code} →
        </Link>
      </div>
      <InvestmentAnalysisAvailable
        key={`${item.market}:${item.code}`}
        item={item}
        {...(initialData && item === featuredInvestment(type) ? { initialData } : {})}
      />
    </section>
  );
}
