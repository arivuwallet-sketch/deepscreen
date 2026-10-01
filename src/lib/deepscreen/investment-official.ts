import type {
  FundProfileAnalysis,
  InvestmentAnalysisData,
} from "./investment-analysis";

export interface OfficialFundAnalytics {
  terPct: number | null;
  trackingErrorPct: number | null;
  trackingDifferencePct: number | null;
  benchmark: string | null;
  aumCrore: number | null;
  standardDeviationPct: number | null;
  beta: number | null;
  sharpe: number | null;
  treynor: number | null;
  jensensAlphaPct: number | null;
  informationRatio: number | null;
  riskometer: string | null;
  launchDate: string | null;
  exitLoad: string | null;
  minimumInvestment: number | null;
  objective: string | null;
  amcWebsite: string | null;
  schemeCode: string | null;
  isin: string | null;
  returns1yPct: number | null;
  returns3yPct: number | null;
  returns5yPct: number | null;
  benchmarkReturns1yPct: number | null;
  benchmarkReturns3yPct: number | null;
  benchmarkReturns5yPct: number | null;
  sourceDate: string | null;
}

export interface EnhancedFundProfileAnalysis extends FundProfileAnalysis {
  providerName: string | null;
  managerName: string | null;
  managerStartDate: string | null;
  inceptionDate: string | null;
  alpha3Year: number | null;
  sharpe3Year: number | null;
  stdDev3Year: number | null;
  rSquared3Year: number | null;
  treynor3Year: number | null;
}

export type EnhancedInvestmentAnalysisData = Omit<InvestmentAnalysisData, "fundProfile"> & {
  fundProfile: EnhancedFundProfileAnalysis | null;
  officialFund: OfficialFundAnalytics | null;
};
