/**
 * Black-Scholes-Merton pricing, full Greeks and multi-leg strategy analytics.
 * All rates/vols are decimals (0.06 = 6%), T in years.
 */

export type OptType = "call" | "put";

export interface Greeks {
  delta: number;
  gamma: number;
  theta: number; // per day
  vega: number; // per 1 vol point
  rho: number; // per 1% rate move
}

export interface Priced extends Greeks {
  price: number;
  d1: number;
  d2: number;
}

const SQRT2PI = Math.sqrt(2 * Math.PI);

function pdf(x: number): number {
  return Math.exp(-0.5 * x * x) / SQRT2PI;
}

/** Abramowitz-Stegun 7.1.26 based normal CDF (max error ~7.5e-8). */
export function normCdf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const z = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * z);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-z * z);
  return 0.5 * (1 + sign * y);
}

export interface BsInput {
  spot: number;
  strike: number;
  vol: number;
  rate: number;
  years: number;
  dividendYield?: number;
  type: OptType;
}

export function blackScholes(i: BsInput): Priced {
  const q = i.dividendYield ?? 0;
  const T = Math.max(i.years, 1 / 365 / 24);
  const sig = Math.max(i.vol, 0.0001);
  const st = sig * Math.sqrt(T);
  const d1 = (Math.log(i.spot / i.strike) + (i.rate - q + 0.5 * sig * sig) * T) / st;
  const d2 = d1 - st;
  const dfq = Math.exp(-q * T);
  const dfr = Math.exp(-i.rate * T);
  const Nd1 = normCdf(d1);
  const Nd2 = normCdf(d2);

  if (i.type === "call") {
    const price = i.spot * dfq * Nd1 - i.strike * dfr * Nd2;
    return {
      price,
      d1,
      d2,
      delta: dfq * Nd1,
      gamma: (dfq * pdf(d1)) / (i.spot * st),
      theta:
        (-(i.spot * dfq * pdf(d1) * sig) / (2 * Math.sqrt(T)) -
          i.rate * i.strike * dfr * Nd2 +
          q * i.spot * dfq * Nd1) /
        365,
      vega: (i.spot * dfq * pdf(d1) * Math.sqrt(T)) / 100,
      rho: (i.strike * T * dfr * Nd2) / 100,
    };
  }
  const price = i.strike * dfr * normCdf(-d2) - i.spot * dfq * normCdf(-d1);
  return {
    price,
    d1,
    d2,
    delta: -dfq * normCdf(-d1),
    gamma: (dfq * pdf(d1)) / (i.spot * st),
    theta:
      (-(i.spot * dfq * pdf(d1) * sig) / (2 * Math.sqrt(T)) +
        i.rate * i.strike * dfr * normCdf(-d2) -
        q * i.spot * dfq * normCdf(-d1)) /
      365,
    vega: (i.spot * dfq * pdf(d1) * Math.sqrt(T)) / 100,
    rho: (-i.strike * T * dfr * normCdf(-d2)) / 100,
  };
}

export interface Leg {
  type: OptType | "stock";
  strike: number;
  qty: number; // +long, -short (contracts / shares in lot units)
  premium: number;
  greeks: Greeks;
  label: string;
}

export interface StrategyResult {
  key: string;
  name: string;
  outlook: "bullish" | "bearish" | "neutral" | "volatility";
  legs: Leg[];
  netDebit: number; // >0 debit paid, <0 credit received
  maxProfit: number | null; // null = unlimited
  maxLoss: number | null; // null = unlimited (positive number = loss size)
  breakevens: number[];
  greeks: Greeks;
  payoff: { spot: number; pnl: number }[];
  probProfit: number;
  verdict: string;
  bestWhen: string;
}

export interface StrategyContext {
  spot: number;
  vol: number;
  rate: number;
  days: number;
  dividendYield?: number;
  lotSize?: number;
}

function mk(ctx: StrategyContext, type: OptType, strike: number, qty: number): Leg {
  const p = blackScholes({
    spot: ctx.spot,
    strike,
    vol: ctx.vol,
    rate: ctx.rate,
    years: ctx.days / 365,
    ...(ctx.dividendYield !== undefined ? { dividendYield: ctx.dividendYield } : {}),
    type,
  });
  return {
    type,
    strike,
    qty,
    premium: p.price,
    greeks: { delta: p.delta, gamma: p.gamma, theta: p.theta, vega: p.vega, rho: p.rho },
    label: `${qty > 0 ? "Long" : "Short"} ${Math.abs(qty)}× ${strike.toFixed(2)} ${type === "call" ? "CE" : "PE"}`,
  };
}

