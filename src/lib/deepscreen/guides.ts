/** Long-form answer pages (AEO/GEO): each guide renders at /learn/$slug. */

export type GuideSection = { heading: string; body: string[] };
export type GuideFaq = { q: string; a: string };

export type Guide = {
  slug: string;
  title: string;
  h1: string;
  description: string;
  updated: string;
  topics: string[];
  /** keyword group ids from src/lib/seo/keywords.ts to surface at the bottom */
  groups: string[];
  answer: string;
  sections: GuideSection[];
  faqs: GuideFaq[];
  /** Original, methodology-led research content maintained as a first-party DeepScreen resource. */
  originalResearch?: boolean;
};

export const GUIDES: Guide[] = [
  {
    slug: "what-is-a-stock-screener",
    title: "What Is a Stock Screener and How Do You Use One?",
    h1: "What is a stock screener?",
    description:
      "A stock screener filters thousands of listed companies down to the handful that match your rules. Learn the filters that matter and how to build your first screen.",
    updated: "2026-09-11",
    topics: ["stock screener", "screening filters", "value screens", "growth screens"],
    groups: ["screener", "stocks"],
    answer:
      "A stock screener is a search tool that filters every listed company on an exchange by numeric and text criteria — market cap, P/E, revenue growth, dividend yield, sector, price change — so you only look at the names that already fit your strategy.",
    sections: [
      {
        heading: "Why screening beats scrolling",
        body: [
          "NSE and BSE together list several thousand companies; NYSE and Nasdaq add thousands more. Reading them one by one is not a strategy. A screener inverts the problem: you describe the company you want, and the market hands you the shortlist.",
          "The output of a screen is never a buy list. It is a research queue — usually 10 to 40 names — that is small enough to actually read annual reports for.",
        ],
      },
      {
        heading: "The filters that do most of the work",
        body: [
          "Market capitalisation sets the risk band. Large caps move slower and are better covered; small caps swing harder and are where mispricing usually hides.",
          "Valuation filters (P/E, P/B, EV/EBITDA) tell you what the market is already paying for the earnings. Treat EV/EBITDA as usable only when EBITDA and enterprise value support a positive multiple. Quality filters (return on equity, debt-to-equity, interest coverage) tell you whether those earnings are durable.",
          "Growth filters (revenue and profit CAGR over three to five years) separate a cheap compounder from a cheap melting ice cube. Liquidity filters (average traded volume) stop you from finding a great business you cannot exit.",
        ],
      },
      {
        heading: "Building your first screen",
        body: [
          "Start deliberately loose: market cap above a floor you are comfortable with, debt-to-equity under 1, positive five-year profit growth, and return on equity above 15%. That single combination removes the vast majority of the market.",
          "Then tighten one filter at a time and watch the count. If a change wipes out the whole list, the rule was an opinion rather than a filter.",
          "Save the screen and re-run it monthly. Names entering and leaving the list are a signal in themselves.",
        ],
      },
      {
        heading: "Common mistakes",
        body: [
          "Over-filtering to five perfect names is curve fitting. Screening on a single ratio — cheapest P/E in the market — reliably surfaces companies that are cheap for a reason.",
          "Screens are backward looking. Every number in them describes what already happened; your judgement supplies the forward view.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is a stock screener free?",
        a: "DeepScreen's screener is free to use across NSE, BSE, NYSE, Nasdaq and LSE, with paid plans for advanced tooling and saved portfolios.",
      },
      {
        q: "How many stocks should a good screen return?",
        a: "Aim for 10 to 40 names. Fewer suggests the filters are over-fitted; many hundreds means you have not filtered at all.",
      },
      {
        q: "Can a screener predict which stocks will go up?",
        a: "No. A screener sorts historical and current fundamentals. It narrows where you spend research time; it does not forecast prices.",
      },
    ],
  },
  {
    slug: "nse-vs-bse",
    title: "NSE vs BSE: A Complete Research Guide to India’s Two Stock Exchanges",
    h1: "NSE vs BSE — a complete research guide",
    description:
      "A practical, source-led guide to comparing NSE and BSE: listings, liquidity, price formation, indices, derivatives, execution and the research questions that actually matter.",
    updated: "2026-09-19",
    topics: ["NSE", "BSE", "Nifty 50", "Sensex", "liquidity", "stock exchange research"],
    groups: ["india", "stocks", "learn"],
    originalResearch: true,
    answer:
      "NSE and BSE are both Indian stock exchanges, but a research comparison should focus on the specific security, trading segment, liquidity, order-book conditions, index exposure and available market data rather than assuming one venue is universally preferable. The same company can be listed on both while the two order books remain separate.",
    sections: [
      {
        heading: "1. Start with the security, not the exchange",
        body: [
          "For a dual-listed Indian company, first confirm the ISIN and whether the security is actually available on both venues. Then compare the live quote, displayed depth, recent traded volume and the exact order type you intend to use.",
          "Do not treat the NSE symbol and BSE scrip code as different businesses. They are exchange identifiers for the same listed issuer when the security is dual-listed; corporate disclosures and the underlying ownership remain company-level facts.",
        ],
      },
      {
        heading: "2. Compare liquidity and execution",
        body: [
          "Liquidity is about how much you can buy or sell without moving the price materially. For research, inspect traded value, frequency of trades, quoted spread and available depth rather than using the exchange label as a shortcut.",
          "For a large order, compare the actual bid-ask spread and depth at the time you trade. A venue can have a credible market overall while a particular small-cap security remains thinly traded there.",
        ],
      },
      {
        heading: "3. Understand the indices and market segments",
        body: [
          "NSE operates the Nifty family of indices and has extensive equity-derivatives activity. BSE operates the Sensex and a broad range of equity, debt and derivatives markets. The exact products and eligible securities can change, so use the exchanges’ current product pages when researching a specific segment.",
          "Index membership is an analytical input, not a quality stamp. When a company enters or leaves an index, separate the mechanical portfolio-flow effect from any change in the underlying business.",
        ],
      },
      {
        heading: "4. Why quotes can differ",
        body: [
          "The two venues maintain separate order books. At any instant, buyers and sellers can be distributed differently, so the best bid, best ask and last traded price can differ slightly even for the same issuer.",
          "Arbitrage activity can reduce persistent price differences, but that does not mean a trader should assume an executable cross-exchange opportunity. Check transaction costs, liquidity, settlement mechanics and broker rules.",
        ],
      },
      {
        heading: "5. A DeepScreen NSE-vs-BSE research workflow",
        body: [
          "Record the issuer, ISIN, exchange identifiers, latest price, spread, traded value and the time of observation. Then check the same company’s corporate actions, financial disclosures and shareholding information independently of the venue.",
          "For derivatives or index research, verify the current eligible contracts directly from the relevant exchange. For ownership and promoter disclosures, use the company’s exchange filings and SEBI-required disclosure formats rather than relying on third-party summaries.",
          "The research conclusion should be security-specific: what differs in execution, liquidity, product availability or data coverage for the exact instrument you are studying? That is more useful than a generic claim that one exchange is always better.",
        ],
      },
    ],
    faqs: [
      {
        q: "Are NSE and BSE the same company?",
        a: "No. NSE and BSE are separate stock exchanges. A listed issuer may have securities traded on both, but the venues maintain separate trading systems and order books.",
      },
      {
        q: "Why can the same stock have different prices on NSE and BSE?",
        a: "Each venue has its own buyers and sellers, so displayed bids, asks and last traded prices can differ temporarily.",
      },
      {
        q: "Which exchange should I use for a dual-listed stock?",
        a: "Compare the actual security-level spread, depth, traded value, order type, broker costs and product availability at the time of the intended transaction. The answer is instrument- and execution-specific.",
      },
      {
        q: "Where should I verify promoter or shareholding information?",
        a: "Use the issuer’s exchange filings and the applicable SEBI disclosure format. For Indian listed companies, the exchange-distributed shareholding pattern is the primary place to check current ownership and encumbrance disclosures.",
      },
    ],
  },
  {
    slug: "how-to-read-candlestick-charts",
    title: "How to Read Candlestick Charts: Bodies, Wicks and Key Patterns",
    h1: "How to read candlestick charts",
    description:
      "Every candle shows open, high, low and close. Learn to read bodies, wicks and the handful of patterns that actually carry information.",
    updated: "2026-09-11",
    topics: ["candlestick charts", "technical analysis", "chart patterns"],
    groups: ["learn", "stocks"],
    answer:
      "Each candlestick summarises one time period with four prices: the body spans the open and close, and the thin wicks mark the high and low. A filled or red body means the close was below the open; hollow or green means it closed higher.",
    sections: [
      {
        heading: "Anatomy of a candle",
        body: [
          "The body is the battleground between buyers and sellers that was actually resolved. A long body means one side dominated the whole period; a tiny body means the period ended roughly where it started.",
          "Wicks record rejected prices. A long upper wick says buyers pushed higher and were forced back; a long lower wick says sellers tried and failed.",
        ],
      },
      {
        heading: "Patterns worth knowing",
        body: [
          "Doji: open and close nearly equal, signalling indecision. Meaningful only after an extended move.",
          "Hammer and shooting star: small body with a long wick on one side, showing a failed push. A hammer after a downtrend and a shooting star after an uptrend are the classic reversal hints.",
          "Engulfing: a candle whose body completely covers the previous one, indicating the balance of control flipped within a single period.",
        ],
      },
      {
        heading: "Context and volume",
        body: [
          "A pattern in the middle of a range is noise. The same pattern at a prior support level, a moving average, or after a long trend is worth attention.",
          "Confirm with volume. A reversal candle on below-average volume is a suggestion; the same candle on twice-average volume is a statement.",
        ],
      },
      {
        heading: "Timeframes",
        body: [
          "Daily candles suit swing trading and investing. Five- and fifteen-minute candles suit intraday work and carry far more false signals.",
          "Whatever the timeframe, check the daily and weekly chart first so you are not trading against the larger trend.",
        ],
      },
    ],
    faqs: [
      {
        q: "What do green and red candles mean?",
        a: "Green (or hollow) means the close was above the open for that period; red (or filled) means it closed below.",      },
      {
        q: "Which candlestick pattern is most reliable?",
        a: "No pattern is reliable in isolation. Engulfing candles and hammers at established support or resistance, confirmed by high volume, have the best track record.",
      },
      {
        q: "Do candlestick charts work for Indian stocks?",
        a: "Yes. Candlesticks describe order flow and apply to NSE, BSE, NYSE, Nasdaq and LSE alike.",
      },
    ],
  },
  {
    slug: "pe-ratio-explained",
    title: "P/E Ratio Explained: What It Measures and When It Misleads",
    h1: "P/E ratio explained",
    description:
      "The price-to-earnings ratio tells you what the market pays per rupee of profit. Learn trailing vs forward P/E, sector norms, and when the ratio breaks.",
    updated: "2026-09-11",
    topics: ["P/E ratio", "valuation", "fundamental analysis"],
    groups: ["learn", "screener"],
    answer:
      "The P/E ratio is share price divided by earnings per share. A P/E of 25 means investors pay 25 for every 1 of annual profit — a rough measure of how much future growth is already priced in.",
    sections: [
      {
        heading: "Trailing vs forward P/E",
        body: [
          "Trailing P/E uses the last twelve months of reported earnings: factual but backward looking. Forward P/E uses analyst estimates for the coming year: relevant but only as good as the forecast.",
          "A large gap between the two usually means earnings are expected to move sharply. Find out why before treating the lower number as the real one.",
        ],
      },
      {
        heading: "What counts as high or low",
        body: [
          "P/E is meaningful only against a peer group. Utilities and banks trade at structurally low multiples; software and consumer brands at high ones. Comparing a bank's P/E to a SaaS company's tells you nothing.",
          "Compare a company to its own five-year range and to its closest listed competitors. That is where the ratio earns its keep.",
        ],
      },
      {
        heading: "When P/E breaks",
        body: [
          "Loss-making companies have no meaningful P/E. Cyclical businesses look cheapest at the top of the cycle, when peak earnings deflate the denominator, and expensive at the bottom.",
          "One-off gains — an asset sale, a tax writeback — can halve a P/E for a year. Always check whether earnings came from operations.",
        ],
      },
      {
        heading: "Better used with other ratios",
        body: [
          "Pair P/E with return on equity and debt levels. A low P/E with high ROE and low debt is interesting; a low P/E with falling ROE and rising debt is a value trap.",
          "The PEG ratio divides P/E by the earnings growth rate, giving a rough sense of whether a high multiple is justified.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is a good P/E ratio?",
        a: "There is no universal number. Judge it against the company's own history and its sector peers.",
      },
      {
        q: "Is a low P/E always better?",
        a: "No. Low multiples often reflect declining earnings, high debt or governance concerns — the classic value trap.",
      },
      {
        q: "How do I calculate P/E?",
        a: "Divide the current share price by earnings per share over the last twelve months.",
      },
    ],
  },
  {
    slug: "how-to-apply-for-an-ipo-in-india",
    title: "How to Apply for an IPO in India: ASBA, UPI and Allotment",
    h1: "How to apply for an IPO in India",
    description:
      "Step-by-step: what you need before applying, how the UPI and ASBA routes work, how lots and the price band are set, and how allotment is decided.",
    updated: "2026-09-11",
    topics: ["IPO", "ASBA", "UPI mandate", "allotment", "grey market"],
    groups: ["ipo", "india"],
    answer:
      "To apply for an Indian IPO you need a PAN, a demat account and a bank account. Place the bid through your broker or net banking during the issue window, approve the UPI or ASBA mandate that blocks the money in your account, and wait for allotment — funds are only debited if shares are allotted.",
    sections: [
      {
        heading: "Before you apply",
        body: [
          "You need an active demat and trading account, a PAN linked to it, and a bank account in your own name. Applications through someone else's account are rejected.",
          "Read the red herring prospectus, at minimum the risk factors, the objects of the issue, and whether the offer is a fresh issue or an offer for sale by existing shareholders.",
        ],
      },
      {
        heading: "The application itself",
        body: [
          "Retail investors bid in lots. A lot is the minimum number of shares; the price band sets the range you can bid in, and bidding at the cut-off price means you accept the final discovered price.",
          "Retail applications are capped at ₹2 lakh. Above that you are bidding in the HNI category, which has a different allotment mechanism.",
          "Approve the mandate in your UPI app before the deadline, usually 5 pm on the closing day. An unapproved mandate is an invalid application.",
        ],
      },
      {
        heading: "How allotment works",
        body: [
          "If the retail portion is undersubscribed, everyone gets a full allotment. If it is oversubscribed, allotment is by lottery — one lot per successful applicant.",
          "Applying for more lots does not improve your odds in the retail lottery. Multiple applications from the same PAN are rejected outright.",
        ],
      },
      {
        heading: "Listing day",
        body: [
          "Shares are credited to your demat before listing and can be sold from the opening bell. Grey market premium is an unregulated, unreliable indicator and is not a forecast of listing price.",
          "If you are not allotted, the blocked amount is released within a day or two of the basis of allotment being finalised.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I apply for an IPO without a demat account?",
        a: "No. Shares are credited electronically, so an active demat account is mandatory.",
      },
      {
        q: "Does applying for more lots increase allotment chances?",
        a: "Not in the retail category of an oversubscribed IPO — allotment is a per-application lottery of one lot each.",
      },
      {
        q: "When is money debited for an IPO?",
        a: "Never at application. The amount is blocked in your bank account and debited only if shares are allotted.",
      },
    ],
  },
  {
    slug: "options-trading-basics",
    title: "Options Trading Basics: Calls, Puts, Premium and Expiry",
    h1: "Options trading basics",
    description:
      "Understand calls, puts, strike prices, premium, expiry and the Greeks — plus why most retail option buyers lose money.",
    updated: "2026-09-11",
    topics: ["options", "calls and puts", "option chain", "implied volatility"],
    groups: ["options", "learn"],
    answer:
      "An option is a contract giving the right, not the obligation, to buy (call) or sell (put) an underlying at a fixed strike price before expiry. Buyers pay a premium and risk only that premium; sellers collect it and take on far larger risk.",
    sections: [
      {
        heading: "Calls and puts",
        body: [
          "A call gains value when the underlying rises above the strike; a put gains when it falls below. Both expire worthless if the move never happens.",
          "Every contract has a buyer and a seller. Sellers (writers) receive the premium up front and must post margin, because their loss is theoretically unlimited on a call.",
        ],
      },
      {
        heading: "What you actually pay for",
        body: [
          "Premium splits into intrinsic value — how far the option is already in the money — and time value, which decays to zero at expiry.",
          "Time decay accelerates in the final week. Buying weekly options and holding them is a bet against the clock as well as against the market.",
        ],
      },
      {
        heading: "Implied volatility",
        body: [
          "Implied volatility is the market's expectation of future movement, baked into the premium. High IV makes options expensive; a volatility crush after an event can lose you money even when the direction was right.",
          "Around earnings and policy announcements, IV inflates beforehand and collapses immediately after. Plan for that, not around it.",
        ],
      },
      {
        heading: "The Greeks in one line each",
        body: [
          "Delta: how much the option moves per unit move in the underlying. Gamma: how fast delta changes. Theta: daily time decay. Vega: sensitivity to implied volatility.",
          "You do not need to compute them, but you should know which one is working against you in any position you hold.",
        ],
      },
      {
        heading: "Risk",
        body: [
          "Options are leveraged instruments. Position sizing, not prediction, is what keeps an account alive. Never risk on a single trade an amount you cannot lose entirely — for a buyer, total loss is the ordinary outcome, not the tail case.",
        ],
      },
    ],
    faqs: [
      {
        q: "Are options riskier than stocks?",
        a: "Yes. Leverage and expiry mean an option can go to zero while the underlying stock barely moves. Selling options carries larger risk still.",
      },
      {
        q: "What is an option chain?",
        a: "A table of all available strikes for an expiry, showing premium, volume and open interest for both calls and puts.",
      },      {
        q: "Can I trade options with a small account?",
        a: "Technically yes, but lot sizes and margin requirements — especially for selling — mean small accounts are usually forced into the riskiest strategies.",
      },
    ],
  },
  {
    slug: "dividend-investing-guide",
    title: "Dividend Investing: Yield, Payout Ratio and Ex-Dividend Dates",
    h1: "A practical guide to dividend investing",
    description:
      "How dividend yield, payout ratio and dividend cover work, what the ex-dividend date means for your order, and how to spot an unsustainable payout.",
    updated: "2026-09-11",
    topics: ["dividends", "dividend yield", "ex-dividend date", "income investing"],
    groups: ["calendar", "learn"],
    answer:
      "Dividend yield is annual dividend per share divided by the share price. A sustainable dividend is covered comfortably by free cash flow; a very high yield usually signals a falling share price rather than a generous company.",
    sections: [
      {
        heading: "Yield is a fraction — watch the denominator",
        body: [
          "Yield rises when the dividend rises or when the price falls. The second is far more common among the highest-yielding names on any screen.",
          "Before buying a 9% yield, check the twelve-month price chart. If the yield doubled because the stock halved, the market is pricing in a cut.",
        ],
      },
      {
        heading: "Payout ratio and cover",
        body: [
          "Payout ratio is dividends divided by earnings. Below roughly 60% leaves room for reinvestment and bad years; above 100% means the company is paying out more than it earns.",
          "Better still, compare dividends against free cash flow. Earnings can be accounting; cash cannot.",
        ],
      },
      {
        heading: "Key dates",
        body: [
          "The ex-dividend date is the one that matters: buy on or after it and you do not receive the declared dividend. The record date confirms the register; the payment date is when money arrives.",
          "The price typically drops by roughly the dividend amount on the ex-date. Buying just to capture a dividend is not free money.",
        ],
      },
      {
        heading: "Building an income portfolio",
        body: [
          "Prioritise a growing dividend over a large one. A company raising its payout for a decade tells you more than one offering a high yield today.",
          "Spread across sectors. Concentrating in a single high-yield sector means one regulatory change can cut your entire income stream at once.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is a good dividend yield?",
        a: "Typically 2–5% for a stable business. Much above that deserves scrutiny of why the price is depressed.",
      },
      {
        q: "Do I get the dividend if I buy on the ex-dividend date?",
        a: "No. You must own the shares before the ex-dividend date.",
      },
      {
        q: "Are dividends taxed?",
        a: "Tax treatment varies by country and by investor. In India dividends are taxable in the hands of the shareholder; check current rules or a tax adviser for your situation.",
      },
    ],
  },
  {
    slug: "how-to-build-a-diversified-portfolio",
    title: "How to Build a Diversified Portfolio: Allocation, Sizing, Rebalancing",
    h1: "How to build a diversified portfolio",
    description:
      "Asset allocation, how many stocks you actually need, position sizing rules, correlation traps and a simple rebalancing schedule.",
    updated: "2026-09-11",
    topics: ["portfolio", "diversification", "asset allocation", "rebalancing"],
    groups: ["portfolio", "learn"],
    answer:
      "Diversification means owning assets that do not fall for the same reason at the same time. In practice: 15–30 stocks across at least five unrelated sectors, no single position dominating, plus exposure outside your home market — reviewed and rebalanced on a fixed schedule.",
    sections: [
      {
        heading: "Start with allocation, not stock picks",
        body: [
          "Decide the split between equity, debt and cash before choosing any company. That single decision drives most of your long-run outcome and all of your ability to sleep during a drawdown.",
          "Your horizon sets the split. Money needed within three years does not belong in equities.",
        ],
      },
      {
        heading: "How many stocks",
        body: [
          "Most of the benefit of diversification arrives by around 20 holdings. Beyond 40, you own an expensive index fund and cannot track any of it properly.",
          "Fewer than 10 concentrated positions is a legitimate strategy, but only if you genuinely know each business.",
        ],
      },
      {
        heading: "Correlation, the hidden trap",
        body: [
          "Owning ten stocks that all depend on the same interest-rate cycle is one bet written ten ways. Check what actually drives each holding's revenue.",
          "Spread across sectors, and where possible across currencies and geographies — the NSE, Nasdaq and LSE do not move in lockstep.",
        ],
      },
      {
        heading: "Sizing and rebalancing",
        body: [
          "A common rule is to cap any single position at 5–10% of the portfolio at purchase, and any sector at around 25%.",
          "Rebalance on a schedule — annually, or when a position drifts more than a set percentage from target. Scheduled rebalancing forces you to trim winners and add to laggards, which is exactly what emotion resists.",
        ],
      },
    ],
    faqs: [
      {
        q: "How many stocks should a beginner own?",
        a: "Around 15 to 25 across several unrelated sectors, or a broad index fund plus a handful of individual convictions.",
      },
      {
        q: "How often should I rebalance?",
        a: "Once or twice a year is enough for most investors. More frequent rebalancing adds costs without adding much benefit.",
      },
      {
        q: "Does diversification prevent losses?",
        a: "No. It reduces the impact of any single failure, but in a broad market decline most holdings fall together.",
      },
    ],
  },
  {
    slug: "market-cap-explained",
    title: "Market Cap Explained: Large, Mid and Small Cap Investing",
    h1: "Market capitalisation explained",
    description:
      "What market cap measures, how large, mid and small caps differ in risk and return, and why market cap is not the same as company value.",
    updated: "2026-09-11",
    topics: ["market cap", "large cap", "mid cap", "small cap"],
    groups: ["learn", "screener"],
    answer:
      "Market capitalisation is share price multiplied by the number of shares outstanding — the market's price tag for the entire equity of a company. It sets the risk band of a stock far more reliably than the share price does.",
    sections: [
      {
        heading: "Price per share tells you nothing",
        body: [
          "A ₹50 stock is not cheaper than a ₹5,000 stock. Share price depends on how many shares exist; only market cap describes the size of the business.",
          "This is the single most common beginner error, and screening by market cap rather than price fixes it immediately.",
        ],
      },
      {
        heading: "The three bands",
        body: [
          "Large caps are established, widely covered, and move with the index. Expect steadier returns, better liquidity and fewer surprises.",
          "Mid caps sit between proven and growing — historically the band with the best risk-adjusted returns over long periods, and real volatility along the way.",
          "Small caps offer the largest potential and the largest chance of permanent loss. Coverage is thin, liquidity dries up in downturns, and governance risk is highest.",
        ],
      },
      {
        heading: "Enterprise value: the fuller picture",
        body: [
          "Market cap ignores the balance sheet. Enterprise value adds net debt, which is why two companies with identical market caps can be valued very differently by an acquirer.",
          "For leveraged businesses, EV/EBITDA can complement P/E when EBITDA is positive and consistently defined; a negative or zero multiple is not a cheap signal and should be shown as N/M while EBITDA and enterprise value are reviewed separately.",
        ],
      },
      {
        heading: "Using market cap in a screen",
        body: [
          "Set a floor that matches your risk tolerance and your ability to exit. Very small companies can be impossible to sell in size on a bad day.",
          "Mixing bands deliberately — a large-cap core with a small mid and small-cap satellite — is a simpler risk control than trying to time between them.",
        ],
      },
    ],
    faqs: [
      {
        q: "How is market cap calculated?",
        a: "Current share price multiplied by total shares outstanding.",
      },
      {
        q: "Are small-cap stocks better than large caps?",
        a: "They have higher potential returns and materially higher risk, including illiquidity and governance issues. Neither band is universally better.",
      },
      {
        q: "What is free-float market cap?",
        a: "Market cap counting only shares available for public trading, excluding promoter and locked-in holdings. Most indices, including the Sensex and Nifty 50, use it.",
      },
    ],
  },
  {
    slug: "rsi-and-moving-averages",
    title: "RSI and Moving Averages: How to Use Them Without Fooling Yourself",
    h1: "RSI and moving averages explained",
    description:      "How the relative strength index and simple/exponential moving averages are built, what crossovers actually mean, and where both indicators fail.",
    updated: "2026-09-11",
    topics: ["RSI", "moving average", "golden cross", "technical indicators"],
    groups: ["learn", "stocks"],
    answer:
      "RSI measures the speed of recent gains against recent losses on a 0–100 scale, with readings above 70 called overbought and below 30 oversold. Moving averages smooth price into a trend line; crossovers between a short and long average are used to flag trend changes.",
    sections: [
      {
        heading: "How RSI is built",
        body: [
          "The standard 14-period RSI compares average gains to average losses over the last 14 bars. It is a momentum gauge, not a valuation measure.",
          "Overbought does not mean sell. In a strong uptrend RSI can sit above 70 for weeks, and shorting it is a well-known way to lose money.",
        ],
      },
      {
        heading: "Divergence",
        body: [
          "The more useful RSI signal is divergence: price makes a new high while RSI does not, suggesting the move is running on fumes.",
          "Divergence is early and often wrong on its own. Treat it as a reason to tighten risk, not as an entry.",
        ],
      },
      {
        heading: "Simple vs exponential moving averages",
        body: [
          "An SMA weights every period equally; an EMA weights recent periods more, so it turns faster and whipsaws more.",
          "The 50-day and 200-day averages are watched widely enough to become self-fulfilling support and resistance in large caps.",
        ],
      },
      {
        heading: "Crossovers and their limits",
        body: [
          "A golden cross (50-day crossing above the 200-day) and a death cross (the reverse) are lagging by construction — they confirm a trend that already happened.",
          "In sideways markets, moving-average systems generate a stream of losing signals. Every indicator built on trend fails when there is no trend.",
        ],
      },
    ],
    faqs: [
      {
        q: "What RSI level means buy?",
        a: "No level is a buy signal by itself. Below 30 indicates strong recent selling, which may continue.",
      },
      {
        q: "Which moving average is best?",
        a: "The 50-day and 200-day are the most widely watched. Shorter averages react faster but produce more false signals.",
      },
      {
        q: "Do technical indicators work?",
        a: "They describe momentum and trend, not the future. They work best as risk-management tools alongside fundamental analysis.",
      },
    ],
  },
{
    slug: "how-to-analyze-an-indian-stock-in-15-minutes",
    title: "How to Analyse an Indian Stock in 15 Minutes: The DeepScreen Triage Framework",
    h1: "How to analyse an Indian stock in 15 minutes",
    description:
      "A repeatable 15-minute triage for Indian stocks: business model, financial health, cash flow, valuation, ownership, peers and red flags before deeper due diligence.",
    updated: "2026-09-19",
    topics: ["Indian stock analysis", "15 minute stock analysis", "fundamental analysis", "research checklist"],
    groups: ["india", "stocks", "learn"],
    originalResearch: true,
    answer:
      "A 15-minute stock review should not try to predict the future. Its job is to decide whether a company deserves a deeper read of its annual report, exchange filings and historical financials. DeepScreen’s triage framework moves from business quality to balance sheet, cash flow, valuation, ownership and close peers in a fixed order.",
    sections: [
      {
        heading: "Minute 0–2: Explain the business in one sentence",
        body: [
          "Write a plain-English sentence covering what the company sells, who pays it, and what drives demand. Then identify the primary revenue segments and whether the business is cyclical, regulated, capital intensive or dependent on a small number of customers.",
          "A useful test is whether you can explain the revenue engine without using the stock price. If the description is mostly about recent share performance, restart the analysis.",
        ],
      },
      {
        heading: "Minute 2–5: Check the income statement and returns on capital",
        body: [
          "Look at a multi-year revenue and profit series rather than a single quarter. Ask whether growth is organic, whether margins are stable, and whether returns on equity or capital remain durable when conditions change.",
          "Separate operating performance from accounting noise. One-off gains, unusual tax items, asset sales or acquisition effects can make the latest earnings look stronger or weaker than the recurring business.",
        ],
      },
      {
        heading: "Minute 5–8: Follow the cash",
        body: [
          "Start with operating cash flow, then move to capital expenditure and free cash flow. Compare cumulative operating cash flow with cumulative reported profit over several years and investigate large, persistent gaps.",
          "Working capital is a frequent explanation. Receivables, inventory and contract assets can absorb cash even when reported earnings rise. For a capital-intensive business, also distinguish maintenance capex from expansion capex where disclosures permit.",
        ],
      },
      {
        heading: "Minute 8–11: Stress-test leverage and valuation",
        body: [
          "Check gross debt, cash, net debt, interest burden and the direction of leverage. A company can carry meaningful debt safely when cash generation is recurring; the same debt becomes more fragile when earnings and cash flow are falling.",
          "Then compare P/E, positive EV/EBITDA and other relevant multiples with close peers and the company’s own history. A non-positive EV/EBITDA is not a low valuation signal; show it as N/M and inspect the EBITDA and enterprise-value inputs.",
        ],
      },
      {
        heading: "Minute 11–13: Ownership, governance and dilution",
        body: [
          "For Indian listed companies, read the latest shareholding pattern and notes on promoter holdings, pledged or otherwise encumbered shares, and changes in institutional ownership. Track whether dilution, warrants, preferential issues or repeated equity raises are changing the economic claim on the business.",
          "Governance review should focus on disclosed transactions, auditor comments, regulatory actions and consistency between guidance and reported outcomes. Do not infer governance quality from management communication style alone.",
        ],
      },
      {
        heading: "Minute 13–15: Compare the right peers and write the unresolved questions",
        body: [
          "Use companies with similar products, customers, geography and capital intensity. Compare growth, margins, returns on capital, leverage, cash conversion and valuation on like-for-like reporting periods.",
          "Finish with three unresolved questions that must be answered from primary documents. This turns a quick scan into a research queue instead of a premature investment conclusion.",
        ],
      },
      {
        heading: "The 15-minute output",
        body: [
          "Your note should contain: business in one sentence; three-year or five-year financial trend; cash-flow observation; leverage observation; valuation multiples; ownership/governance flags; closest peers; and three questions for deeper due diligence.",
          "The framework is deliberately a triage tool. Fifteen minutes is enough to decide what to investigate next, not enough to establish the full quality of a public company.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can 15 minutes really be enough to analyze a stock?",
        a: "It is enough for a structured first-pass screen. Full research still requires primary filings, longer financial histories, peer work and a review of material risks.",
      },
      {
        q: "Which metric should I check first?",
        a: "Start with the business model and then check revenue/profit trend, operating cash flow, leverage and valuation in that order. The best sequence is designed to stop a cheap-looking ratio from dominating the research.",
      },
      {
        q: "Should I use only the latest quarterly result?",
        a: "No. Use the latest quarter for recency, but anchor the interpretation to several comparable periods so you can distinguish a trend from a one-off event.",
      },
    ],
  },
  {
    slug: "pe-vs-peg-vs-ev-ebitda",
    title: "P/E vs PEG vs EV/EBITDA: Choosing the Right Valuation Lens",
    h1: "P/E vs PEG vs EV/EBITDA",
    description:
      "A practical comparison of P/E, PEG and EV/EBITDA, including formulas, when each multiple breaks, and a worked example you can reproduce on live company data.",
    updated: "2026-09-19",
    topics: ["P/E", "PEG", "EV/EBITDA", "valuation multiples", "stock valuation"],
    groups: ["stocks", "learn", "screener"],
    originalResearch: true,
    answer:
      "P/E connects market value to earnings attributable to equity holders, PEG adds an explicit growth input, and EV/EBITDA compares enterprise value with a pre-interest, pre-tax, pre-depreciation operating earnings measure. None is universally superior; the correct lens depends on the business model, capital structure and quality of the denominator.",
    sections: [
      {
        heading: "P/E: the equity-holder multiple",
        body: [
          "Price-to-earnings is market price per share divided by trailing or forward earnings per share. It is intuitive for profitable businesses where earnings are reasonably representative of recurring economics.",
          "P/E becomes less informative when earnings are negative, highly cyclical, distorted by one-off items, or affected by unusual leverage. Always identify whether you are using trailing reported earnings or an estimate.",
        ],
      },
      {
        heading: "PEG: P/E plus an explicit growth assumption",
        body: [
          "A common PEG construction is P/E divided by an annual earnings-growth rate. For example, a P/E of 24 and a 12% growth assumption gives a PEG of 2.0 when the growth rate is entered as 12 rather than 0.12.",
          "PEG looks precise but inherits every weakness of its inputs. Growth may be historical, forecast, cyclical or only one year long. Changing the growth period can change the ratio materially.",
        ],
      },
      {
        heading: "EV/EBITDA: useful when capital structure matters",
        body: [
          "Enterprise value starts from equity value and incorporates debt and cash. EV/EBITDA is therefore often more comparable across companies with different leverage, because the numerator is based on the whole operating enterprise rather than only common equity. The ratio itself should be treated as N/M when EBITDA is zero/negative or enterprise value is negative.",
          "EBITDA is not free cash flow. It ignores interest, taxes, depreciation and amortisation, and it can look healthy in businesses that require heavy recurring capital expenditure. A negative or zero EBITDA denominator makes EV/EBITDA non-meaningful rather than cheap.",
        ],
      },
      {
        heading: "A reproducible three-multiple worksheet",
        body: [
          "For the target company and three to five close peers, record the same-period revenue, EBITDA, earnings, net debt and market capitalisation. Calculate P/E, PEG and EV/EBITDA using the same definition and reporting period for every company.",
          "Then add two quality columns: free-cash-flow conversion and return on capital. A multiple comparison without denominator quality can make two businesses look similar when their economics are not.",
        ],
      },
      {
        heading: "Worked example with hypothetical numbers",
        body: [
          "Company A has a P/E of 24, expected earnings growth of 12%, and EV/EBITDA of 15. Company B has a P/E of 18, expected growth of 6%, and EV/EBITDA of 11. The ratios alone do not establish which business is cheaper because debt, margins, reinvestment needs and the reliability of the growth assumptions differ.",
          "The research question is why the market assigns each multiple. A premium can reflect higher returns on capital, stronger reinvestment opportunities, better cash conversion or lower balance-sheet risk; it can also reflect expectations that later fail.",
        ],
      },
      {
        heading: "Which multiple fits which business?",
        body: [
          "Use P/E as a natural starting point for mature profitable businesses where financing structure is not the dominant distortion. Use EV/EBITDA when comparing businesses with materially different leverage or where enterprise value is a better expression of operating assets.",
          "Use PEG only when the growth input is explicit, defensible and comparable across the peer set. For banks and other financial firms, enterprise-value conventions require extra care because debt is part of the operating funding model.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is a lower P/E always better than a higher P/E?",
        a: "No. The multiple is a price relative to earnings, so you also need to assess growth, durability, leverage, capital intensity and the quality of the earnings denominator.",
      },
      {
        q: "What does a PEG of 1 mean?",
        a: "Under the common convention, a PEG of 1 means the P/E equals the stated annual earnings-growth rate. It is only as useful as the growth definition behind it.",
      },
      {
        q: "Why can EV/EBITDA and P/E tell different stories?",
        a: "Debt, cash, interest expense, taxes and depreciation can create large differences between enterprise value and equity value. The two multiples therefore answer different questions.",
      },
    ],
  },
  {
    slug: "roe-vs-roce-with-real-company-examples",
    title: "ROE vs ROCE: What the Difference Reveals About a Business",
    h1: "ROE vs ROCE explained with real-company examples",
    description:
      "Understand ROE and ROCE, why they can diverge, and how to compare companies such as TCS and Infosys without mistaking a high ratio for a complete quality verdict.",
    updated: "2026-09-19",
    topics: ["ROE", "ROCE", "TCS", "Infosys", "return on capital", "quality analysis"],
    groups: ["stocks", "india", "learn"],
    originalResearch: true,
    answer:
      "ROE measures the return earned on shareholders’ equity, while ROCE focuses on operating returns relative to capital employed. Both are useful, but they can diverge because of leverage, cash balances, business structure and accounting definitions. The important research task is to explain the difference, not to crown one ratio as the winner.",
    sections: [
      {
        heading: "ROE: what shareholders earn on book equity",
        body: [
          "Return on equity is generally calculated as net income divided by shareholders’ equity, often using average equity for the period. A high ROE can reflect strong economics, but it can also be amplified by a small equity base or substantial leverage.",
          "Read ROE together with debt-to-equity, buybacks, accumulated reserves and one-off gains. A ratio can rise because the denominator shrank, not because the operating business improved.",
        ],
      },
      {
        heading: "ROCE: focus on operating capital",
        body: [
          "Return on capital employed commonly relates operating profit or EBIT to capital employed. Definitions vary by provider, so use one consistent formula across the full peer set and document it.",
          "ROCE is useful for capital-intensive companies because it asks how effectively the operating business uses the capital tied up in it. It should be compared with the cost of that capital and with prior periods.",
        ],
      },
      {
        heading: "Real-company practice: TCS and Infosys",
        body: [
          "TCS and Infosys are useful real-company examples because both are large listed Indian IT-services businesses, yet their balance-sheet composition, cash holdings, buybacks, margins and capital structures can produce differences between ROE and ROCE.",
          "Open the latest DeepScreen company pages for both companies and record the same reporting-period ROE, ROCE, net margin, cash, debt and market valuation. The research goal is to explain any gap between ROE and ROCE using balance-sheet and operating facts rather than simply choosing the higher percentage.",
        ],
      },
      {
        heading: "Three questions to ask when ROE and ROCE diverge",
        body: [
          "First, is leverage materially changing the equity denominator? Second, is the company holding large amounts of excess cash or other non-operating assets? Third, are provider formulas using different definitions of operating profit or capital employed?",
          "Also inspect buybacks and dilution. A company that repurchases shares can mechanically change book equity and ROE even when the underlying operating return changes much less.",
        ],
      },
      {
        heading: "The DeepScreen return-quality check",
        body: [
          "Build a five- to ten-year series for ROE, ROCE, operating margin, free-cash-flow conversion and leverage. Mark the years with unusually high or low returns and read the annual-report explanations for those periods.",
          "Durable returns come from economics that persist: pricing power, efficient operations, asset turns, capital discipline, customer retention and sensible reinvestment. The ratio is the starting measurement, not the full explanation.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is ROE or ROCE more important?",
        a: "They measure different aspects of return. Use both when possible and investigate why they diverge rather than treating either as a standalone quality verdict.",
      },
      {
        q: "Can leverage make ROE look better?",
        a: "Yes. More financial leverage can reduce the equity base relative to the assets used to generate earnings, which can lift ROE while increasing financial risk.",
      },
      {
        q: "Why can a cash-rich company have different ROE and ROCE?",
        a: "Large cash balances affect the denominator differently depending on the formula used. That is one reason to document the provider definition and inspect the balance sheet.",
      },
    ],
  },
  {
    slug: "how-to-detect-a-debt-trap",
    title: "How to Detect a Debt Trap: A Cash-Flow and Balance-Sheet Checklist",
    h1: "How to detect a debt trap",
    description:
      "A practical checklist for finding debt stress early: leverage growth, interest burden, cash conversion, refinancing, working capital, dilution and collateral risk.",
    updated: "2026-09-19",
    topics: ["debt trap", "debt analysis", "interest coverage", "balance sheet", "cash flow"],
    groups: ["stocks", "learn"],
    originalResearch: true,
    answer:
      "A debt trap is a situation where debt service and refinancing needs become increasingly dependent on new borrowing, asset sales, equity dilution or unusually optimistic operating assumptions. No single ratio proves it; the strongest signal is a worsening combination of leverage, interest burden and weak recurring cash generation.",
    sections: [
      {
        heading: "Signal 1: debt grows faster than the business",
        body: [
          "Compare debt growth with revenue and EBITDA growth over several periods. If borrowings rise materially faster than the operating base, ask what the capital financed and whether the returns justify the funding cost.",
          "Separate acquisition debt, working-capital financing and long-term project finance because they carry different economic explanations and maturities.",
        ],
      },
      {
        heading: "Signal 2: interest is consuming the operating result",
        body: [
          "Interest coverage compares operating earnings with interest expense. A falling coverage ratio deserves attention even when headline profit remains positive, especially when debt is floating-rate or maturities are near.",
          "Do not stop at EBITDA coverage. Compare cash interest payments with operating cash flow and check whether reported earnings convert into cash after working-capital movements.",
        ],
      },
      {
        heading: "Signal 3: cash flow repeatedly fails to service the debt",
        body: [
          "Persistent negative free cash flow can force a company to borrow again just to fund capex, working capital or interest. Look for a pattern rather than one weak year, and distinguish temporary expansion spending from structural cash burn.",
          "Watch receivables, inventory and supplier financing. Fast growth can consume cash, but a multi-year deterioration in cash conversion without a credible operating explanation is a material research question.",
        ],
      },
      {
        heading: "Signal 4: refinancing becomes the strategy",
        body: [
          "Map the debt maturity schedule and ask what pays each tranche. A business becomes more exposed when near-term maturities are repeatedly rolled over instead of repaid from recurring cash generation.",
          "Read covenant disclosures, secured-borrowing terms, floating-rate exposure and any requirement to maintain collateral or financial ratios. Refinancing risk is about timing as well as headline leverage.",
        ],
      },
      {
        heading: "Signal 5: balance-sheet support keeps shrinking",
        body: [
          "Check cash balances, unpledged assets and access to committed facilities. Repeated asset sales, emergency equity raises or other funding actions can indicate that the original capital structure is becoming harder to sustain.",
          "For promoter-led Indian companies, also inspect whether promoter shares are pledged or otherwise encumbered. That is not automatically evidence of a company-level debt trap, but a rising pledge ratio can be an additional monitoring item.",
        ],
      },
      {
        heading: "A reproducible debt-trap worksheet",
        body: [
          "Record debt, cash, net debt, EBITDA or EBIT, interest expense, operating cash flow, capex, free cash flow and debt maturities for at least three comparable periods. Add notes for acquisitions, major capex projects and equity issuance.",
          "Then write the funding bridge: recurring operating cash flow, asset sales, new borrowing and new equity. A business that needs increasingly external funding to maintain normal operations deserves deeper review than one that self-funds most of its obligations.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is a high debt-to-equity ratio proof of a debt trap?",
        a: "No. Debt-to-equity is only one measure. The ability to service and refinance debt depends on recurring cash flow, interest cost, maturity profile, asset quality and access to funding.",
      },
      {
        q: "Can a fast-growing company have negative free cash flow without being distressed?",
        a: "Yes. Expansion capex and working-capital investment can consume cash temporarily. The key is whether the spending has a credible economic return and whether funding needs remain manageable.",
      },
      {
        q: "What should I inspect before trusting an interest-coverage ratio?",
        a: "Check the definition of earnings used, whether interest includes all relevant financing costs, and how cash interest compares with actual operating cash generation.",
      },
    ],
  },
  {
    slug: "free-cash-flow-analysis-guide",
    title: "Free Cash Flow Analysis: From Earnings to Owner Cash",
    h1: "Free cash flow analysis guide",
    description:
      "Learn how to move from accounting earnings to operating cash flow and free cash flow, with checks for working capital, capex, acquisitions, leases and dilution.",
    updated: "2026-09-19",
    topics: ["free cash flow", "cash flow analysis", "owner earnings", "capex", "working capital"],
    groups: ["stocks", "learn"],
    originalResearch: true,
    answer:
      "Free cash flow analysis asks how much cash a business generates after the investment required to keep its operating assets productive. DeepScreen’s workflow starts with operating cash flow, subtracts relevant capital expenditure, and then explains the major adjustments before treating the result as recurring owner cash.",
    sections: [
      {
        heading: "Start with operating cash flow, not net profit",
        body: [
          "Net income includes non-cash accounting items and can move differently from cash collected from customers. Operating cash flow is the bridge from accounting profit toward cash economics, so the first question is whether profit consistently converts into cash.",
          "A growing gap can have reasonable causes — inventory build, receivables growth, contract timing or customer advances — but it needs an explanation from the cash-flow and balance-sheet notes.",
        ],
      },
      {
        heading: "Subtract the capital needed to run the business",
        body: [
          "A common practical definition is free cash flow equal to operating cash flow minus capital expenditure. The exact treatment of asset purchases, software capitalisation, development spending and acquisitions should be documented for the company being studied.",
          "The hardest part is distinguishing maintenance capex from growth capex. Companies do not always disclose this cleanly, so use management commentary, asset schedules and historical reinvestment needs to avoid false precision.",
        ],
      },
      {
        heading: "Check working capital and cash conversion",
        body: [
          "Track receivables, inventory, payables and other operating working-capital balances over time. A company can report strong earnings while consuming substantial cash when customers take longer to pay or inventory builds ahead of demand.",
          "Calculate cash conversion using a consistent definition and compare it across several years and close peers. Persistent weak conversion is more informative than a single quarter with a timing effect.",
        ],
      },
      {
        heading: "Do not ignore leases, stock compensation and acquisitions",
        body: [
          "Lease commitments can be economically important even when the cash-flow presentation separates them across financing and operating categories. Stock-based compensation is non-cash today but can dilute existing owners; acquisitions are often excluded from simple FCF definitions even though they consume cash.",
          "For an owner-oriented analysis, keep a separate line for acquisition spending and share dilution. This makes it easier to distinguish cash created by the existing business from cash redeployed to buy growth.",
        ],
      },
      {
        heading: "A ten-year FCF research table",
        body: [
          "Record revenue, net income, operating cash flow, capex, free cash flow, diluted shares and net debt for each year. Add FCF margin and FCF per share, then mark years with unusually large working-capital swings or acquisitions.",
          "A durable cash generator should be understandable from the table: cash tends to follow the operating model, capex stays within a plausible range, dilution is visible, and weak years have identifiable causes.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is free cash flow the same as profit?",
        a: "No. Profit is an accounting measure; free cash flow focuses on operating cash generated after relevant capital expenditure.",
      },
      {
        q: "Can free cash flow be negative for a good company?",
        a: "Yes. Expansion, working-capital investment or acquisitions can create temporarily negative cash flow. The research question is whether the spending has a credible return and remains financeable.",
      },
      {
        q: "What is FCF yield?",
        a: "FCF yield is commonly free cash flow divided by market capitalisation, expressed as a percentage. Use the same period and share count definition across the comparison set.",
      },
    ],
  },
  {
    slug: "promoter-pledging-risk-analysis",
    title: "How Promoter Pledging Affects Risk: A Practical Disclosure Guide",
    h1: "How promoter pledging affects risk",
    description:
      "Understand pledged or otherwise encumbered promoter shares, where to verify them in Indian filings, what can change the risk, and why the trend matters more than a single percentage.",
    updated: "2026-09-19",
    topics: ["promoter pledge", "promoter holding", "shareholding pattern", "SEBI disclosures", "Indian stocks"],
    groups: ["india", "stocks", "learn"],
    originalResearch: true,
    answer:
      "Promoter pledging means shares held by promoters are pledged or otherwise encumbered as collateral. The disclosure is important because a fall in the share price can affect collateral coverage, but a pledge is not automatically a sign of financial distress. The correct analysis is to verify the disclosure, trace the trend and understand what the borrowing supports.",
    sections: [
      {
        heading: "What exactly is being pledged?",
        body: [
          "Start with the latest exchange shareholding pattern and the reported number of promoter shares pledged or otherwise encumbered. Separate pledged shares from locked-in shares and other categories because the economic implications differ.",
          "For listed Indian companies, promoter and promoter-group ownership is part of the disclosure framework overseen by SEBI. Use the current exchange filing rather than a third-party percentage copied from an older quarter.",
        ],
      },
      {
        heading: "Why the risk can change with the stock price",
        body: [
          "When pledged shares are collateral for borrowing, the market value of that collateral moves with the share price. A large price decline can therefore create pressure for additional collateral, partial repayment or lender action depending on the financing terms.",
          "This mechanism is separate from the company’s own debt. Promoter-level borrowing can affect control and ownership even when the operating company’s balance sheet looks stable.",
        ],
      },
      {
        heading: "Track the trend, not just the snapshot",
        body: [
          "Create a quarter-by-quarter series of promoter holding, pledged or encumbered shares, public holding and institutional holding. Mark large increases, sudden releases and any changes in promoter ownership.",
          "A falling pledge ratio can result from repayment, release of collateral, or changes in the promoter share base. Read the filing notes before interpreting the percentage as a standalone improvement.",
        ],
      },
      {
        heading: "Five questions for a promoter-pledge review",
        body: [
          "What percentage of promoter shares is pledged or otherwise encumbered? Who appears to be the borrower? What assets or obligations does the borrowing support? Has the pledge ratio changed materially? Could lender enforcement change voting control if the share price falls?",
          "Answer those questions from exchange filings, corporate announcements and the company’s disclosures. Do not infer pledge levels from debt-to-equity, market cap or the stock chart.",
        ],
      },
      {
        heading: "How DeepScreen should present this data",
        body: [
          "Pledge information should always carry a reporting date and source label. The interface should distinguish live provider data, company filing data and older reference values so a historical disclosure is not mistaken for today’s position.",
          "For research purposes, the most useful output is a dated trend line plus a link back to the source document. A single bold warning label without the underlying filing is not enough.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is promoter pledging always bad?",
        a: "No. The economic purpose, amount, collateral terms and trend matter. A pledge should be investigated rather than treated as a universal verdict.",
      },
      {
        q: "Where can I verify promoter pledging in India?",
        a: "Start with the latest exchange shareholding pattern and related company disclosures. SEBI’s disclosure framework specifies promoter and promoter-group reporting requirements.",
      },
      {
        q: "Is promoter pledge the same as company debt?",
        a: "No. Promoter-level borrowing is distinct from debt recorded on the operating company’s balance sheet, although it can still create ownership and control risk.",
      },
    ],
  },
  {
    slug: "10-year-compounder-analysis-framework",
    title: "10-Year Compounder Analysis Framework: A Repeatable Business-Quality Checklist",
    h1: "10-year compounder analysis framework",
    description:
      "A long-horizon framework for researching businesses with the potential to compound value: reinvestment runway, returns on capital, cash flow, competition, governance, dilution and valuation.",
    updated: "2026-09-19",
    topics: ["compounder", "10 year stock analysis", "long term investing", "quality business", "reinvestment"],
    groups: ["stocks", "learn", "india"],
    originalResearch: true,
    answer:
      "A 10-year compounder framework studies the business as an operating system rather than a stock chart. It asks whether the company can reinvest capital at attractive returns, grow without excessive leverage or dilution, preserve its competitive position and remain understandable enough to monitor through multiple economic cycles.",
    sections: [
      {
        heading: "1. Reinvestment runway",
        body: [
          "Estimate where future growth can actually come from: new customers, new products, capacity, geographic expansion, pricing, market share or acquisitions. A company cannot compound rapidly for a decade if its addressable market is already exhausted.",
          "Then ask how much capital the growth requires. High growth with proportionally higher capital needs can produce a very different economic outcome from growth that needs little incremental capital.",
        ],
      },
      {
        heading: "2. Returns on incremental capital",
        body: [
          "Historical ROE and ROCE are useful starting points, but a long-term study should also ask what return the next unit of invested capital appears to earn. Watch margins, asset turns, working capital and capital expenditure as the company scales.",
          "Strong historical returns can deteriorate when a business gets larger, enters tougher markets or overinvests. The 10-year framework therefore focuses on durability, not a single peak ratio.",
        ],
      },
      {
        heading: "3. Cash generation and balance-sheet resilience",
        body: [
          "Build a decade-long series for operating cash flow, free cash flow, net debt and diluted shares. Note the years in which cash conversion broke down and explain the cause.",
          "A compounding business still encounters recessions, commodity shocks, regulatory changes and competitive pressure. Balance-sheet resilience determines how much damage a bad cycle can do to the long-run reinvestment plan.",
        ],
      },
      {
        heading: "4. Competitive advantage and industry structure",
        body: [
          "Look for observable economics: switching costs, network effects, scale, distribution, brand strength, patents or licenses, cost advantages and regulatory barriers. Then test whether those advantages show up in price retention, margins, customer retention and returns on capital.",
          "Study competitors in the same period. A moat is not a label; it is a hypothesis that should survive direct peer comparison and repeated business-cycle tests.",
        ],
      },
      {
        heading: "5. Management, governance and dilution",
        body: [
          "Compare management promises with delivered revenue, margins, capital allocation and acquisitions across several years. Review related-party transactions, auditor commentary, regulatory events and equity issuance.",
          "Dilution matters because a business can grow while the per-share economics lag. Track diluted shares, stock compensation, warrants and acquisitions funded with new equity.",
        ],
      },
      {
        heading: "6. Valuation must fit the operating story",
        body: [
          "A strong business can be a weak investment at an unsupported price, while a slower business can be priced for very low expectations. Compare the current valuation with the company’s own history, close peers and a range of operating outcomes.",
          "Use scenario analysis instead of a single-point forecast: lower growth, lower margins, higher reinvestment, higher funding costs and a more conservative exit multiple should all be visible in the research note.",
        ],
      },
      {
        heading: "The 10-year evidence table",
        body: [
          "For each year, record revenue, operating margin, net income, operating cash flow, free cash flow, ROE, ROCE, net debt and diluted shares. Add a short note for major acquisitions, restructurings, regulatory events and major changes in business mix.",
          "After ten years, the pattern should be legible. You should be able to explain not only how the company grew, but why returns on capital, cash generation and per-share economics did or did not keep pace.",
        ],
      },
    ],
    faqs: [
      {
        q: "What makes a business a 10-year compounder?",
        a: "The phrase describes a business capable of repeatedly reinvesting capital at attractive returns while maintaining a durable competitive position. It is a research hypothesis, not a guarantee of future returns.",
      },
      {
        q: "How many years of data should I study?",
        a: "Ten years is a useful horizon because it includes more than one market and business cycle in many cases. Shorter series can still be informative when the company is young, but the limitations should be stated.",
      },
      {
        q: "Should valuation be ignored when finding a compounder?",
        a: "No. Long-run operating quality and entry valuation both matter. A business can execute well while the price already assumes an overly optimistic future.",
      },
    ],
  },

];

export const findGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);
