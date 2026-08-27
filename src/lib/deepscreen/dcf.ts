import type { Stock } from "./types";

export interface DcfInputs {
  growthPct: number; // projected FCF growth, years 1-10
  discountPct: number; // WACC
  terminalPct: number; // perpetual growth
}

export interface DcfResult {
  fcfTtm: number; // billions, local currency
  sharesOut: number; // billions
  fcfPerShare: number;
  intrinsicValue: number; // per share
  upsidePct: number;
  verdict: "Undervalued" | "Fairly valued" | "Overvalued";
  pvExplicit: number;
  pvTerminal: number;
  years: { year: number; fcf: number; pv: number }[];
}

/** Shares outstanding (billions) implied by market cap and price. */
export function sharesOutstanding(stock: Stock): number {
  return stock.marketCap / stock.price;
}

/**
 * TTM free cash flow (billions) built from the income-statement view we hold:
 * EBITDA → less cash tax and maintenance capex, floored by net income so
 * loss-makers do not produce a positive DCF.
 */
export function freeCashFlow(stock: Stock): number {
  const f = stock.fundamentals;
  const ebitda = (stock.revenue * f.ebitdaMargin) / 100;
  const netIncome = (stock.revenue * f.netMargin) / 100;
  const capexAndTax = ebitda * 0.38;
  return Number(Math.max(netIncome * 0.55, ebitda - capexAndTax).toFixed(3));
}

export const DEFAULT_DCF: DcfInputs = { growthPct: 10, discountPct: 11, terminalPct: 3 };

export function defaultInputs(stock: Stock): DcfInputs {
  const f = stock.fundamentals;
  const growth = Math.min(25, Math.max(5, Math.round(f.growth)));
  const risk = f.debtToEquity > 1.2 ? 2 : f.debtToEquity > 0.6 ? 1 : 0;
  const capRisk = stock.cap === "small" ? 2 : stock.cap === "mid" ? 1 : 0;
  const discount = Math.min(15, Math.max(8, 9 + risk + capRisk));
  return { growthPct: growth, discountPct: discount, terminalPct: 3 };
}

export function runDcf(stock: Stock, inputs: DcfInputs): DcfResult {
  const fcfTtm = freeCashFlow(stock);
  const shares = sharesOutstanding(stock);
  const g = inputs.growthPct / 100;
  const r = Math.max(inputs.discountPct / 100, inputs.terminalPct / 100 + 0.01);
  const tg = inputs.terminalPct / 100;

  const years: DcfResult["years"] = [];
  let pvExplicit = 0;
  let fcf = fcfTtm;
  for (let t = 1; t <= 10; t++) {
    // Growth fades linearly to the terminal rate by year 10 (a two-stage DCF).
    const yearGrowth = g + ((tg - g) * (t - 1)) / 9;
    fcf = fcf * (1 + yearGrowth);
    const pv = fcf / Math.pow(1 + r, t);
    pvExplicit += pv;
    years.push({ year: t, fcf: Number(fcf.toFixed(2)), pv: Number(pv.toFixed(2)) });
  }

  const terminalValue = (fcf * (1 + tg)) / (r - tg);
  const pvTerminal = terminalValue / Math.pow(1 + r, 10);
  const equityValue = pvExplicit + pvTerminal; // billions
  const intrinsicValue = Number(((equityValue / shares) || 0).toFixed(2));
  const upsidePct = Number((((intrinsicValue - stock.price) / stock.price) * 100).toFixed(1));

  return {
    fcfTtm,
    sharesOut: Number(shares.toFixed(3)),
    fcfPerShare: Number(((fcfTtm / shares) || 0).toFixed(2)),
    intrinsicValue,
    upsidePct,
    verdict: upsidePct > 15 ? "Undervalued" : upsidePct < -15 ? "Overvalued" : "Fairly valued",
    pvExplicit: Number(pvExplicit.toFixed(2)),
    pvTerminal: Number(pvTerminal.toFixed(2)),
    years,
  };
}