function stockLeg(ctx: StrategyContext, qty: number): Leg {
  return {
    type: "stock",
    strike: ctx.spot,
    qty,
    premium: ctx.spot,
    greeks: { delta: qty > 0 ? 1 : -1, gamma: 0, theta: 0, vega: 0, rho: 0 },
    label: `${qty > 0 ? "Long" : "Short"} ${Math.abs(qty)}× underlying @ ${ctx.spot.toFixed(2)}`,
  };
}

function intrinsic(leg: Leg, s: number): number {
  if (leg.type === "stock") return s - leg.strike;
  return leg.type === "call" ? Math.max(0, s - leg.strike) : Math.max(0, leg.strike - s);
}

function payoffAt(legs: Leg[], s: number): number {
  let v = 0;
  for (const l of legs) {
    if (l.type === "stock") v += l.qty * (s - l.strike);
    else v += l.qty * (intrinsic(l, s) - l.premium);
  }
  return v;
}

function netGreeks(legs: Leg[]): Greeks {
  return legs.reduce<Greeks>(
    (a, l) => ({
      delta: a.delta + l.qty * l.greeks.delta,
      gamma: a.gamma + l.qty * l.greeks.gamma,
      theta: a.theta + l.qty * l.greeks.theta,
      vega: a.vega + l.qty * l.greeks.vega,
      rho: a.rho + l.qty * l.greeks.rho,
    }),
    { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 },
  );
}

function analyzeLegs(
  key: string,
  name: string,
  outlook: StrategyResult["outlook"],
  bestWhen: string,
  ctx: StrategyContext,
  legs: Leg[],
): StrategyResult {
  const lo = Math.max(0.01, ctx.spot * 0.55);
  const hi = ctx.spot * 1.45;
  const steps = 121;
  const payoff: { spot: number; pnl: number }[] = [];
  for (let i = 0; i < steps; i++) {
    const s = lo + ((hi - lo) * i) / (steps - 1);
    payoff.push({ spot: s, pnl: payoffAt(legs, s) });
  }

  const wide = [0.001, 0.3, 0.6, 1, 1.4, 1.8, 3].map((m) => ctx.spot * m);
  const probe = [...payoff.map((p) => p.pnl), ...wide.map((s) => payoffAt(legs, s))];
  const tailUp = payoffAt(legs, ctx.spot * 6);
  const tailDown = payoffAt(legs, 0.0001);
  const boundedUp = tailUp <= Math.max(...probe) + 0.01;
  const maxProfitVal = Math.max(...probe);
  const maxLossVal = Math.min(...probe);

  const unlimitedProfit = tailUp > maxProfitVal * 1.5 && tailUp > 0;
  const unlimitedLoss = tailUp < maxLossVal * 1.5 || (!boundedUp && tailUp < 0);

  // breakevens by sign change scan
  const breakevens: number[] = [];
  const fine = 2000;
  let prev = payoffAt(legs, lo);
  for (let i = 1; i <= fine; i++) {
    const s = lo + ((hi - lo) * i) / fine;
    const cur = payoffAt(legs, s);
    if ((prev <= 0 && cur > 0) || (prev >= 0 && cur < 0)) breakevens.push(Number(s.toFixed(2)));
    prev = cur;
  }

  const netDebit = legs.reduce((a, l) => a + (l.type === "stock" ? 0 : l.qty * l.premium), 0);

  // Probability of profit under lognormal terminal distribution
  const T = ctx.days / 365;
  const sig = ctx.vol * Math.sqrt(T);
  const drift = (ctx.rate - (ctx.dividendYield ?? 0) - 0.5 * ctx.vol * ctx.vol) * T;
  let wins = 0;
  const n = 400;
  for (let i = 1; i <= n; i++) {
    const u = i / (n + 1);
    // inverse normal via bisection on normCdf
    let a = -6, b = 6;
    for (let k = 0; k < 40; k++) {
      const m = (a + b) / 2;
      if (normCdf(m) < u) a = m;
      else b = m;
    }
    const z = (a + b) / 2;
    const s = ctx.spot * Math.exp(drift + sig * z);
    if (payoffAt(legs, s) > 0) wins++;
  }
  const probProfit = Number(((wins / n) * 100).toFixed(1));

  const g = netGreeks(legs);
  const maxProfit = unlimitedProfit ? null : Number(maxProfitVal.toFixed(2));
  const maxLoss = unlimitedLoss || tailDown < maxLossVal * 1.5 ? null : Number(Math.abs(maxLossVal).toFixed(2));
  const rr =
    maxProfit !== null && maxLoss !== null && maxLoss > 0 ? (maxProfit / maxLoss).toFixed(2) : "∞";

  const verdict = `${netDebit >= 0 ? "Debit" : "Credit"} ${Math.abs(netDebit).toFixed(2)} · R:R ${rr} · POP ${probProfit}% · net delta ${g.delta.toFixed(3)}, theta ${g.theta.toFixed(3)}/day, vega ${g.vega.toFixed(3)}`;

  return {
    key,
    name,
    outlook,
    legs,
    netDebit: Number(netDebit.toFixed(2)),
    maxProfit,
    maxLoss,
    breakevens,
    greeks: {
      delta: Number(g.delta.toFixed(4)),
      gamma: Number(g.gamma.toFixed(6)),
      theta: Number(g.theta.toFixed(4)),
      vega: Number(g.vega.toFixed(4)),
      rho: Number(g.rho.toFixed(4)),
    },
    payoff,
    probProfit,
    verdict,
    bestWhen,
  };
}

