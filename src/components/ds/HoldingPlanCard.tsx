import { alertClass, holdingPlan } from "@/lib/deepscreen/horizon";
import { formatPrice } from "@/lib/deepscreen/format";
import type { Stock } from "@/lib/deepscreen/types";
import { cn } from "@/lib/utils";
import { WatchlistButton } from "./WatchlistButton";

export function HoldingPlanCard({ stock }: { stock: Stock }) {
  const p = holdingPlan(stock);

  return (
    <section className="mt-6 rounded-lg border border-border bg-panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide">Holding period &amp; sell alert</h2>
        <div className="flex items-center gap-2">
          <span className={cn("num rounded border px-3 py-1 text-xs font-semibold", alertClass(p.alert))}>
            {p.alertLabel}
          </span>
          <WatchlistButton stock={stock} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Suggested holding period" value={p.horizonLabel} sub={p.style} />
        <Stat
          label="Target price"
          value={formatPrice(p.targetPrice, stock.exchange)}
          sub={`Trim above ${formatPrice(p.trimAbove, stock.exchange)}`}
        />
        <Stat
          label="Stop loss"
          value={formatPrice(p.stopLoss, stock.exchange)}
          sub="Exit level if the thesis breaks"
        />
        <Stat
          label="News bias (live)"
          value={`${p.newsBias >= 0 ? "+" : ""}${p.newsBias.toFixed(2)}`}
          sub={`Next review ${p.reviewOn}`}
        />
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.rationale}</p>

      <div className="mt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-bear">Sell triggers to watch</h3>
        <ul className="num mt-2 grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
          {p.sellTriggers.map((t) => (
            <li key={t}>− {t}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="num text-xs uppercase text-muted-foreground">{label}</p>
      <p className="num mt-1 text-xl font-bold">{value}</p>
      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{sub}</p>
    </div>
  );
}
