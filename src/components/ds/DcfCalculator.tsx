import { useMemo, useState } from "react";

import { Slider } from "@/components/ui/slider";
import { defaultInputs, runDcf, type DcfInputs } from "@/lib/deepscreen/dcf";
import { formatCap, formatPrice } from "@/lib/deepscreen/format";
import type { Stock } from "@/lib/deepscreen/types";
import { cn } from "@/lib/utils";

export function DcfCalculator({ stock }: { stock: Stock }) {
  const [inputs, setInputs] = useState<DcfInputs>(() => defaultInputs(stock));
  const result = useMemo(() => runDcf(stock, inputs), [stock, inputs]);

  const set = (key: keyof DcfInputs) => (v: number[]) =>
    setInputs((prev) => ({ ...prev, [key]: v[0] ?? prev[key] }));

  const tone =
    result.verdict === "Undervalued" ? "text-bull" : result.verdict === "Overvalued" ? "text-bear" : "text-neutralq";
  const badge =
    result.verdict === "Undervalued"
      ? "border-bull/40 bg-bull/10 text-bull"
      : result.verdict === "Overvalued"
        ? "border-bear/40 bg-bear/10 text-bear"
        : "border-neutralq/30 bg-neutralq/10 text-neutralq";

  return (
    <div className="rounded-lg border border-border bg-panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">Automated DCF valuation</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Two-stage discounted cash flow — growth fades to the terminal rate over ten years.
          </p>
        </div>
        <span className={cn("num rounded border px-3 py-1 text-xs font-semibold", badge)}>{result.verdict}</span>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <SliderRow
            label="Projected FCF growth"
            value={inputs.growthPct}
            min={5}
            max={25}
            step={0.5}
            suffix="%"
            onChange={set("growthPct")}
            hint="Years 1-10, fading toward the terminal rate"
          />
          <SliderRow
            label="Discount rate (WACC)"
            value={inputs.discountPct}
            min={8}
            max={15}
            step={0.25}
            suffix="%"
            onChange={set("discountPct")}
            hint="Your required return — higher for leveraged or small caps"
          />
          <SliderRow
            label="Terminal growth"
            value={inputs.terminalPct}
            min={2}
            max={4}
            step={0.1}
            suffix="%"
            onChange={set("terminalPct")}
            hint="Perpetual growth after year 10; keep it near long-run GDP"
          />
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-border p-4">
            <p className="num text-xs uppercase text-muted-foreground">Intrinsic value per share</p>
            <p className={cn("num mt-1 text-4xl font-bold", tone)}>
              {formatPrice(result.intrinsicValue, stock.exchange)}
            </p>
            <p className="num mt-1 text-xs text-muted-foreground">
              Market price {formatPrice(stock.price, stock.exchange)} ·{" "}
              <span className={tone}>
                {result.upsidePct >= 0 ? "+" : ""}
                {result.upsidePct}% {result.upsidePct >= 0 ? "upside" : "downside"}
              </span>
            </p>
          </div>
          <dl className="num grid grid-cols-2 gap-y-2 rounded-lg border border-border p-4 text-sm">
            <dt className="text-muted-foreground">FCF (TTM)</dt>
            <dd className="text-right">{formatCap(result.fcfTtm, stock.exchange)}</dd>
            <dt className="text-muted-foreground">FCF per share</dt>
            <dd className="text-right">{formatPrice(result.fcfPerShare, stock.exchange)}</dd>
            <dt className="text-muted-foreground">Shares outstanding</dt>
            <dd className="text-right">{result.sharesOut.toFixed(2)}B</dd>
            <dt className="text-muted-foreground">PV of years 1-10</dt>
            <dd className="text-right">{formatCap(result.pvExplicit, stock.exchange)}</dd>
            <dt className="text-muted-foreground">PV of terminal value</dt>
            <dd className="text-right">{formatCap(result.pvTerminal, stock.exchange)}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}

export function SliderRow({
  label,
  value,
  min,
  max,
  step,
  suffix,
  hint,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  hint: string;
  onChange: (v: number[]) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="num text-sm font-bold">
          {value}
          {suffix}
        </span>
      </div>
      <Slider className="mt-2" value={[value]} min={min} max={max} step={step} onValueChange={onChange} />
      <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}
