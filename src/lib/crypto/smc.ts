/**
 * Advanced SMC Predictor — TypeScript port of the Pine v5 indicator
 * (Sessions + Market Structure + Order Blocks + FVG + Volume-Profile POC +
 *  Liquidity Sweeps + Supply/Demand + S/R + confluence scoring).
 *
 * Every rule below mirrors the Pine source 1:1 so the on-chart signal and the
 * DeepScreen signal agree.
 */
import type { Candle } from "./binance";

export interface Zone {
  type: "bullFVG" | "bearFVG" | "bullOB" | "bearOB" | "supply" | "demand";
  fromIndex: number;
  top: number;
  bottom: number;
  strong?: boolean;
  poc?: number;
}

export interface Confirmation {
  key: string;
  label: string;
  ok: boolean;
  detail: string;
}

export type SmcSide = "bullish" | "bearish" | "none";

export interface SmcResult {
  atr: number;
  emaFast: number[];
  emaSlow: number[];
  emaTrend: "Bullish" | "Bearish";
  structure: "Bullish" | "Bearish" | "Neutral";
  lastSwingHigh: number | null;
  lastSwingLow: number | null;
  zones: Zone[];
  support: number[];
  resistance: number[];
  poc: number | null;
  strongestFvg: Zone | null;
  session: string;
  bullScore: number;
  bearScore: number;
  bullConfirmations: Confirmation[];
  bearConfirmations: Confirmation[];
  /** Only "bullish"/"bearish" when every one of the 5 confluences is confirmed. */
  signal: SmcSide;
  signalLabel: string;
  confidence: number;
  entry: number;
  stop: number;
  target1: number;
  target2: number;
  riskReward: number;
  explanation: string;
  events: { index: number; time: number; kind: string; side: "up" | "down"; text: string }[];
}

const SWING_LEN = 5;
const EMA_FAST = 9;
const EMA_SLOW = 21;
const OB_DISPLACE = 1.5;
const SD_LOOKBACK = 20;
const SD_BREAK = 1.3;
const VP_LOOKBACK = 30;
const VP_BINS = 24;
const SR_MERGE_ATR = 0.6;
const SR_MAX = 6;
/** Confluences are checked across the last N closed bars, as an alert would fire. */
const RECENT = 3;

function ema(values: number[], len: number): number[] {
  const k = 2 / (len + 1);
  const out: number[] = [];
  let prev = values[0] ?? 0;
  values.forEach((v, i) => {
    prev = i === 0 ? v : v * k + prev * (1 - k);
    out.push(prev);
  });
  return out;
}

function atr14(c: Candle[]): number[] {
  const tr: number[] = [];
  for (let i = 0; i < c.length; i++) {
    const p = c[i - 1];
    const cur = c[i]!;
    tr.push(p ? Math.max(cur.high - cur.low, Math.abs(cur.high - p.close), Math.abs(cur.low - p.close)) : cur.high - cur.low);
  }
  return ema(tr, 14);
}

function pivotHigh(c: Candle[], i: number): number | null {
  if (i < SWING_LEN || i + SWING_LEN >= c.length) return null;
  const v = c[i]!.high;
  for (let j = i - SWING_LEN; j <= i + SWING_LEN; j++) if (j !== i && c[j]!.high >= v) return null;
  return v;
}

function pivotLow(c: Candle[], i: number): number | null {
  if (i < SWING_LEN || i + SWING_LEN >= c.length) return null;
  const v = c[i]!.low;
  for (let j = i - SWING_LEN; j <= i + SWING_LEN; j++) if (j !== i && c[j]!.low <= v) return null;
  return v;
}

function sessionOf(tsSeconds: number): string {
  const h = new Date(tsSeconds * 1000).getUTCHours();
  if (h >= 13 && h < 22) return "New York";
  if (h >= 8 && h < 17) return "London";
  if (h < 9) return "Asian";
  return "Off-Session";
}

/** Volume-by-price profile over the impulsive leg; returns the Point of Control. */
function volumeProfile(c: Candle[], end: number, len = VP_LOOKBACK, bins = VP_BINS) {
  const start = Math.max(0, end - len + 1);
  const slice = c.slice(start, end + 1);
  if (slice.length < 5) return null;
  const hi = Math.max(...slice.map((x) => x.high));
  const lo = Math.min(...slice.map((x) => x.low));
  const binSize = (hi - lo) / bins;
  if (!(binSize > 0)) return null;
  const arr = new Array<number>(bins).fill(0);
  for (const k of slice) {
    const px = (k.high + k.low + k.close) / 3;
    const idx = Math.min(bins - 1, Math.max(0, Math.floor((px - lo) / binSize)));
    arr[idx] = (arr[idx] ?? 0) + k.volume;
  }
  let maxIdx = 0;
  let maxVol = -1;
  arr.forEach((v, i) => {
    if (v > maxVol) {
      maxVol = v;
      maxIdx = i;
    }
  });
  return { poc: lo + (maxIdx + 0.5) * binSize, bins: arr, lo, binSize, maxVol };
}

