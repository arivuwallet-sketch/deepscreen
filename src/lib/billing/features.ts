export type FeatureAvailability = "free" | "pro";

export type PricingFeature = {
  name: string;
  free: string | boolean;
  pro: string | boolean;
  availability: FeatureAvailability;
};

export const FREE_FEATURES = [
  "Search the full DeepScreen company directory across supported NSE, BSE, NYSE, Nasdaq and LSE listings",
  "Live or provider-available share prices, company news and headline market data",
  "Core fundamental ratios including P/E, P/B, ROE, ROCE, ROA and debt/equity",
  "Basic stock screening, exchange browsing and public comparison pages",
  "DeepChart interactive price chart, market/timeframe selection and public technical education",
  "Public mutual fund, ETF, REIT, commodity, GIFT Nifty and IPO research pages",
  "Economic calendar, IPO calendar, research blog, FAQs and learning library",
  "Options strategy education pages and calculator inputs",
] as const;

export const PRO_FEATURES = [
  "DeepScreen 13-factor score, verdict, strengths, risks and score-change analysis",
  "DeepChart Pro verdict, confluence, confidence, playbook and advanced technical reading",
  "DeepChart trade ticket with entry zone, stop, targets, trailing level, exit rules and sizing notes",
  "Options Strategy Lab results for 12 strategies with payoff charts, Greeks, breakevens and probability of profit",
  "DCF and Graham intrinsic-value calculators",
  "Vision & Utility long-horizon score and Secret Tips badges",
  "God's Eye forensic checks, traps and X-Ray analysis",
  "Advanced ratios including PEG, EV/Revenue, EV/EBITDA and long-term debt/equity",
  "Target price, trim level, stop-loss and holding-plan research",
  "Research alerts and score-change monitoring",
  "Portfolio X-Ray, portfolio health, concentration and risk matrix",
] as const;

export const FEATURE_COMPARISON: PricingFeature[] = [
  { name: "Company search & exchange directory", free: "Full directory", pro: "Full directory", availability: "free" },
  { name: "Core company data & ratios", free: "Core ratios", pro: "Core + advanced", availability: "free" },
  { name: "Public news, calendars, guides & FAQs", free: true, pro: true, availability: "free" },
  { name: "Mutual funds, ETFs, REITs & commodities research", free: true, pro: true, availability: "free" },
  { name: "DeepChart interactive chart", free: "Chart & timeframes", pro: "Chart & timeframes", availability: "free" },
  { name: "DeepChart advanced reading", free: false, pro: "Verdict, playbook, indicators & levels", availability: "pro" },
  { name: "DeepChart trade plan", free: false, pro: "Entry, stop, targets, exits & sizing", availability: "pro" },
  { name: "13-factor DeepScreen score & verdict", free: false, pro: true, availability: "pro" },
  { name: "Advanced valuation ratios", free: false, pro: "PEG, EV/Revenue, EV/EBITDA, LT D/E", availability: "pro" },
  { name: "DCF & Graham valuation", free: false, pro: true, availability: "pro" },
  { name: "Vision, Secret Tips & forensic X-Ray", free: false, pro: true, availability: "pro" },
  { name: "Target / trim / stop holding plan", free: false, pro: true, availability: "pro" },
  { name: "Research alerts & score changes", free: false, pro: true, availability: "pro" },
  { name: "Options Strategy Lab analytics", free: "Inputs & education", pro: "12 payoff models + Greeks + POP", availability: "pro" },
  { name: "Portfolio X-Ray", free: false, pro: "Health, concentration & risk matrix", availability: "pro" },
] as const;
