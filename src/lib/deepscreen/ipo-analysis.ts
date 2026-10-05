import type { LiveIpo } from "@/lib/market/ipo.server";

export type IpoDemandTone = "strong" | "positive" | "neutral" | "weak" | "unknown";

export interface IpoResearchAnalysis {
  demandScore: number | null;
  demandLabel: string;
  demandTone: IpoDemandTone;
  dataCompleteness: number;
  confidence: "high" | "medium" | "low";
  positives: string[];
  watchItems: string[];
  summary: string;
}

function demandScore(multiple: number | null): number | null {
  if (multiple === null || !Number.isFinite(multiple) || multiple < 0) return null;
  if (multiple >= 50) return 100;
  if (multiple >= 25) return 94;
  if (multiple >= 10) return 86;
  if (multiple >= 5) return 76;
  if (multiple >= 2) return 64;
  if (multiple >= 1) return 52;
  if (multiple >= 0.5) return 36;
  return Math.max(5, Math.round(multiple * 50));
}

function demandView(multiple: number | null): {
  label: string;
  tone: IpoDemandTone;
} {
  if (multiple === null || !Number.isFinite(multiple)) {
    return { label: "Demand data unavailable", tone: "unknown" };
  }
  if (multiple >= 10) return { label: "Very strong subscription demand", tone: "strong" };
  if (multiple >= 5) return { label: "Strong subscription demand", tone: "strong" };
  if (multiple >= 2) return { label: "Healthy subscription demand", tone: "positive" };
  if (multiple >= 1) return { label: "Fully subscribed", tone: "positive" };
  if (multiple >= 0.5) return { label: "Partially subscribed", tone: "neutral" };
  return { label: "Low subscription so far", tone: "weak" };
}

function completeness(ipo: LiveIpo): number {
  const checks: boolean[] = [
    Boolean(ipo.name),
    Boolean(ipo.exchange),
    Boolean(ipo.source),
    ipo.bandLow !== null || ipo.bandHigh !== null,
    ipo.issueSize !== null,
    ipo.sharesOffered !== null,
    Boolean(
      ipo.openDate ||
        ipo.closeDate ||
        ipo.listingDate ||
        ipo.expectedPricingDate ||
        ipo.filingDate,
    ),
  ];

  if (ipo.exchange === "NSE" || ipo.exchange === "BSE") {
    checks.push(ipo.subscriptionMultiple !== null, ipo.lotSize !== null);
  }

  if (ipo.exchange === "LSE") {
    checks.push(ipo.primaryOfferSize !== null || ipo.secondaryOfferSize !== null);
  }

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function analyzeIpoResearch(ipo: LiveIpo): IpoResearchAnalysis {
  const positives: string[] = [];
  const watchItems: string[] = [];
  const demand = demandView(ipo.subscriptionMultiple);
  const score = demandScore(ipo.subscriptionMultiple);
  const dataCompleteness = completeness(ipo);

  if (ipo.subscriptionMultiple !== null) {
    positives.push(
      `Official reported subscription is ${ipo.subscriptionMultiple.toFixed(2)}x.`,
    );
    if (ipo.subscriptionMultiple < 1) {
      watchItems.push("The issue is not yet fully subscribed on the reported exchange feed.");
    }
  }

  if (ipo.bandLow !== null || ipo.bandHigh !== null) {
    positives.push("A price or price band is available from the primary IPO feed.");
  } else {
    watchItems.push("Price terms are not yet available from the source.");
  }

  if (ipo.issueSize !== null) {
    positives.push("Offer size is available or safely derivable from published offer terms.");
  } else {
    watchItems.push("Issue size is not available from the current source payload.");
  }

  if (ipo.segment === "sme") {
    watchItems.push(
      "SME/AIM issues can have thinner liquidity and larger post-listing price swings than larger main-market issues.",
    );
  }

  if (
    ipo.primaryOfferSize !== null &&
    ipo.secondaryOfferSize !== null &&
    ipo.primaryOfferSize > ipo.secondaryOfferSize
  ) {
    positives.push("Primary capital raise is larger than the reported secondary sell-down.");
  } else if (
    ipo.primaryOfferSize !== null &&
    ipo.secondaryOfferSize !== null &&
    ipo.secondaryOfferSize > ipo.primaryOfferSize
  ) {
    watchItems.push(
      "Reported secondary sell-down is larger than the primary capital raise; review use of proceeds and selling-holder details.",
    );
  }

  if (ipo.expectedPricingDate) {
    watchItems.push(
      "The US expected pricing date is an estimate based on filings, not a guaranteed exchange listing date.",
    );
  }

  if (ipo.exchange === "LSE" && ipo.listingDate) {
    watchItems.push(
      "The LSE date is an exchange-published expected first trading date and can still change.",
    );
  }

  if (!ipo.openDate && !ipo.closeDate && !ipo.listingDate && !ipo.expectedPricingDate) {
    watchItems.push("The source does not currently provide a usable transaction timeline.");
  }

  const confidence: IpoResearchAnalysis["confidence"] =
    dataCompleteness >= 80 ? "high" : dataCompleteness >= 55 ? "medium" : "low";

  const summaryParts = [demand.label];
  if (ipo.issueSize !== null) {
    summaryParts.push("offer size is known");
  }
  summaryParts.push(`${dataCompleteness}% of the core IPO research fields are populated`);

  return {
    demandScore: score,
    demandLabel: demand.label,
    demandTone: demand.tone,
    dataCompleteness,
    confidence,
    positives: positives.slice(0, 4),
    watchItems: watchItems.slice(0, 5),
    summary: `${summaryParts.join("; ")}. This is a research snapshot, not a listing-price prediction or apply/avoid recommendation.`,
  };
}
