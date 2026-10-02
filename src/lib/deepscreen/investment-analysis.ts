export interface HistoricalPoint {
  at: number;
  value: number;
}

export interface HistoricalMetrics {
  startDate: string;
  endDate: string;
  latestValue: number;
  observations: number;
  return1yPct: number | null;
  return3yAnnualizedPct: number | null;
  return5yAnnualizedPct: number | null;
  return10yAnnualizedPct: number | null;
  rolling3yMedianPct: number | null;
  rolling3yPositivePct: number | null;
  rolling5yMedianPct: number | null;
  rolling5yPositivePct: number | null;
  maxDrawdown3yPct: number | null;
  maxDrawdown5yPct: number | null;
  volatility3yPct: number | null;
  volatility5yPct: number | null;
}

export interface InvestmentHolding {
  symbol: string;
  name: string;
  weightPct: number | null;
}

export interface SectorWeight {
  name: string;
  weightPct: number;
}

export interface FundProfileAnalysis {
  family: string | null;
  category: string | null;
  legalType: string | null;
  expenseRatioPct: number | null;
  turnoverPct: number | null;
  totalAssets: number | null;
  currency: string | null;
  marketPrice: number | null;
  navPrice: number | null;
  bid: number | null;
  ask: number | null;
  currentSpreadPct: number | null;
  premiumDiscountPct: number | null;
  averageVolume: number | null;
  yieldPct: number | null;
  beta3Year: number | null;
  threeYearAverageReturnPct: number | null;
  fiveYearAverageReturnPct: number | null;
  holdingsCount: number | null;
  top10WeightPct: number | null;
  cashPositionPct: number | null;
  portfolioPe: number | null;
  portfolioPb: number | null;
  topSectors: SectorWeight[];
  holdings: InvestmentHolding[];
}

export interface HoldingQualityAnalysis {
  weightedRoePct: number | null;
  weightedEarningsGrowthPct: number | null;
  weightedDebtToEquity: number | null;
  coveredWeightPct: number;
  holdingsAnalyzed: number;
}

export interface MutualFundMetadata {
  fundHouse: string | null;
  schemeType: string | null;
  schemeCategory: string | null;
  schemeName: string | null;
  planType: "Direct" | "Regular" | "Unclear";
  optionType: "Growth" | "IDCW" | "Other";
}

export interface ReitAnalysis {
  marketCap: number | null;
  currency: string | null;
  pe: number | null;
  pb: number | null;
  dividendYieldPct: number | null;
  payoutRatioPct: number | null;
  debtToEquity: number | null;
  totalDebt: number | null;
  totalCash: number | null;
  ebitda: number | null;
  debtToEbitda: number | null;
  netDebtToEbitda: number | null;
  operatingCashflow: number | null;
  freeCashflow: number | null;
  revenueGrowthPct: number | null;
  earningsGrowthPct: number | null;
  sector: string | null;
  industry: string | null;
  country: string | null;
}

export interface InvestmentAnalysisData {
  fetchedAt: string;
  sources: string[];
  history: HistoricalMetrics | null;
  fundProfile: FundProfileAnalysis | null;
  holdingQuality: HoldingQualityAnalysis | null;
  mutualFund: MutualFundMetadata | null;
  reit: ReitAnalysis | null;
}

const DAY = 86_400_000;
const YEAR = 365.2425 * DAY;

function round(value: number, digits = 2): number {
  const p = 10 ** digits;
  return Math.round(value * p) / p;
}

function normalizePoints(points: HistoricalPoint[]): HistoricalPoint[] {
  const sorted = points
    .filter((point) => Number.isFinite(point.at) && Number.isFinite(point.value) && point.value > 0)
    .sort((a, b) => a.at - b.at);
  const deduped: HistoricalPoint[] = [];
  for (const point of sorted) {
    const prev = deduped[deduped.length - 1];
    if (prev?.at === point.at) prev.value = point.value;
    else deduped.push({ ...point });
  }
  return deduped;
}

/** Collapse daily NAV/history to approximately weekly observations so volatility is comparable across sources. */
function sampleWeekly(points: HistoricalPoint[]): HistoricalPoint[] {
  if (points.length <= 2) return points;
  const sampled: HistoricalPoint[] = [];
  let bucket = -1;
  for (const point of points) {
    const nextBucket = Math.floor(point.at / (7 * DAY));
    if (nextBucket !== bucket) {
      sampled.push({ ...point });
      bucket = nextBucket;
    } else {
      sampled[sampled.length - 1] = { ...point };
    }
  }
  return sampled;
}

