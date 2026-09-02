import { useEffect, useState } from "react";

import { SliderRow } from "@/components/ds/DcfCalculator";
import { useAaaYield } from "@/hooks/useLiveQuotes";
import {
  DEFAULT_AAA_YIELD,
  defaultGrahamInputs,
  runGraham,
  type GrahamInputs,
} from "@/lib/deepscreen/graham";
import { formatPrice } from "@/lib/deepscreen/format";
import type { Stock } from "@/lib/deepscreen/types";
import { cn } from "@/lib/utils";

export function GrahamCalculator({ stock }: { stock: Stock }) {
  const { data: liveAaaYield, dataUpdatedAt: aaaUpdatedAt } = useAaaYield();
  const [inputs, setInputs] = useState<GrahamInputs>(() =>
    defaultGrahamInputs(stock, DEFAULT_AAA_YIELD),
  );
  const [yieldTouched, setYieldTouched] = useState(false);

  // Seed the yield slider from the live AAA rate once it loads, but only
  // before the user has touched it themselves — never yank a value out from
  // under someone mid-adjustment.
  useEffect(() => {
    if (liveAaaYield && !yieldTouched) {
      setInputs((prev) => ({ ...prev, aaaYield: liveAaaYield }));
    }
  }, [liveAaaYield, yieldTouched]);

  const result = runGraham(stock, inputs);

  const tone =
    result.verdict === "Undervalued"
      ? "text-bull"
      : result.verdict === "Overvalued"
        ? "text-bear"
        : result.verdict === "Not applicable"
          ? "text-muted-foreground"
          : "text-neutralq";
  const badge =
    result.verdict === "Undervalued"
      ? "border-bull/40 bg-bull/10 text-bull"
      : result.verdict === "Overvalued"
        ? "border-bear/40 bg-bear/10 text-bear"
        : result.verdict === "Not applicable"
          ? "border-border bg-muted text-muted-foreground"
          : "border-neutralq/30 bg-neutralq/10 text-neutralq";

  return (
    <div className="rounded-lg border border-border bg-panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            Graham intrinsic value (revised formula)
          </h2>
          <p className="num mt-1 text-xs text-muted-foreground">
            V = [EPS × (8.5 + 2g) × 4.4] / Y — Benjamin Graham's classic value-investing shortcut
          </p>
        </div>
        <span
          className={cn(
            "num rounded border px-3 py-1 text-xs font-semibold transition-colors duration-300",
            badge,
          )}
        >
          {result.verdict}
        </span>
      </div>

      {!result.applicable ? (
        <p className="mt-4 rounded-lg border border-border p-4 text-sm text-muted-foreground">
          EPS (TTM) is {formatPrice(result.eps, stock.exchange)} — Graham's formula only produces a
          meaningful value for profitable companies, so it doesn't apply here while earnings are
          negative or zero.
        </p>
      ) : (
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <SliderRow
              label="Expected long-term growth (g)"
              value={inputs.growthPct}
              min={0}
              max={20}
              step={0.5}
              suffix="%"
              onChange={(v) =>
                setInputs((prev) => ({ ...prev, growthPct: v[0] ?? prev.growthPct }))
              }
              hint="Graham's own rule of thumb caps this around 15-20% — very high growth assumptions break the formula"
            />
            <SliderRow
              label="AAA corporate bond yield (Y)"
              value={inputs.aaaYield}
              min={2}
              max={10}
              step={0.05}
              suffix="%"
              onChange={(v) => {
                setYieldTouched(true);
                setInputs((prev) => ({ ...prev, aaaYield: v[0] ?? prev.aaaYield }));
              }}
              hint={
                liveAaaYield
                  ? `Live from FRED, updated ${new Date(aaaUpdatedAt).toLocaleDateString()} — drag to override`
                  : "Fetching the live rate — using a default for now"
              }
            />
            <p className="text-[11px] leading-snug text-muted-foreground">
              EPS (TTM) of {formatPrice(result.eps, stock.exchange)} is taken from the stock's live
              fundamentals above. The 8.5 base multiple and the 4.4 constant are fixed parts of
              Graham's original 1962 formula — only g and Y are meant to move with the times.
            </p>
          </div>

          <div className="space-y-3">
            <div className="card-hover rounded-lg border border-border p-4">
              <p className="num text-xs uppercase text-muted-foreground">
                Intrinsic value per share
              </p>
              <p className={cn("num mt-1 text-4xl font-bold transition-colors duration-300", tone)}>
                {formatPrice(result.intrinsicValue, stock.exchange)}
              </p>
              <p className="num mt-1 text-xs text-muted-foreground">
                Market price {formatPrice(stock.price, stock.exchange)} ·{" "}
                <span className={cn("transition-colors duration-300", tone)}>
                  {result.upsidePct >= 0 ? "+" : ""}
                  {result.upsidePct}% {result.upsidePct >= 0 ? "upside" : "downside"}
                </span>
              </p>
            </div>
            <p className="rounded-lg border border-border p-4 text-[11px] leading-relaxed text-muted-foreground">
              Graham designed this as a quick sanity check, not a precise valuation — it's most
              useful for stable, profitable, moderate-growth businesses. For high-growth or cyclical
              names, weigh it alongside the DCF above rather than on its own.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
