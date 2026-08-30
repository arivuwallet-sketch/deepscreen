import { Check, X } from "lucide-react";

import type { Confirmation, SmcResult } from "@/lib/crypto/smc";
import { formatUsd } from "@/lib/crypto/binance";
import { cn } from "@/lib/utils";

function ConfirmationRow({ c }: { c: Confirmation }) {
  return (
    <li className="flex items-start gap-2 text-xs">
      {c.ok ? (
        <Check className="mt-0.5 size-3.5 shrink-0 text-bull" />
      ) : (
        <X className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      )}
      <div>
        <span className={cn("font-medium", c.ok ? "text-foreground" : "text-muted-foreground")}>
          {c.label}
        </span>
        <span className="ml-1.5 text-muted-foreground">{c.detail}</span>
      </div>
    </li>
  );
}

export function SmcSignalCard({ smc, symbol }: { smc: SmcResult; symbol: string }) {
  const signalTone =
    smc.signal === "bullish"
      ? "border-bull/40 bg-bull/5"
      : smc.signal === "bearish"
        ? "border-bear/40 bg-bear/5"
        : "border-border bg-panel";
  const signalText =
    smc.signal === "bullish"
      ? "text-bull"
      : smc.signal === "bearish"
        ? "text-bear"
        : "text-muted-foreground";

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className={cn("rounded-lg border p-5 lg:col-span-2", signalTone)}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide">{symbol} SMC signal</h3>
          <span
            className={cn(
              "num rounded border px-3 py-1 text-sm font-semibold",
              signalTone,
              signalText,
            )}
          >
            {smc.signalLabel}
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{smc.explanation}</p>

        {smc.signal !== "none" && (
          <dl className="num mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-[11px] uppercase text-muted-foreground">Entry</dt>
              <dd className="font-semibold">${formatUsd(smc.entry)}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase text-muted-foreground">Stop</dt>
              <dd className="font-semibold text-bear">${formatUsd(smc.stop)}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase text-muted-foreground">Target 1 / 2</dt>
              <dd className="font-semibold text-bull">
                ${formatUsd(smc.target1)} / ${formatUsd(smc.target2)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase text-muted-foreground">Risk : Reward</dt>
              <dd className="font-semibold">1 : {smc.riskReward}</dd>
            </div>
          </dl>
        )}

        <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
          <span>
            Structure: <span className="font-medium text-foreground">{smc.structure}</span>
          </span>
          <span>
            EMA trend: <span className="font-medium text-foreground">{smc.emaTrend}</span>
          </span>
          <span>
            Session: <span className="font-medium text-foreground">{smc.session}</span>
          </span>
          <span>
            Confidence: <span className="font-medium text-foreground">{smc.confidence}%</span>
          </span>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-lg border border-bull/30 bg-panel p-4">
          <h4 className="num text-xs font-semibold uppercase tracking-wide text-bull">
            Bullish confluence ({smc.bullScore}/5)
          </h4>
          <ul className="mt-2 space-y-1.5">
            {smc.bullConfirmations.map((c) => (
              <ConfirmationRow key={c.key} c={c} />
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-bear/30 bg-panel p-4">
          <h4 className="num text-xs font-semibold uppercase tracking-wide text-bear">
            Bearish confluence ({smc.bearScore}/5)
          </h4>
          <ul className="mt-2 space-y-1.5">
            {smc.bearConfirmations.map((c) => (
              <ConfirmationRow key={c.key} c={c} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