export function analyzeSmc(candles: Candle[]): SmcResult | null {
  if (candles.length < 60) return null;
  const n = candles.length;
  const last = candles[n - 1]!;
  const closes = candles.map((c) => c.close);
  const emaF = ema(closes, EMA_FAST);
  const emaS = ema(closes, EMA_SLOW);
  const atrArr = atr14(candles);
  const atr = atrArr[n - 1]!;

  // ---- Market structure -----------------------------------------------
  let lastSwingHigh: number | null = null;
  let prevSwingHigh: number | null = null;
  let lastSwingLow: number | null = null;
  let prevSwingLow: number | null = null;
  let structTrend = 0;
  let higherLowFormed = false;
  let lowerHighFormed = false;
  const resistance: number[] = [];
  const support: number[] = [];
  const events: SmcResult["events"] = [];
  const mergeThresh = atr * SR_MERGE_ATR;

  const addLevel = (arr: number[], price: number) => {
    if (arr.some((p) => Math.abs(p - price) < mergeThresh)) return;
    arr.push(price);
    if (arr.length > SR_MAX) arr.shift();
  };

  for (let i = 0; i < n; i++) {
    const ph = pivotHigh(candles, i);
    if (ph !== null) {
      prevSwingHigh = lastSwingHigh;
      lastSwingHigh = ph;
      if (prevSwingHigh !== null) {
        const isHH = ph > prevSwingHigh;
        structTrend = isHH ? 1 : -1;
        lowerHighFormed = !isHH && i >= n - RECENT - SWING_LEN;
        events.push({ index: i, time: candles[i]!.time, kind: isHH ? "HH" : "LH", side: "down", text: isHH ? "HH" : "LH" });
      }
      addLevel(resistance, ph);
    }
    const pl = pivotLow(candles, i);
    if (pl !== null) {
      prevSwingLow = lastSwingLow;
      lastSwingLow = pl;
      if (prevSwingLow !== null) {
        const isLL = pl < prevSwingLow;
        structTrend = isLL ? -1 : 1;
        higherLowFormed = !isLL && i >= n - RECENT - SWING_LEN;
        events.push({ index: i, time: candles[i]!.time, kind: isLL ? "LL" : "HL", side: "up", text: isLL ? "LL" : "HL" });
      }
      addLevel(support, pl);
    }
  }

  // ---- Per-bar signals over the recent window -------------------------
  const zones: Zone[] = [];
  let freshBullFvg = false;
  let freshBearFvg = false;
  let newBullOb = false;
  let newBearOb = false;
  let bullSweep = false;
  let bearSweep = false;
  let emaBullCross = false;
  let emaBearCross = false;
  let strongestFvg: Zone | null = null;
  let poc: number | null = null;
  let sweepDetail = "";

  for (let i = 2; i < n; i++) {
    const c = candles[i]!;
    const p1 = candles[i - 1]!;
    const p2 = candles[i - 2]!;
    const a = atrArr[i]!;
    const recent = i >= n - RECENT;

    // Fair value gaps
    if (c.low > p2.high && p1.close > p1.open) {
      const z: Zone = { type: "bullFVG", fromIndex: i - 2, top: c.low, bottom: p2.high };
      const vp = volumeProfile(candles, i);
      if (vp && vp.poc >= z.bottom && vp.poc <= z.top) {
        z.strong = true;
        z.poc = vp.poc;
        strongestFvg = z;
        poc = vp.poc;
      }
      zones.push(z);
      if (recent) freshBullFvg = true;
    }
    if (c.high < p2.low && p1.close < p1.open) {
      const z: Zone = { type: "bearFVG", fromIndex: i - 2, top: p2.low, bottom: c.high };
      const vp = volumeProfile(candles, i);
      if (vp && vp.poc >= z.bottom && vp.poc <= z.top) {
        z.strong = true;
        z.poc = vp.poc;
        strongestFvg = z;
        poc = vp.poc;
      }
      zones.push(z);
      if (recent) freshBearFvg = true;
    }

    // Order blocks (displacement candle after an opposite candle)
    if (c.close - c.open > a * OB_DISPLACE && c.close > c.open && p1.close < p1.open) {
      zones.push({ type: "bullOB", fromIndex: i - 1, top: p1.open, bottom: p1.low });
      if (recent) newBullOb = true;
    }
    if (c.open - c.close > a * OB_DISPLACE && c.close < c.open && p1.close > p1.open) {
      zones.push({ type: "bearOB", fromIndex: i - 1, top: p1.high, bottom: p1.open });
      if (recent) newBearOb = true;
    }

    // Supply / demand from a consolidation break
    if (i > SD_LOOKBACK) {
      const win = candles.slice(i - SD_LOOKBACK, i);
      const rangeHigh = Math.max(...win.map((x) => x.high));
      const rangeLow = Math.min(...win.map((x) => x.low));
      if (c.close > rangeHigh && c.close - c.open > a * SD_BREAK) {
        zones.push({ type: "demand", fromIndex: i - SD_LOOKBACK, top: rangeLow + (rangeHigh - rangeLow) * 0.35, bottom: rangeLow });
      }
      if (c.close < rangeLow && c.open - c.close > a * SD_BREAK) {
        zones.push({ type: "supply", fromIndex: i - SD_LOOKBACK, top: rangeHigh, bottom: rangeHigh - (rangeHigh - rangeLow) * 0.35 });
      }
    }

    // EMA crosses
    if (emaF[i]! > emaS[i]! && emaF[i - 1]! <= emaS[i - 1]!) {
      if (recent) emaBullCross = true;
      events.push({ index: i, time: c.time, kind: "EMA", side: "up", text: "EMA×" });
    }
    if (emaF[i]! < emaS[i]! && emaF[i - 1]! >= emaS[i - 1]!) {
      if (recent) emaBearCross = true;
      events.push({ index: i, time: c.time, kind: "EMA", side: "down", text: "EMA×" });
    }

    // Liquidity sweeps + BOS versus the swings known at that bar
    const swingLow = support[support.length - 1];
    const swingHigh = resistance[resistance.length - 1];
    if (swingLow !== undefined && c.low < swingLow && c.close > swingLow && c.close > c.open) {
      if (recent) {
        bullSweep = true;
        sweepDetail = `Liquidity taken below ${swingLow.toPrecision(6)} then reclaimed on the close`;
      }
      events.push({ index: i, time: c.time, kind: "SWEEP", side: "up", text: "SWEEP" });
    }
    if (swingHigh !== undefined && c.high > swingHigh && c.close < swingHigh && c.close < c.open) {
      if (recent) {
        bearSweep = true;
        sweepDetail = `Liquidity taken above ${swingHigh.toPrecision(6)} then rejected on the close`;
      }
      events.push({ index: i, time: c.time, kind: "SWEEP", side: "down", text: "SWEEP" });
    }
    if (swingHigh !== undefined && c.close > swingHigh && p1.close <= swingHigh) {
      events.push({ index: i, time: c.time, kind: "BOS", side: "up", text: "BOS ▲" });
    }
    if (swingLow !== undefined && c.close < swingLow && p1.close >= swingLow) {
      events.push({ index: i, time: c.time, kind: "BOS", side: "down", text: "BOS ▼" });
    }
  }

  const strongBull = strongestFvg?.type === "bullFVG" && strongestFvg.strong === true;
  const strongBear = strongestFvg?.type === "bearFVG" && strongestFvg.strong === true;

  const bullConfirmations: Confirmation[] = [
    { key: "sweep", label: "Liquidity sweep (buy-side taken)", ok: bullSweep, detail: bullSweep ? sweepDetail : "No stop-run below the last swing low yet" },
    {
      key: "fvg",
      label: "Fresh bullish FVG" + (strongBull ? " confirmed by volume POC" : ""),
      ok: freshBullFvg,
      detail: freshBullFvg
        ? strongBull
          ? `Imbalance ${strongestFvg!.bottom.toPrecision(6)}–${strongestFvg!.top.toPrecision(6)} holds the point of control`
          : "Three-candle imbalance printed to the upside"
        : "No unmitigated bullish imbalance in the last bars",
    },
    { key: "ob", label: "Bullish order block", ok: newBullOb, detail: newBullOb ? "Displacement candle (>1.5×ATR) left an institutional demand block" : "No displacement leg from a down candle" },
    { key: "ema", label: `EMA ${EMA_FAST}/${EMA_SLOW} bull cross`, ok: emaBullCross, detail: emaBullCross ? "Fast EMA crossed above the slow EMA" : `Fast EMA is ${emaF[n - 1]! > emaS[n - 1]! ? "above" : "below"} the slow EMA, no fresh cross` },
    { key: "struct", label: "Structure shift (higher low)", ok: structTrend === -1 && higherLowFormed, detail: structTrend === -1 && higherLowFormed ? "A higher low printed inside a bearish leg — CHoCH" : "Structure has not turned yet" },
  ];

  const bearConfirmations: Confirmation[] = [
    { key: "sweep", label: "Liquidity sweep (sell-side taken)", ok: bearSweep, detail: bearSweep ? sweepDetail : "No stop-run above the last swing high yet" },
    {
      key: "fvg",
      label: "Fresh bearish FVG" + (strongBear ? " confirmed by volume POC" : ""),
      ok: freshBearFvg,
      detail: freshBearFvg
        ? strongBear
          ? `Imbalance ${strongestFvg!.bottom.toPrecision(6)}–${strongestFvg!.top.toPrecision(6)} holds the point of control`
          : "Three-candle imbalance printed to the downside"
        : "No unmitigated bearish imbalance in the last bars",
    },
    { key: "ob", label: "Bearish order block", ok: newBearOb, detail: newBearOb ? "Displacement candle (>1.5×ATR) left an institutional supply block" : "No displacement leg from an up candle" },
    { key: "ema", label: `EMA ${EMA_FAST}/${EMA_SLOW} bear cross`, ok: emaBearCross, detail: emaBearCross ? "Fast EMA crossed below the slow EMA" : `Fast EMA is ${emaF[n - 1]! > emaS[n - 1]! ? "above" : "below"} the slow EMA, no fresh cross` },
    { key: "struct", label: "Structure shift (lower high)", ok: structTrend === 1 && lowerHighFormed, detail: structTrend === 1 && lowerHighFormed ? "A lower high printed inside a bullish leg — CHoCH" : "Structure has not turned yet" },
  ];

  const bullScore = bullConfirmations.filter((c) => c.ok).length;
  const bearScore = bearConfirmations.filter((c) => c.ok).length;

  // Signal is published only on full confluence (5/5), as requested.
  let signal: SmcSide = "none";
  if (bullScore === 5 && bullScore > bearScore) signal = "bullish";
  else if (bearScore === 5 && bearScore > bullScore) signal = "bearish";

  const entry = last.close;
  const isBull = signal === "bullish" || (signal === "none" && bullScore >= bearScore);
  const stop = isBull ? Math.min(lastSwingLow ?? entry - atr * 1.5, entry - atr * 1.2) : Math.max(lastSwingHigh ?? entry + atr * 1.5, entry + atr * 1.2);
  const risk = Math.abs(entry - stop) || atr;
  const target1 = isBull ? entry + risk * 2 : entry - risk * 2;
  const target2 = isBull ? entry + risk * 3.5 : entry - risk * 3.5;

  const session = sessionOf(last.time);
  const structure = structTrend === 1 ? "Bullish" : structTrend === -1 ? "Bearish" : "Neutral";
  const emaTrend = emaF[n - 1]! > emaS[n - 1]! ? "Bullish" : "Bearish";
  const confidence = Math.round((Math.max(bullScore, bearScore) / 5) * 100);

  const pending = (signal === "bearish" ? bearConfirmations : bullConfirmations).filter((c) => !c.ok).map((c) => c.label);
  const explanation =
    signal === "none"
      ? `No confirmed setup. Structure is ${structure.toLowerCase()} and the EMA trend is ${emaTrend.toLowerCase()} during the ${session} session, but only ${Math.max(
          bullScore,
          bearScore,
        )} of 5 confluences are present. Still missing: ${pending.join(", ") || "—"}. DeepScreen only publishes a signal when all five align.`
      : `${signal === "bullish" ? "BUY" : "SELL"} confirmed at full 5/5 confluence during the ${session} session. Liquidity was ${
          signal === "bullish" ? "swept below the swing low" : "swept above the swing high"
        }, a fresh ${signal === "bullish" ? "bullish" : "bearish"} fair-value gap${
          strongestFvg?.strong ? " sitting on the volume point of control" : ""
        } was left behind, an institutional ${signal === "bullish" ? "demand" : "supply"} order block formed on a displacement candle above 1.5×ATR, the ${EMA_FAST}/${EMA_SLOW} EMAs crossed in the same direction and market structure shifted (${
          signal === "bullish" ? "higher low / CHoCH" : "lower high / CHoCH"
        }). Risk is defined at ${stop.toPrecision(6)} with a ${(Math.abs(target1 - entry) / risk).toFixed(1)}R first target.`;

  return {
    atr,
    emaFast: emaF,
    emaSlow: emaS,
    emaTrend,
    structure,
    lastSwingHigh,
    lastSwingLow,
    zones: zones.slice(-40),
    support: support.slice(-SR_MAX),
    resistance: resistance.slice(-SR_MAX),
    poc,
    strongestFvg,
    session,
    bullScore,
    bearScore,
    bullConfirmations,
    bearConfirmations,
    signal,
    signalLabel: signal === "bullish" ? "BUY — 5/5 confirmed" : signal === "bearish" ? "SELL — 5/5 confirmed" : "No confirmed signal",
    confidence,
    entry,
    stop,
    target1,
    target2,
    riskReward: Number((Math.abs(target1 - entry) / risk).toFixed(2)),
    explanation,
    events: events.slice(-60),
  };
}
