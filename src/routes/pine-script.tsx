import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  AlertCircle,
  Boxes,
  Check,
  Compass,
  Download,
  Gauge,
  LayoutDashboard,
  Layers,
  LineChart,
  Sparkles,
  Target,
  Waves,
} from "lucide-react";
import { toast } from "sonner";

import { Shell } from "@/components/ds/Shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { usePineScriptPurchase } from "@/hooks/usePineScriptPurchase";
import { downloadPineScript, purchasePineScript } from "@/lib/billing/billing.functions";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pine-script")({
  head: () => ({
    meta: [
      { title: "Advanced SMC Predictor — Pine Script Indicator | DeepScreen" },
      {
        name: "description",
        content:
          "A TradingView Pine Script indicator combining market structure, order blocks, fair value gaps, liquidity sweeps, an 80+ pattern candlestick engine and a 5-point confluence signal predictor. Works on stocks, forex, commodities, indices, every timeframe.",
      },
    ],
  }),
  component: PineScriptPage,
});

function Swatch({ className }: { className: string }) {
  return (
    <span className={cn("inline-block size-2.5 rounded-full", className)} aria-hidden="true" />
  );
}

function LabelChip({ swatchClass, text }: { swatchClass: string; text: string }) {
  return (
    <span className="num inline-flex items-center gap-1.5 rounded border border-border bg-background px-2 py-0.5 text-[11px] font-medium">
      <Swatch className={swatchClass} />
      {text}
    </span>
  );
}

interface Module {
  icon: typeof Compass;
  title: string;
  body: string;
  chips: { swatchClass: string; text: string }[];
  inputs: string;
}

const MODULES: Module[] = [
  {
    icon: Compass,
    title: "Trading Sessions",
    body: "Shades the chart background for the Asian, London and New York sessions, so you can see at a glance which session's liquidity is currently driving price — useful since SMC concepts (sweeps, order blocks) tend to form around session opens and overlaps.",
    chips: [
      { swatchClass: "bg-blue-500", text: "Asian session tint" },
      { swatchClass: "bg-orange-500", text: "London session tint" },
      { swatchClass: "bg-green-500", text: "New York session tint" },
    ],
    inputs: "Custom session times and colors for all three sessions, independently toggleable.",
  },
  {
    icon: Layers,
    title: "Market Structure — Swing Highs/Lows & BOS/CHoCH",
    body: "Detects swing pivots and labels every one as a Higher High, Higher Low, Lower High or Lower Low — the raw language of market structure. When price breaks the last confirmed swing, it draws a dashed Break-of-Structure line and label, which is how the indicator tracks whether the current trend is intact or has shifted (a Change of Character).",
    chips: [
      { swatchClass: "bg-lime-500", text: "HH" },
      { swatchClass: "bg-cyan-400", text: "HL" },
      { swatchClass: "bg-orange-500", text: "LH" },
      { swatchClass: "bg-red-500", text: "LL" },
      { swatchClass: "bg-lime-500", text: "BOS ▲" },
      { swatchClass: "bg-red-500", text: "BOS ▼" },
    ],
    inputs:
      "Swing lookback (left/right bars), independent toggles for structure labels and BOS/CHoCH lines.",
  },
  {
    icon: LineChart,
    title: "EMA Cross",
    body: "A fast and slow EMA (9/21 by default) plotted directly on the chart, with a triangle marker and a BUY/SELL label at every crossover — the simplest trend-confirmation layer, and one of the five inputs the confluence predictor checks.",
    chips: [
      { swatchClass: "bg-yellow-400", text: "EMA Fast line" },
      { swatchClass: "bg-fuchsia-500", text: "EMA Slow line" },
      { swatchClass: "bg-lime-500", text: "BUY label" },
      { swatchClass: "bg-red-500", text: "SELL label" },
    ],
    inputs: "Fast length, slow length, independent show/hide.",
  },
  {
    icon: Boxes,
    title: "Fair Value Gaps (FVG)",
    body: 'Flags the classic three-candle imbalance — a gap between candle 1\'s wick and candle 3\'s wick that price often returns to "fill." Boxes extend forward automatically and gray out once price has traded back through them (mitigated), so you can see at a glance which gaps are still "open."',
    chips: [
      { swatchClass: "bg-teal-500", text: "Bullish FVG box" },
      { swatchClass: "bg-red-500", text: "Bearish FVG box" },
    ],
    inputs: "Box extension length, colors, max boxes kept on chart at once.",
  },
  {
    icon: Sparkles,
    title: 'Volume Profile POC — "Strongest FVG" Detector',
    body: "The standout feature: for every fresh FVG, it builds a mini volume-by-price profile over the impulsive leg that created it and finds the Point of Control — the price level where the most volume actually traded. If that POC lands inside the gap, this FVG is flagged as the highest-conviction one on the chart, with its own histogram and POC line, instead of treating every gap as equally significant.",
    chips: [
      { swatchClass: "bg-yellow-400", text: "★ STRONGEST FVG (POC)" },
      { swatchClass: "bg-yellow-400", text: "POC line" },
      { swatchClass: "bg-cyan-300", text: "Mini volume histogram" },
    ],
    inputs:
      'Profile lookback and bin count, histogram width, "only draw for POC-confirmed FVGs" toggle.',
  },
  {
    icon: Target,
    title: "Order Blocks",
    body: 'Finds the last opposing candle right before a strong, ATR-measured displacement move — the classic "smart money" footprint. Like FVGs, order-block boxes gray out once price has traded back through and invalidated them.',
    chips: [
      { swatchClass: "bg-lime-500", text: "Bullish OB" },
      { swatchClass: "bg-red-900", text: "Bearish OB" },
    ],
    inputs: "Displacement factor (× ATR), max order blocks shown, box colors.",
  },
  {
    icon: Waves,
    title: "Supply & Demand Zones",
    body: "Marks the consolidation range immediately before a high-momentum breakout — the zone price left in a hurry, and often returns to retest.",
    chips: [
      { swatchClass: "bg-purple-500", text: "Supply Zone" },
      { swatchClass: "bg-blue-500", text: "Demand Zone" },
    ],
    inputs: "Consolidation lookback, breakout displacement factor (× ATR), max zones kept.",
  },
  {
    icon: Gauge,
    title: "Support & Resistance",
    body: "Auto-plots horizontal levels from swing pivots, merging any that land within an ATR-based distance of each other so you get a clean set of levels instead of visual clutter.",
    chips: [
      { swatchClass: "bg-red-500", text: "Resistance" },
      { swatchClass: "bg-lime-500", text: "Support" },
    ],
    inputs: "Max levels per side, merge threshold (× ATR).",
  },
  {
    icon: AlertCircle,
    title: "Liquidity Sweeps",
    body: "Catches the stop-hunt pattern: a wick that pokes beyond a swing high/low to grab resting liquidity, then closes back inside — one of the clearest tells of a manipulation move ahead of a genuine reversal.",
    chips: [
      { swatchClass: "bg-cyan-400", text: "SWEEP (bullish)" },
      { swatchClass: "bg-orange-500", text: "SWEEP (bearish)" },
    ],
    inputs: "Single show/hide toggle.",
  },
];

