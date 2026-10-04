import { INVESTMENTS, type InvestmentType } from "./investments";
export function featuredInvestment(type: InvestmentType) {
  return (
    INVESTMENTS.find(
      (i) =>
        i.type === type &&
        i.code === (type === "ETF" ? "SPY" : type === "FUND" ? "120503" : "EMBASSY"),
    ) ?? INVESTMENTS.find((i) => i.type === type)!
  );
}
