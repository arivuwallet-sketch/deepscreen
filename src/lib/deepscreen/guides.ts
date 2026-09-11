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
          "Valuation filters (P/E, P/B, EV/EBITDA) tell you what the market is already paying for the earnings. Quality filters (return on equity, debt-to-equity, interest coverage) tell you whether those earnings are durable.",
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
    title: "NSE vs BSE: Differences, Which to Trade On, and Why Prices Vary",
    h1: "NSE vs BSE — what is the difference?",
    description:
      "NSE and BSE are India's two main stock exchanges. Compare liquidity, indices, listings and settlement, and learn which one to place your order on.",
    updated: "2026-09-11",
    topics: ["NSE", "BSE", "Nifty 50", "Sensex", "Indian stock market"],
    groups: ["india", "stocks"],
    answer:
      "The BSE is Asia's oldest exchange with the widest list of companies and the Sensex as its benchmark; the NSE is younger, carries far higher trading volume, and runs the Nifty 50 and India's dominant derivatives market. Most active traders route orders to the NSE for liquidity; both settle T+1 and are regulated by SEBI.",
    sections: [
      {
        heading: "Size and liquidity",
        body: [
          "The BSE lists the larger number of companies, including many small and rarely traded names. The NSE lists fewer but captures the overwhelming majority of cash-market turnover and virtually all equity derivatives volume.",
          "Liquidity matters more than listing count for anyone placing orders. Tighter bid-ask spreads on the NSE mean less slippage, which is why large orders in dual-listed stocks usually go there.",
        ],
      },
      {
        heading: "Indices",
        body: [
          "The BSE's benchmark is the Sensex, 30 large companies weighted by free-float market cap. The NSE's is the Nifty 50, a broader 50-stock benchmark.",
          "Because their constituents overlap heavily, the two indices move together almost tick for tick. Divergence between them is noise, not a signal.",
        ],
      },
      {
        heading: "Why the same stock shows two prices",
        body: [
          "A dual-listed company trades independently on each exchange, so quotes differ by paise as order flow arrives at different times. Arbitrageurs close the gap within seconds.",
          "You can buy on one exchange and sell on the other, since shares settle into the same demat account — but check your broker's rules before relying on it intraday.",
        ],
      },
      {
        heading: "Which should you use?",
        body: [
          "For actively traded large and mid caps: the NSE, for the spread. For small caps or older companies listed only on the BSE: the BSE, because there is no alternative.",
          "For derivatives, the NSE is effectively the only venue that matters in India.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is NSE better than BSE?",
        a: "For liquidity and derivatives, yes. For breadth of listed companies, the BSE is larger. Both are SEBI-regulated and equally safe to trade on.",
      },
      {
        q: "Can I buy a stock on NSE and sell it on BSE?",
        a: "Yes, once the shares are in your demat account, since both exchanges settle to the same depository. Intraday, broker rules vary.",
      },
      {
        q: "Do NSE and BSE have the same trading hours?",
        a: "Yes. Both run a normal equity session from 9:15 am to 3:30 pm IST, with a pre-open session from 9:00 am.",
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
        a: "Green (or hollow) means the close was above the open for that period; red (or filled) means it closed below.",
      },
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
      },
      {
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
          "For leveraged businesses, compare EV/EBITDA rather than P/E.",
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
    description:
      "How the relative strength index and simple/exponential moving averages are built, what crossovers actually mean, and where both indicators fail.",
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
];

export const findGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);