const PATTERN_GROUPS: { title: string; patterns: string[] }[] = [
  {
    title: "Doji family",
    patterns: [
      "Doji",
      "Dragonfly Doji",
      "Gravestone Doji",
      "Long-Legged Doji",
      "Doji Gapping Up",
      "Doji Gapping Down",
      "Northern Doji",
      "Southern Doji",
      "Doji Star, Bullish",
      "Doji Star, Bearish",
      "Doji Star, Collapsing",
    ],
  },
  {
    title: "Hammers & shooting stars",
    patterns: ["Hammer", "Hanging Man", "Inverted Hammer", "Shooting Star"],
  },
  {
    title: "Engulfing & Harami",
    patterns: [
      "Engulfing, Bullish",
      "Engulfing, Bearish",
      "Last Engulfing Bottom",
      "Last Engulfing Top",
      "Harami, Bullish",
      "Harami, Bearish",
      "Harami Cross, Bullish",
      "Harami Cross, Bearish",
      "Homing Pigeon",
    ],
  },
  {
    title: "Belt hold, piercing & stomach",
    patterns: [
      "Belt Hold, Bullish",
      "Belt Hold, Bearish",
      "Piercing Line",
      "Dark Cloud Cover",
      "Above the Stomach",
      "Below the Stomach",
    ],
  },
  {
    title: "Star formations (3-candle)",
    patterns: [
      "Morning Star",
      "Evening Star",
      "Morning Doji Star",
      "Evening Doji Star",
      "Abandoned Baby, Bullish",
      "Abandoned Baby, Bearish",
      "Tri-Star, Bullish",
      "Tri-Star, Bearish",
    ],
  },
  {
    title: "Soldiers, crows & inside/outside",
    patterns: [
      "Three White Soldiers",
      "Three Black Crows",
      "Identical Three Crows",
      "Advance Block",
      "Deliberation",
      "Three Stars in the South",
      "Three Inside Up",
      "Three Inside Down",
      "Three Outside Up",
      "Three Outside Down",
    ],
  },
  {
    title: "Kicking, tweezers & neck patterns",
    patterns: [
      "Kicking, Bullish",
      "Kicking, Bearish",
      "Tweezers Top",
      "Tweezers Bottom",
      "Matching Low",
      "On Neck",
      "In Neck",
    ],
  },
  {
    title: "Lines, sandwiches & rare formations",
    patterns: [
      "Meeting Lines, Bullish",
      "Meeting Lines, Bearish",
      "Separating Lines, Bullish",
      "Separating Lines, Bearish",
      "Stick Sandwich",
      "Unique Three River Bottom",
      "Concealing Baby Swallow",
      "Ladder Bottom",
    ],
  },
  {
    title: "Breakaway, methods & mat hold",
    patterns: [
      "Breakaway, Bullish",
      "Breakaway, Bearish",
      "Rising 3 Methods",
      "Falling 3 Methods",
      "Mat Hold",
    ],
  },
  {
    title: "Gaps, tasuki & side-by-side lines",
    patterns: [
      "Upside Gap Three Methods",
      "Downside Gap Three Methods",
      "Upside Tasuki Gap",
      "Downside Tasuki Gap",
      "Side by Side White Lines, Bullish",
      "Side by Side White Lines, Bearish",
      "Two Black Gapping",
      "Two Crows",
      "Upside Gap Two Crows",
    ],
  },
  {
    title: "Strike, waves & windows",
    patterns: [
      "Three Line Strike, Bullish",
      "Three Line Strike, Bearish",
      "High Wave",
      "Spinning Top",
      "Window, Rising",
      "Window, Falling",
    ],
  },
];