/** Round a strike to a sensible tick for the price band. */
export function roundStrike(v: number): number {
  const step = v >= 5000 ? 100 : v >= 1000 ? 50 : v >= 250 ? 10 : v >= 50 ? 5 : v >= 10 ? 1 : 0.5;
  return Number((Math.round(v / step) * step).toFixed(2));
}

export function buildStrategies(ctx: StrategyContext): StrategyResult[] {
  const S = ctx.spot;
  const atm = roundStrike(S);
  const up1 = roundStrike(S * 1.05);
  const up2 = roundStrike(S * 1.1);
  const dn1 = roundStrike(S * 0.95);
  const dn2 = roundStrike(S * 0.9);

  return [
    analyzeLegs("long-call", "Long Call", "bullish", "Strong directional upside with limited risk; IV expected to rise.", ctx, [
      mk(ctx, "call", atm, 1),
    ]),
    analyzeLegs("long-put", "Long Put", "bearish", "Expecting a sharp fall or hedging a holding; limited risk.", ctx, [
      mk(ctx, "put", atm, 1),
    ]),
    analyzeLegs("bull-call-spread", "Bull Call Spread", "bullish", "Moderately bullish; caps cost and profit.", ctx, [
      mk(ctx, "call", atm, 1),
      mk(ctx, "call", up1, -1),
    ]),
    analyzeLegs("bull-put-spread", "Bull Put Spread", "bullish", "Mildly bullish/neutral; collect credit, keep it if price holds above the short put.", ctx, [
      mk(ctx, "put", dn1, 1),
      mk(ctx, "put", atm, -1),
    ]),
    analyzeLegs("bear-call-spread", "Bear Call Spread", "bearish", "Mildly bearish/neutral; credit strategy with defined risk.", ctx, [
      mk(ctx, "call", atm, -1),
      mk(ctx, "call", up1, 1),
    ]),
    analyzeLegs("bear-put-spread", "Bear Put Spread", "bearish", "Moderately bearish; debit strategy with defined risk and reward.", ctx, [
      mk(ctx, "put", atm, 1),
      mk(ctx, "put", dn1, -1),
    ]),
    analyzeLegs("put-backspread", "Put Backspread (Ratio)", "bearish", "Expecting a large downside move; short one near-money put, long two lower puts.", ctx, [
      mk(ctx, "put", atm, -1),
      mk(ctx, "put", dn1, 2),
    ]),
    analyzeLegs("short-strangle", "Short Strangle", "neutral", "Range-bound market with falling IV; unlimited risk, high POP.", ctx, [
      mk(ctx, "call", up1, -1),
      mk(ctx, "put", dn1, -1),
    ]),
    analyzeLegs("collar", "Collar", "neutral", "Protect an existing holding: long stock + protective put financed by a covered call.", ctx, [
      stockLeg(ctx, 1),
      mk(ctx, "put", dn1, 1),
      mk(ctx, "call", up1, -1),
    ]),
    analyzeLegs("long-butterfly", "Long Call Butterfly", "neutral", "Pinning near the middle strike at expiry; cheap, defined risk.", ctx, [
      mk(ctx, "call", dn2, 1),
      mk(ctx, "call", atm, -2),
      mk(ctx, "call", up2, 1),
    ]),
    analyzeLegs("short-straddle", "Short Straddle", "neutral", "Maximum theta harvest in a dead-flat market; unlimited risk both ways.", ctx, [
      mk(ctx, "call", atm, -1),
      mk(ctx, "put", atm, -1),
    ]),
    analyzeLegs("long-straddle", "Long Straddle", "volatility", "Event-driven: expecting a big move, direction unknown.", ctx, [
      mk(ctx, "call", atm, 1),
      mk(ctx, "put", atm, 1),
    ]),
  ];
}
