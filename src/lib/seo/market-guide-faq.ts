export type MarketGuideTopic = "COMMODITIES" | "GIFT_NIFTY" | "IPO_GMP";

export type MarketGuideFaq = {
  id: string;
  topic: MarketGuideTopic;
  question: string;
  answer: string;
};

export const MARKET_GUIDE_FAQS: readonly MarketGuideFaq[] = [
  {
    id: "what-are-commodities",
    topic: "COMMODITIES",
    question: "What are commodities in financial markets?",
    answer: "Commodities are physical goods or raw materials that can be bought, sold or used as the underlying asset for derivatives. SEBI's investor material groups them broadly into agricultural and non-agricultural commodities such as bullion, metals and energy. Gold, silver, crude oil, natural gas and copper are common examples.",
  },
  {
    id: "spot-vs-futures",
    topic: "COMMODITIES",
    question: "What is the difference between a commodity spot price and a futures price?",
    answer: "A spot price refers to the market value for near-immediate delivery, while a futures price belongs to a standardized contract for a specified future expiry. The two can differ because of time to expiry, financing, storage, insurance, expected supply and demand, and local delivery conditions. Always identify the contract month and unit before comparing prices.",
  },
  {
    id: "india-vs-global-commodity",
    topic: "COMMODITIES",
    question: "Why can Indian commodity prices differ from global prices?",
    answer: "A global benchmark is only one input into an Indian price. Currency conversion, the rupee-dollar rate, freight, insurance, duties or taxes, local supply and demand, quality specifications, location and the contract being compared can all create a difference. A COMEX or WTI futures quote is therefore not the same thing as an Indian retail or MCX price.",
  },
  {
    id: "what-moves-gold",
    topic: "COMMODITIES",
    question: "What usually moves gold and silver prices?",
    answer: "Gold and silver are influenced by global supply and demand, currency moves, interest-rate expectations and investor demand for precious metals. Silver also has substantial industrial use, so manufacturing demand can matter more to silver than to gold. No single macro variable explains every move, especially over short periods.",
  },
  {
    id: "what-moves-energy",
    topic: "COMMODITIES",
    question: "What moves crude oil and natural gas prices?",
    answer: "Energy prices respond to supply and demand, inventories, production decisions, weather, transport constraints, geopolitical disruptions and economic activity. Natural gas can be especially regional because pipelines, storage and weather differ by market. WTI crude and Henry Hub gas are US benchmarks, not universal local prices.",
  },
  {
    id: "what-moves-copper",
    topic: "COMMODITIES",
    question: "Why is copper watched as an economic commodity?",
    answer: "Copper is heavily used in electrical equipment, construction and infrastructure, so demand can respond to industrial activity and investment. Mine supply, treatment capacity, inventories, substitution, recycling and currency also affect price. Copper can provide economic context, but it is not a standalone forecast for GDP or stocks.",
  },
  {
    id: "commodities-hedging",
    topic: "COMMODITIES",
    question: "Why do businesses use commodity futures?",
    answer: "SEBI describes commodity derivatives as tools for price discovery and price-risk management. A producer exposed to falling prices or a consumer exposed to rising input costs can use exchange-traded derivatives to reduce uncertainty. Hedging reduces a particular price exposure; it does not remove every business or market risk.",
  },
  {
    id: "commodity-risk",
    topic: "COMMODITIES",
    question: "Are commodity futures high risk?",
    answer: "Yes. Futures are leveraged, expire on fixed dates and can move sharply. Contract size, margin, expiry, settlement and delivery rules matter. A benchmark price page is useful for context, but anyone considering a trade should read the current exchange contract specification and understand the maximum loss they can tolerate.",
  },

  {
    id: "what-is-gift-nifty",
    topic: "GIFT_NIFTY",
    question: "What is GIFT Nifty?",
    answer: "GIFT Nifty is a Nifty-linked derivatives market on NSE International Exchange, or NSE IX, in GIFT City. The Nifty 50-linked contract is denominated and settled in US dollars. It trades for extended hours, so Indian market participants often watch it for overnight sentiment before the domestic cash market opens.",
  },
  {
    id: "gift-vs-nifty",
    topic: "GIFT_NIFTY",
    question: "Is GIFT Nifty the same as the Nifty 50 index?",
    answer: "No. Nifty 50 is the underlying Indian equity index, while GIFT Nifty is a derivative linked to that index. Futures have an expiry and can trade above or below the spot index because of carry, expected dividends, time to expiry and market positioning. Compare like with like before calculating an implied gap.",
  },
  {
    id: "gift-vs-sgx",
    topic: "GIFT_NIFTY",
    question: "Is GIFT Nifty the same as SGX Nifty?",
    answer: "GIFT Nifty is the successor to the offshore Nifty derivatives market historically associated with SGX Nifty. Under the NSE IFSC-SGX Connect, full-scale transition of the SGX Nifty derivatives business to NSE IX in GIFT City took place on 3 July 2023.",
  },
  {
    id: "gift-hours",
    topic: "GIFT_NIFTY",
    question: "What are GIFT Nifty trading hours?",
    answer: "NSE IX's Connect FAQ states that market timings run from 06:30 a.m. to 02:45 a.m. the next day in Indian Standard Time, with product-specific timing details published by the exchange. Session structures and holidays can change, so current timings should be checked on NSE IX rather than copied from an old article.",
  },
  {
    id: "gift-opening",
    topic: "GIFT_NIFTY",
    question: "Does GIFT Nifty predict the Nifty 50 opening?",
    answer: "It can indicate overnight market expectations, but it does not determine or guarantee the Nifty 50 opening. The futures basis, contract expiry, new global news and domestic pre-open orders can all change the relationship. Treat GIFT Nifty as a sentiment input, not as an exact opening-price forecast.",
  },
  {
    id: "gift-gap",
    topic: "GIFT_NIFTY",
    question: "How should I calculate a GIFT Nifty opening indication?",
    answer: "First compare the current GIFT Nifty contract with a compatible Nifty reference, preferably after checking the futures basis and expiry. Do not simply subtract yesterday's Nifty 50 spot close and call the difference a guaranteed opening gap. The contract month, timestamp and overnight basis all matter.",
  },
  {
    id: "gift-drivers",
    topic: "GIFT_NIFTY",
    question: "What can move GIFT Nifty overnight?",
    answer: "Global equity moves, interest-rate expectations, currency moves, geopolitical events and news affecting large Indian companies or sectors can all change Nifty-linked futures expectations. The relevant driver can change from one session to another, which is why the latest timestamp and news context matter.",
  },
  {
    id: "gift-current-price",
    topic: "GIFT_NIFTY",
    question: "Where should I check the official GIFT Nifty price and contract details?",
    answer: "Use NSE IX for current exchange information, contract specifications, trading hours and market data. DeepScreen does not replace an exchange-verified GIFT Nifty contract with a domestic Nifty quote or a different futures series just to fill a live-price box.",
  },

  {
    id: "what-is-ipo-gmp",
    topic: "IPO_GMP",
    question: "What is IPO GMP?",
    answer: "IPO GMP means grey market premium. It is an unofficial, off-exchange indication of the premium or discount at which some market participants discuss an IPO before the shares list. GMP is not the IPO issue price, not an exchange quote and not a guaranteed listing gain.",
  },
  {
    id: "gmp-formula",
    topic: "IPO_GMP",
    question: "How is IPO GMP calculated?",
    answer: "A simple arithmetic convention is: indicative grey-market price = issue price + quoted GMP. GMP percentage = quoted GMP divided by issue price, multiplied by 100. For example, a ₹500 issue price with a ₹50 quoted GMP implies ₹550 and a 10% premium. The arithmetic is exact; the market outcome is not.",
  },
  {
    id: "negative-gmp",
    topic: "IPO_GMP",
    question: "Can IPO GMP be negative?",
    answer: "Yes. A negative quoted GMP means the informal grey-market indication is below the IPO issue price. That can reflect weak sentiment, changing market conditions or limited demand, but it still does not establish the eventual exchange listing price.",
  },
  {
    id: "gmp-official",
    topic: "IPO_GMP",
    question: "Is IPO GMP official NSE, BSE or SEBI data?",
    answer: "No. Official IPO information comes from the issuer's offer documents, SEBI filings and exchange public-issue pages. GMP is not an official NSE, BSE or SEBI price series, and there is no exchange order book that consolidates a single authoritative GMP quote.",
  },
  {
    id: "gmp-reliable",
    topic: "IPO_GMP",
    question: "Is IPO GMP a reliable predictor of listing price?",
    answer: "No. GMP can reflect sentiment, but the actual listing price is formed in the regulated market and can differ materially. Broader market moves, final demand, valuation, issue structure and new information can change between the grey-market quote and listing. Treat GMP as context, not a target price.",
  },
  {
    id: "gmp-vs-subscription",
    topic: "IPO_GMP",
    question: "Is GMP the same as IPO subscription status?",
    answer: "No. Subscription status is an official measure of bids received in the IPO and can be checked through exchange or issue sources. GMP is an unofficial price indication outside the exchange. A heavily subscribed IPO can still list poorly, and a high GMP does not prove the business is attractively valued.",
  },
  {
    id: "gmp-research",
    topic: "IPO_GMP",
    question: "What should I check instead of relying on IPO GMP?",
    answer: "Read the RHP or prospectus, understand the business and risk factors, separate fresh issue from offer for sale, check how proceeds will be used, compare valuation with relevant peers, inspect debt and cash flow, and verify official subscription and issue terms. SEBI investor education explicitly warns against letting IPO or listing-day hype drive the decision.",
  },
  {
    id: "gmp-deepscreen",
    topic: "IPO_GMP",
    question: "Why does DeepScreen not publish a scraped live IPO GMP feed?",
    answer: "Because there is no official consolidated GMP feed to verify against an exchange order book. DeepScreen provides the calculation framework and explains the limitations, while keeping official IPO terms and offer-document research separate from an unofficial sentiment number.",
  },
] as const;