function triggerDownload(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function PineScriptPage() {
  const { user } = useAuth();
  const { purchased, loading: purchaseLoading, refresh } = usePineScriptPurchase();
  const [busy, setBusy] = useState<"buy" | "download" | null>(null);

  const withAccessToken = async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      toast.error("Please sign in again.");
      return null;
    }
    return token;
  };

  const handleBuy = async () => {
    if (!user) return;
    setBusy("buy");
    const accessToken = await withAccessToken();
    if (!accessToken) {
      setBusy(null);
      return;
    }
    const result = await purchasePineScript({ data: { accessToken } });
    setBusy(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    refresh();
    toast.success("Purchased — your download is ready below.");
  };

  const handleDownload = async () => {
    setBusy("download");
    const accessToken = await withAccessToken();
    if (!accessToken) {
      setBusy(null);
      return;
    }
    const result = await downloadPineScript({ data: { accessToken } });
    setBusy(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    triggerDownload(result.filename, result.content);
    toast.success("Downloaded — paste it into TradingView's Pine Editor.");
  };

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="animate-fade-in-up text-center">
          <span className="num inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" /> TradingView Pine Script v5 · Overlay Indicator
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Advanced SMC Predictor
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Sessions, market structure, order blocks, fair value gaps with a volume-profile POC
            check, liquidity sweeps, supply &amp; demand, support &amp; resistance, an 80+ pattern
            candlestick engine and a 5-point confluence signal predictor — one script, drawn
            directly on your chart.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            {["Stocks", "Forex", "Commodities", "Indices", "Crypto", "Every timeframe"].map((t) => (
              <span key={t} className="num rounded-full border border-border px-3 py-1">
                {t}
              </span>
            ))}
          </div>
        </header>

        <section className="mt-12">
          <h2 className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Every module, explained
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {MODULES.map((m, i) => (
              <div
                key={m.title}
                style={{ animationDelay: `${i * 40}ms` }}
                className="card-hover animate-fade-in-up rounded-lg border border-border bg-panel p-5"
              >
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded bg-primary/10 text-primary">
                    <m.icon className="size-4" />
                  </span>
                  <h3 className="text-sm font-semibold">{m.title}</h3>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{m.body}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {m.chips.map((c) => (
                    <LabelChip key={c.text} swatchClass={c.swatchClass} text={c.text} />
                  ))}
                </div>
                <p className="num mt-3 text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground">Configurable: </span>
                  {m.inputs}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="card-hover mt-8 animate-fade-in-up rounded-lg border border-border bg-panel p-5">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded bg-primary/10 text-primary">
              <LayoutDashboard className="size-4" />
            </span>
            <h3 className="text-sm font-semibold">Candlestick Pattern Library — 80+ patterns</h3>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Every single-candle, double-candle and multi-candle formation in the standard
            candlestick reference is detected with consistent, tunable ratio-based rules (body size,
            shadow length, trend context) — labeled directly on the bar it fires on, colored green
            for bullish, red for bearish, and gray for neutral/indecision patterns. Some patterns
            can legitimately co-fire on the same candle, the same way a human chartist might read
            more than one formation into the same spot.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PATTERN_GROUPS.map((g) => (
              <details key={g.title} className="rounded-lg border border-border p-3">
                <summary className="cursor-pointer text-xs font-semibold">
                  {g.title}{" "}
                  <span className="num font-normal text-muted-foreground">
                    ({g.patterns.length})
                  </span>
                </summary>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {g.patterns.map((p) => (
                    <span
                      key={p}
                      className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="card-hover animate-fade-in-up rounded-lg border border-primary/30 bg-panel p-5">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded bg-primary/10 text-primary">
                <Activity className="size-4" />
              </span>
              <h3 className="text-sm font-semibold">
                Early Reversal Predictor — confluence scoring
              </h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              The signal engine checks five independent confluences — a liquidity sweep, a fresh
              FVG, a new order block, an EMA cross, and a structure shift — separately for bullish
              and bearish bias, each worth one point. Only when the score crosses your chosen
              minimum (default 3 of 5) does it print an{" "}
              <span className="font-semibold text-bull">EARLY BULLISH REVERSAL</span> or{" "}
              <span className="font-semibold text-bear">EARLY BEARISH REVERSAL</span> label with its
              score, and fire a TradingView alert — so it's flagging genuine confluence, not any
              single indicator on its own.
            </p>
          </div>
          <div
            className="card-hover animate-fade-in-up rounded-lg border border-border bg-panel p-5"
            style={{ animationDelay: "60ms" }}
          >
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded bg-primary/10 text-primary">
                <LayoutDashboard className="size-4" />
              </span>
              <h3 className="text-sm font-semibold">Live dashboard & alerts</h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              A compact table pinned to the top-right of your chart shows Structure, EMA Trend, Bull
              Score, Bear Score, current Session, ATR(14) and the Strongest FVG status at a glance.
              Six TradingView alert conditions are pre-wired — Early Bullish/Bearish Reversal,
              Bullish/Bearish BOS, and Bullish/Bearish Liquidity Sweep — so you can get notified
              without watching the chart.
            </p>
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-md animate-fade-in-up">
          <div className="card-hover rounded-lg border border-primary/40 bg-panel p-6 text-center shadow-[0_0_0_1px_var(--primary)]">
            <p className="num text-xs uppercase tracking-wide text-muted-foreground">
              One-time purchase
            </p>
            <p className="num mt-1 text-5xl font-bold">
              ₹50<span className="text-base font-normal text-muted-foreground"> / lifetime</span>
            </p>
            <ul className="num mt-4 space-y-1.5 text-left text-xs text-muted-foreground">
              {[
                "The full .pine source file, yours to keep",
                "Paste directly into TradingView's Pine Editor",
                "Works on any market or timeframe TradingView supports",
                "Every input fully documented and tunable",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-bull" /> {f}
                </li>
              ))}
            </ul>

            <div className="mt-5">
              {!user ? (
                <Button asChild className="w-full">
                  <Link to="/auth">Sign in to buy</Link>
                </Button>
              ) : purchaseLoading ? (
                <div className="h-10 animate-pulse rounded-md bg-muted" />
              ) : purchased ? (
                <Button
                  className="w-full"
                  onClick={() => void handleDownload()}
                  disabled={busy !== null}
                >
                  <Download className="size-4" />
                  {busy === "download" ? "Preparing download…" : "Download .pine file"}
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => void handleBuy()}
                  disabled={busy !== null}
                >
                  <Sparkles className="size-4" />
                  {busy === "buy" ? "Processing…" : "Buy Now — ₹50"}
                </Button>
              )}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Card checkout isn't connected yet — buying activates your purchase and download
              instantly on this account.
            </p>
          </div>
        </section>

        <section className="mx-auto mt-10 max-w-2xl animate-fade-in-up text-center">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            After you download
          </h2>
          <ol className="num mt-4 grid gap-3 text-left text-xs text-muted-foreground sm:grid-cols-2">
            <li className="card-hover rounded-lg border border-border bg-panel p-3">
              <span className="font-semibold text-foreground">1.</span> Open any chart on
              TradingView and go to Pine Editor (bottom panel).
            </li>
            <li className="card-hover rounded-lg border border-border bg-panel p-3">
              <span className="font-semibold text-foreground">2.</span> Open the downloaded{" "}
              <code className="rounded bg-background px-1">.pine</code> file and paste its contents
              in.
            </li>
            <li className="card-hover rounded-lg border border-border bg-panel p-3">
              <span className="font-semibold text-foreground">3.</span> Click "Add to Chart," then
              tune the input groups to your market and timeframe.
            </li>
            <li className="card-hover rounded-lg border border-border bg-panel p-3">
              <span className="font-semibold text-foreground">4.</span> Right-click the chart → "Add
              Alert" to wire up any of the six built-in alert conditions.
            </li>
          </ol>
        </section>
      </div>
    </Shell>
  );
}