function indexAtOrBefore(points: HistoricalPoint[], target: number): number {
  let lo = 0;
  let hi = points.length - 1;
  let answer = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (points[mid]!.at <= target) {
      answer = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return answer;
}

function annualizedReturn(points: HistoricalPoint[], years: number): number | null {
  if (points.length < 2) return null;
  const end = points[points.length - 1]!;
  const target = end.at - years * YEAR;
  const index = indexAtOrBefore(points, target);
  if (index < 0) return null;
  const start = points[index]!;
  const actualYears = (end.at - start.at) / YEAR;
  if (actualYears < years * 0.9 || start.value <= 0) return null;
  return round((Math.pow(end.value / start.value, 1 / actualYears) - 1) * 100);
}

function oneYearReturn(points: HistoricalPoint[]): number | null {
  if (points.length < 2) return null;
  const end = points[points.length - 1]!;
  const index = indexAtOrBefore(points, end.at - YEAR);
  if (index < 0) return null;
  const start = points[index]!;
  const actualYears = (end.at - start.at) / YEAR;
  if (actualYears < 0.9 || start.value <= 0) return null;
  return round((end.value / start.value - 1) * 100);
}

function rollingReturns(points: HistoricalPoint[], years: number): number[] {
  const out: number[] = [];
  for (let endIndex = 0; endIndex < points.length; endIndex += 1) {
    const end = points[endIndex]!;
    const startIndex = indexAtOrBefore(points, end.at - years * YEAR);
    if (startIndex < 0) continue;
    const start = points[startIndex]!;
    const actualYears = (end.at - start.at) / YEAR;
    if (actualYears < years * 0.9 || start.value <= 0) continue;
    out.push((Math.pow(end.value / start.value, 1 / actualYears) - 1) * 100);
  }
  return out;
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const value = sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
  return round(value);
}

function positiveRate(values: number[]): number | null {
  if (!values.length) return null;
  return round((values.filter((value) => value > 0).length / values.length) * 100, 1);
}

function maxDrawdown(points: HistoricalPoint[], years: number): number | null {
  if (points.length < 2) return null;
  const endAt = points[points.length - 1]!.at;
  const slice = points.filter((point) => point.at >= endAt - years * YEAR);
  if (slice.length < 2) return null;
  let peak = slice[0]!.value;
  let worst = 0;
  for (const point of slice) {
    peak = Math.max(peak, point.value);
    worst = Math.min(worst, point.value / peak - 1);
  }
  return round(worst * 100);
}

function annualizedVolatility(points: HistoricalPoint[], years: number): number | null {
  if (points.length < 3) return null;
  const endAt = points[points.length - 1]!.at;
  const slice = points.filter((point) => point.at >= endAt - years * YEAR);
  if (slice.length < 3) return null;
  const returns: number[] = [];
  for (let i = 1; i < slice.length; i += 1) {
    const previous = slice[i - 1]!.value;
    const current = slice[i]!.value;
    if (previous > 0 && current > 0) returns.push(Math.log(current / previous));
  }
  if (returns.length < 2) return null;
  const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const variance = returns.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (returns.length - 1);
  return round(Math.sqrt(variance) * Math.sqrt(52) * 100);
}

export function computeHistoricalMetrics(rawPoints: HistoricalPoint[]): HistoricalMetrics | null {
  const points = sampleWeekly(normalizePoints(rawPoints));
  if (points.length < 2) return null;
  const rolling3 = rollingReturns(points, 3);
  const rolling5 = rollingReturns(points, 5);
  return {
    startDate: new Date(points[0]!.at).toISOString().slice(0, 10),
    endDate: new Date(points[points.length - 1]!.at).toISOString().slice(0, 10),
    latestValue: points[points.length - 1]!.value,
    observations: points.length,
    return1yPct: oneYearReturn(points),
    return3yAnnualizedPct: annualizedReturn(points, 3),
    return5yAnnualizedPct: annualizedReturn(points, 5),
    return10yAnnualizedPct: annualizedReturn(points, 10),
    rolling3yMedianPct: median(rolling3),
    rolling3yPositivePct: positiveRate(rolling3),
    rolling5yMedianPct: median(rolling5),
    rolling5yPositivePct: positiveRate(rolling5),
    maxDrawdown3yPct: maxDrawdown(points, 3),
    maxDrawdown5yPct: maxDrawdown(points, 5),
    volatility3yPct: annualizedVolatility(points, 3),
    volatility5yPct: annualizedVolatility(points, 5),
  };
}

export function parseMutualFundPlan(name: string): Pick<MutualFundMetadata, "planType" | "optionType"> {
  const lower = name.toLowerCase();
  const planType: MutualFundMetadata["planType"] = /\bdirect\b/.test(lower)
    ? "Direct"
    : /\bregular\b/.test(lower)
      ? "Regular"
      : "Unclear";
  const optionType: MutualFundMetadata["optionType"] = /\bgrowth\b/.test(lower)
    ? "Growth"
    : /\bidcw\b|income distribution|dividend/.test(lower)
      ? "IDCW"
      : "Other";
  return { planType, optionType };
}
