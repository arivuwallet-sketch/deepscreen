import type { Stock } from "./types";

export interface GrahamInputs {
  growthPct: number; // g — expected long-term EPS growth, as a plain percentage number (12 = 12%)
  aaaYield: number; // Y — current AAA corporate bond yield, as a plain percentage number
}

export interface GrahamResult {
  eps: number;
  applicable: boolean; // false when EPS <= 0 — the formula isn't meaningful for loss-makers
  intrinsicValue: number;
  upsidePct: number;
  verdict: "Undervalued" | "Fairly valued" | "Overvalued" | "Not applicable";
}

/** Sane fallback if the live AAA-yield fetch fails — not a live rate, just a reasonable default. */
export const DEFAULT_AAA_YIELD = 5.0;

export function defaultGrahamInputs(stock: Stock, aaaYield: number): GrahamInputs {
  const growthPct = Math.min(20, Math.max(0, Math.round(stock.fundamentals.growth)));
  return { growthPct, aaaYield };
}

/**
 * The Revised Graham Formula: V = [EPS × (8.5 + 2g) × 4.4] / Y
 * - 8.5: Graham's base P/E multiple for a company with zero growth.
 * - 2g: weight applied to the expected growth rate (g entered as a plain
 *   percentage number, e.g. 12 for 12% — not 0.12).
 * - 4.4: the risk-free rate in 1962 when Graham calibrated this revision.
 *   It stays a fixed constant; Y (below) is what re-bases the formula to
 *   today's rate environment.
 * - Y: the current AAA corporate bond yield, also a plain percentage number.
 *   Higher prevailing rates mechanically lower the intrinsic value here,
 *   the same way a higher discount rate lowers a DCF valuation.
 */
export function grahamValue(eps: number, inputs: GrahamInputs): number {
  if (eps <= 0 || inputs.aaaYield <= 0) return 0;
  const v = (eps * (8.5 + 2 * inputs.growthPct) * 4.4) / inputs.aaaYield;
  return Number(v.toFixed(2));
}

export function runGraham(stock: Stock, inputs: GrahamInputs): GrahamResult {
  const eps = stock.epsTtm;
  if (eps <= 0) {
    return { eps, applicable: false, intrinsicValue: 0, upsidePct: 0, verdict: "Not applicable" };
  }
  const intrinsicValue = grahamValue(eps, inputs);
  const upsidePct = Number((((intrinsicValue - stock.price) / stock.price) * 100).toFixed(1));
  const verdict: GrahamResult["verdict"] =
    upsidePct > 15 ? "Undervalued" : upsidePct < -15 ? "Overvalued" : "Fairly valued";
  return { eps, applicable: true, intrinsicValue, upsidePct, verdict };
}