export const MARKET_GUIDE_SOURCES: Record<MarketGuideTopic, readonly { label: string; href: string }[]> = {
  COMMODITIES: [
    { label: "SEBI — FAQs on Commodity Derivatives", href: "https://www.sebi.gov.in/sebi_data/faqfiles/feb-2024/1706788568782.pdf" },
    { label: "SEBI Investor — commodity derivatives learning material", href: "https://investor.sebi.gov.in/iematerial.html" },
    { label: "SEBI Investor — Financial Education Booklet", href: "https://investor.sebi.gov.in/pdf/downloadable-documents/Financial%20Education%20Booklet%20-%20English.pdf" },
  ],
  GIFT_NIFTY: [
    { label: "NSE IX — Connect FAQ", href: "https://www.nseix.com/nseixcms/sites/default/files/2024-04/FAQs%20on%20NSE%20IX%20for%20Connect.pdf" },
    { label: "NSE IX — official website", href: "https://www.nseix.com/" },
    { label: "NSE IX — trading hours", href: "https://www.nseix.com/markets/trading/tradinghours" },
  ],
  IPO_GMP: [
    { label: "SEBI Investor — IPO education material", href: "https://investor.sebi.gov.in/iematerial.html" },
    { label: "SEBI Investor — book-building process", href: "https://investor.sebi.gov.in/book_building.html" },
    { label: "NSE — public offer documents", href: "https://www.nseindia.com/static/products-services/public-offer-documents" },
    { label: "NSE — investor education", href: "https://www.nseindia.com/static/invest/how-to-invest-in-capital-market" },
  ],
} as const;

export function marketGuideFaq(topic: MarketGuideTopic): MarketGuideFaq[] {
  return MARKET_GUIDE_FAQS.filter((faq) => faq.topic === topic);
}
