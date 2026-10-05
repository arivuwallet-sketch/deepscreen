import type { BlogPost } from "@/lib/content/investment-blog";

export const TRADING_BLOG_POSTS: BlogPost[] = [
  {
    slug: "deepchart-technical-analysis-guide",
    category: "DeepChart",
    title: "How to Read a Chart with DeepChart | Technical Analysis Guide",
    h1: "How to read a trading chart with DeepChart: structure before signals",
    description:
      "Learn how to read charts with DeepChart using market structure, trend, support and resistance, momentum, volatility, volume, liquidity and multi-timeframe confirmation.",
    excerpt:
      "A chart should not be reduced to one RSI number or one candlestick pattern. This guide shows a structured way to read price first, use indicators as evidence, define invalidation and only then think about a trade.",
    primaryKeyword: "how to read a trading chart",
    secondaryKeywords: [
      "DeepChart",
      "technical analysis",
      "chart analysis",
      "support and resistance",
      "market structure",
      "RSI",
      "moving averages",
      "multi timeframe analysis",
      "price action trading",
      "technical analysis for beginners",
    ],
    published: "2026-10-05",
    updated: "2026-10-05",
    readingMinutes: 12,
    directAnswer:
      "Read a trading chart in this order: identify market structure, establish the dominant trend, mark important price areas, check whether momentum and volume confirm the move, then define the price that would invalidate the idea. DeepChart follows this layered approach so a technical reading is explainable instead of being based on one indicator.",
    uniqueAngle:
      "The DeepChart STACK framework—Structure, Trend, Areas, Confirmation, Keep risk defined—turns dozens of indicators into five questions that can be answered on any supported stock, index, forex, crypto or commodity chart.",
    keyTakeaways: [
      "Price structure comes before indicators: higher highs and higher lows, lower highs and lower lows, or a range.",
      "Support and resistance work better as reaction zones than as magic single-price lines.",
      "Moving averages, RSI, ADX, volatility and volume should confirm or challenge the price story rather than replace it.",
      "A higher timeframe can reveal whether a short-term setup is aligned with or fighting the broader market structure.",
      "A technical setup is incomplete until the invalidation level, position risk and exit conditions are defined.",
      "No chart engine can guarantee a future price move; technical analysis organizes evidence and risk.",
    ],
    sections: [
      {
        id: "stack-framework",
        heading: "The DeepChart STACK framework",
        answer:
          "Use five layers: Structure, Trend, Areas, Confirmation and Keep risk defined. The order matters because each layer answers a different question.",
        table: {
          caption: "DeepChart STACK — a repeatable chart-reading sequence",
          headers: ["Layer", "Question", "Examples"],
          rows: [
            ["Structure", "What is price doing?", "Higher highs/lows, lower highs/lows, range, break of structure"],
            ["Trend", "Which direction has control?", "EMA alignment, slope, higher-timeframe bias, Supertrend"],
            ["Areas", "Where could price react?", "Support/resistance, prior swing points, Fibonacci, volume profile, liquidity"],
            ["Confirmation", "Is participation agreeing?", "RSI, ADX, StochRSI, MFI, divergence, volume/VWAP"],
            ["Keep risk defined", "Where is the idea wrong?", "Invalidation, stop distance, target, reward-to-risk, size"],
          ],
        },
      },
      {
        id: "structure-first",
        heading: "1. Read market structure before indicators",
        answer:
          "Structure is the sequence of swing highs and lows. It tells you whether buyers, sellers or neither side has established directional control.",
        paragraphs: [
          {
            text:
              "An uptrend normally shows a sequence of higher highs and higher lows. A downtrend normally shows lower highs and lower lows. When price repeatedly rotates between similar boundaries, the market is behaving more like a range. These labels are descriptions of observed price behavior, not promises about the next candle.",
          },
          {
            text:
              "A break of structure matters only in context. A small intraday break inside a large weekly range can be less important than a daily close through a major swing. DeepChart therefore pairs the selected timeframe with a higher timeframe so the local move is not read in isolation.",
          },
        ],
      },
      {
        id: "trend-context",
        heading: "2. Use trend tools as context, not commands",
        answer:
          "Moving averages and trend indicators are useful when they summarize an already visible trend; they are weaker when used as automatic buy or sell switches.",
        bullets: [
          "Compare price with the 20, 50 and 200-period averages to understand short-, medium- and longer-horizon positioning.",
          "Look at slope and spacing, not only whether one average crossed another.",
          "Use ADX as a measure of trend strength rather than direction.",
          "Treat Supertrend or similar overlays as confirmation; they are derived from past price and volatility.",
          "When moving averages are flat and intertwined, expect more false directional signals.",
        ],
      },
      {
        id: "areas-not-lines",
        heading: "3. Mark areas where order flow can matter",
        answer:
          "Important chart levels are usually zones created by previous reactions, positioning or concentrated activity, not exact prices that must hold to the tick.",
        paragraphs: [
          {
            text:
              "DeepChart combines repeated support/resistance touches with swing points, Fibonacci retracements, recent volume profile and liquidity pools. Multiple forms of evidence near the same area can be more useful than drawing dozens of unrelated horizontal lines.",
          },
          {
            text:
              "The purpose of a level is practical: it can identify where a setup becomes attractive, where the thesis becomes invalid and whether there is enough room to the next opposing area for the trade to make economic sense.",
          },
        ],
      },
      {
        id: "momentum-volume",
        heading: "4. Ask whether momentum and participation confirm price",
        answer:
          "Momentum indicators measure the character of the move; they should be compared with structure rather than interpreted in isolation.",
        table: {
          caption: "What common DeepChart indicators contribute",
          headers: ["Indicator", "What it helps describe", "Common mistake"],
          rows: [
            ["RSI", "Recent directional momentum", "Treating 70 as an automatic sell or 30 as an automatic buy"],
            ["StochRSI", "Momentum of RSI / short-cycle extremes", "Overreacting in strong trends"],
            ["ADX", "Trend strength", "Using it as bullish or bearish direction"],
            ["ATR", "Typical recent price range / volatility", "Using the same stop distance in every volatility regime"],
            ["VWAP", "Volume-weighted reference price where available", "Assuming it is universal fair value"],
            ["MFI", "Price-volume pressure where volume is meaningful", "Ignoring weak or synthetic volume data"],
          ],
        },
        paragraphs: [
          {
            text:
              "Divergence can be useful when price makes a new extreme while momentum does not, but divergence can persist for a long time. It is evidence of changing momentum, not a timing signal by itself.",
          },
        ],
      },
      {
        id: "multi-timeframe",
        heading: "5. Add higher-timeframe confirmation",
        answer:
          "A lower-timeframe setup becomes easier to interpret when you know whether it is aligned with, neutral to or fighting the broader trend.",
        bullets: [
          "Use the higher timeframe to locate the major structure and nearest important levels.",
          "Use the trading timeframe to define the actual setup and invalidation.",
          "Do not mix timeframes after entry simply to avoid accepting that the original setup failed.",
          "When the timeframes conflict, require stronger evidence or reduce confidence instead of forcing a signal.",
        ],
      },
      {
        id: "risk-before-entry",
        heading: "6. Define invalidation before entry",
        answer:
          "A complete technical idea includes the price that proves the setup wrong and a position size that makes that loss affordable.",
        paragraphs: [
          {
            text:
              "The SEC warns investors to be skeptical of claims that a trading strategy is easy, simple or fool-proof. That principle matters for technical analysis: a high-confluence chart can still fail, so the quality of risk management matters independently of the quality of the setup.",
            sources: ["sec-trading-seminars"],
          },
          {
            text:
              "Order type also affects execution. Investor.gov notes that broker order types can differ in important ways, so an intended stop or limit should not be assumed to guarantee a particular execution price under every market condition.",
            sources: ["sec-order-types"],
          },
        ],
      },
      {
        id: "deepchart-workflow",
        heading: "A 60-second DeepChart workflow",
        answer:
          "Reduce the chart to a sequence of decisions instead of trying to process every indicator at once.",
        bullets: [
          "Choose the instrument and timeframe that match the research horizon.",
          "Describe structure in one sentence: uptrend, downtrend, range or transition.",
          "Mark the nearest support, resistance, liquidity and high-volume areas.",
          "Check whether trend, momentum and volatility support the same story.",
          "Check the higher timeframe and note any conflict.",
          "Write the invalidation level before considering an entry.",
          "Compare stop distance with realistic target space and position size.",
          "If the evidence is mixed, 'no trade' is a valid technical conclusion.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the best indicator for technical analysis?",
        a: "There is no single best indicator. Price structure answers a different question from momentum, volatility or volume. A stronger process combines non-redundant evidence and defines what would invalidate the setup.",
      },
      {
        q: "Is RSI above 70 always a sell signal?",
        a: "No. RSI above 70 describes strong recent upside momentum and can persist during a powerful trend. Read it with structure, trend, resistance, divergence and volatility instead of treating one threshold as an automatic trade.",
      },
      {
        q: "How many timeframes should I use?",
        a: "Two are often enough for a disciplined workflow: one timeframe for the setup and one higher timeframe for broader structure. Adding many more can create contradictory signals without improving the decision.",
      },
      {
        q: "Are support and resistance exact prices?",
        a: "Usually no. They are better treated as areas where the market previously reacted. The useful question is whether a zone helps define entry, invalidation and target space.",
      },
      {
        q: "Can DeepChart predict the next candle?",
        a: "No. DeepChart analyzes observable market conditions and produces an explainable technical reading. It does not know the future, and unexpected news, gaps or regime changes can invalidate any setup.",
      },
      {
        q: "Can DeepChart analyze forex and crypto as well as stocks?",
        a: "Yes, for supported symbols. The technical framework is shared, but trading hours, liquidity, leverage, contract mechanics and data quality differ by market and should be considered separately.",
      },
    ],
    sources: [
      {
        id: "sec-trading-seminars",
        title: "Investor Alert: Investment Seminars — Trading Seminar Scams",
        publisher: "U.S. Securities and Exchange Commission / Investor.gov",
        date: "accessed October 2026",
        href: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-alerts/investor-49",
      },
      {
        id: "sec-order-types",
        title: "Understanding Order Types — Investor Bulletin",
        publisher: "U.S. Securities and Exchange Commission / Investor.gov",
        date: "updated August 18, 2026",
        href: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-14",
      },
    ],
    relatedLinks: [
      { label: "Open DeepChart", href: "/chart-reader" },
      { label: "How to read candlestick charts", href: "/learn/how-to-read-candlestick-charts" },
      { label: "Fundamental vs technical analysis", href: "/compare/fundamental-vs-technical-analysis" },
      { label: "Trading risk management guide", href: "/blog/trading-risk-management-position-sizing" },
    ],
  },
  {
    slug: "trading-risk-management-position-sizing",
    category: "Trading",
    title: "Trading Risk Management: Position Size, Stops & R-Multiples",
    h1: "Trading risk management: position sizing, stops, reward-to-risk and expectancy",
    description:
      "A practical trading risk-management guide covering risk capital, invalidation, position sizing, stop-losses, reward-to-risk, expectancy, leverage and trading journals.",
    excerpt:
      "The first job of a trader is not finding a perfect entry. It is making sure one bad trade, one gap or one emotional decision cannot do disproportionate damage.",
    primaryKeyword: "trading risk management",
    secondaryKeywords: [
      "position sizing trading",
      "risk reward ratio",
      "stop loss",
      "trading expectancy",
      "risk per trade",
      "R multiple trading",
      "leverage risk",
      "trading plan",
    ],
    published: "2026-10-05",
    updated: "2026-10-05",
    readingMinutes: 13,
    directAnswer:
      "Trading risk management means deciding the maximum acceptable loss before entering, placing invalidation where the trade thesis is wrong, calculating position size from that stop distance, and measuring performance across many trades rather than one outcome. Risk control cannot remove losses, but it can prevent normal losses from becoming account-threatening losses.",
    uniqueAngle:
      "The DeepScreen RISK framework—Risk capital, Invalidation, Size, Keep records—forces every chart idea to pass through a capital-preservation test before it becomes a trade.",
    keyTakeaways: [
      "Define risk in money before thinking about profit.",
      "A stop should come from the setup's invalidation; position size should adapt to the stop.",
      "Reward-to-risk is incomplete without an estimate of win rate and execution costs.",
      "Leverage changes the speed and size of losses as well as gains.",
      "A trading journal should track planned risk, actual risk, slippage, fees and rule adherence.",
      "No risk rule makes trading safe; frequent and leveraged trading can produce rapid losses.",
    ],
    sections: [
      {
        id: "risk-framework",
        heading: "The RISK framework",
        answer:
          "Every trade should answer four questions before entry: how much capital is truly risk capital, where is the thesis invalid, what position size converts that stop into an affordable loss, and how will the result be recorded?",
        table: {
          caption: "DeepScreen RISK framework",
          headers: ["Step", "Decision", "Output"],
          rows: [
            ["Risk capital", "How much can be lost without harming essential finances?", "Maximum account risk budget"],
            ["Invalidation", "What price action proves the idea wrong?", "Stop / exit threshold"],
            ["Size", "How large can the position be for that stop?", "Units, shares or contracts"],
            ["Keep records", "Did execution and behavior match the plan?", "Journal and expectancy data"],
          ],
        },
      },
      {
        id: "risk-capital",
        heading: "1. Separate risk capital from life money",
        answer:
          "Trading capital should not be money needed for housing, emergencies, education, debt obligations or other essential goals.",
        paragraphs: [
          {
            text:
              "FINRA describes day trading as extremely risky and says it generally is not appropriate for someone with limited resources, limited trading experience or low risk tolerance. Its investor guidance warns against funding day trading with retirement savings, student loans, second mortgages, emergency funds or money required for living expenses.",
            sources: ["finra-day-trading"],
          },
          {
            text:
              "This is a portfolio-level decision made before the chart. If the money cannot be lost without changing your essential financial plan, it should not be treated as speculative trading capital.",
          },
        ],
      },
      {
        id: "invalidation",
        heading: "2. Put the stop where the idea is wrong",
        answer:
          "The stop distance should come from market structure or the strategy's invalidation—not from an arbitrary amount of money you want to risk.",
        bullets: [
          "For a breakout, invalidation may be a decisive move back through the broken structure.",
          "For a pullback, invalidation may be beyond the swing or support zone the thesis depends on.",
          "For a volatility-based setup, the stop may need to account for current ATR or typical noise.",
          "If the technically logical stop is too far away, reduce position size or skip the trade rather than dragging the stop closer without reason.",
          "A stop order can execute at a worse price during gaps or fast markets, so planned risk and actual loss can differ.",
        ],
      },
      {
        id: "position-size",
        heading: "3. Convert stop distance into position size",
        answer:
          "Position size should be the result of a risk budget, not a confidence score.",
        paragraphs: [
          {
            text:
              "A basic cash-market formula is: position units = maximum money risk ÷ absolute distance from entry to stop. If a trader is willing to risk ₹1,000 and the planned entry-to-stop distance is ₹20 per share, the simple size is 50 shares before considering gaps, fees, slippage and lot constraints.",
          },
        ],
        table: {
          caption: "Illustrative position sizing — not a recommendation",
          headers: ["Maximum planned loss", "Entry-stop distance per unit", "Simple position size"],
          rows: [
            ["₹500", "₹10", "50 units"],
            ["₹1,000", "₹20", "50 units"],
            ["₹1,000", "₹50", "20 units"],
            ["₹2,000", "₹40", "50 units"],
          ],
        },
        note:
          "Derivatives require contract multipliers, lot sizes, margin and nonlinear payoff mechanics. The simple cash formula is not sufficient for every instrument.",
      },
      {
        id: "reward-risk-expectancy",
        heading: "4. Reward-to-risk is not enough: use expectancy",
        answer:
          "A 3R target can still be a poor system if it is rarely reached, while a lower target can work if the win rate and losses are controlled.",
        paragraphs: [
          {
            text:
              "Expectancy can be written as: probability of win × average win minus probability of loss × average loss. The calculation is only as useful as the data behind it. A small sample, cherry-picked backtest or changing strategy can create a misleading expectation.",
          },
        ],
        table: {
          caption: "Illustrative expectancy examples in R units",
          headers: ["Win rate", "Average win", "Average loss", "Expectancy per trade"],
          rows: [
            ["40%", "2.0R", "1.0R", "+0.20R"],
            ["50%", "1.5R", "1.0R", "+0.25R"],
            ["60%", "1.0R", "1.0R", "+0.20R"],
            ["35%", "1.5R", "1.0R", "−0.125R"],
          ],
        },
      },
      {
        id: "leverage",
        heading: "5. Treat leverage as loss acceleration",
        answer:
          "Leverage increases exposure relative to capital, which magnifies adverse moves and can trigger margin calls or forced liquidation.",
        paragraphs: [
          {
            text:
              "Investor.gov explains that leveraged strategies use borrowing, options or leveraged products to magnify exposure and therefore can magnify losses. The correct risk measure is the economic exposure and loss scenario, not the small amount of cash initially posted.",
            sources: ["sec-leverage"],
          },
          {
            text:
              "SEBI's September 2024 study reported that 93% of individual traders in Indian equity F&O incurred losses over FY22–FY24. That historical study does not predict an individual's result, but it demonstrates why derivative leverage and frequent trading deserve conservative risk assumptions.",
            sources: ["sebi-fo-study"],
          },
        ],
      },
      {
        id: "journal",
        heading: "6. Keep a trading journal that measures behavior, not just P&L",
        answer:
          "A useful journal separates strategy quality from execution quality.",
        bullets: [
          "Record setup type, timeframe and market regime.",
          "Record planned entry, invalidation, target and risk in R before entry.",
          "Record actual fills, fees, slippage and exit reason.",
          "Mark whether the trade followed the written rules.",
          "Review results by setup, not only by day or month.",
          "Track maximum losing streak and drawdown so position risk is grounded in real experience.",
        ],
      },
      {
        id: "pretrade-checklist",
        heading: "A pre-trade risk checklist",
        answer:
          "A trade should be rejectable before entry if its risk cannot be clearly defined.",
        bullets: [
          "Is this money genuinely risk capital?",
          "What observable price condition invalidates the setup?",
          "What is the worst realistic loss if the stop slips or the market gaps?",
          "What position size keeps that loss within the risk budget?",
          "Is there enough target space after spread, fees and slippage?",
          "Does leverage create liquidation or margin-call risk?",
          "Is a scheduled event capable of changing volatility abruptly?",
          "If the answer is unclear, reduce size or do not trade.",
        ],
      },
    ],
    faqs: [
      {
        q: "What percentage of my account should I risk per trade?",
        a: "There is no universal percentage that is appropriate for everyone. The amount should be small enough that a normal losing streak does not threaten essential finances or force emotional decisions. Start from the maximum money loss you can genuinely afford, not a copied percentage.",
      },
      {
        q: "Should I move my stop-loss farther away if price is close to hitting it?",
        a: "Only if the original trading plan explicitly allows a rules-based adjustment. Moving a stop simply to avoid taking a planned loss changes the risk after entry and can turn a controlled loss into a much larger one.",
      },
      {
        q: "Is a 1:2 risk-reward ratio always good?",
        a: "No. A 2R target is only attractive if the setup reaches it often enough after costs. Reward-to-risk must be evaluated with win rate, slippage, fees and the consistency of the strategy.",
      },
      {
        q: "What is an R-multiple?",
        a: "R is the amount initially planned to be lost if a trade reaches its invalidation. A +2R result earns twice the initial planned risk; a −1R result loses the planned risk. R-multiples make results comparable across different position sizes.",
      },
      {
        q: "Does a stop-loss guarantee my maximum loss?",
        a: "No. Gaps, fast markets, liquidity and order mechanics can produce slippage, so the actual fill can be worse than the stop trigger or intended exit.",
      },
      {
        q: "Why is position sizing more important when leverage is used?",
        a: "Leverage increases economic exposure relative to capital. A small adverse move can therefore create a large account loss or forced liquidation, making exposure and stop distance critical.",
      },
    ],
    sources: [
      {
        id: "finra-day-trading",
        title: "Day Trading",
        publisher: "FINRA",
        date: "accessed October 2026",
        href: "https://www.finra.org/investors/investing/investment-products/stocks/day-trading",
      },
      {
        id: "sec-leverage",
        title: "Leveraged Investing Strategies — Know the Risks Before Using These Advanced Investment Tools",
        publisher: "U.S. Securities and Exchange Commission / Investor.gov",
        date: "accessed October 2026",
        href: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/leveraged-investing-strategies-know-risks-using-these-advanced-investment-tools",
      },
      {
        id: "sebi-fo-study",
        title: "Updated SEBI Study Reveals 93% of Individual Traders Incurred Losses in Equity F&O between FY22 and FY24",
        publisher: "Securities and Exchange Board of India",
        date: "September 23, 2024",
        href: "https://www.sebi.gov.in/media-and-notifications/press-releases/sep-2024/updated-sebi-study-reveals-93-of-individual-traders-incurred-losses-in-equity-fando-between-fy22-and-fy24-aggregate-losses-exceed-1-8-lakh-crores-over-three-years_86906.html",
      },
    ],
    relatedLinks: [
      { label: "Open DeepChart", href: "/chart-reader" },
      { label: "Technical analysis guide", href: "/blog/deepchart-technical-analysis-guide" },
      { label: "Options strategy lab", href: "/options" },
      { label: "Crypto trading guide", href: "/blog/crypto-trading-guide-spot-futures-risk" },
    ],
  },
  {
    slug: "crypto-trading-guide-spot-futures-risk",
    category: "Crypto",
    title: "Crypto Trading Guide: Spot, Futures, Leverage & Risk",
    h1: "Crypto trading explained: spot, futures, perpetuals, custody and risk",
    description:
      "Understand crypto trading before using a chart: spot vs futures and perpetuals, leverage, liquidation, funding, custody, liquidity, scams and a safer research checklist.",
    excerpt:
      "The same Bitcoin chart can represent very different risks depending on whether you own spot crypto, hold an exchange-traded product or trade a leveraged derivative. Start with the instrument, not the candle.",
    primaryKeyword: "crypto trading guide",
    secondaryKeywords: [
      "crypto trading for beginners",
      "spot vs futures crypto",
      "crypto perpetual futures",
      "crypto leverage",
      "crypto liquidation",
      "crypto custody",
      "Bitcoin technical analysis",
      "crypto risk management",
    ],
    published: "2026-10-05",
    updated: "2026-10-05",
    readingMinutes: 13,
    directAnswer:
      "Crypto trading means buying or selling crypto assets or crypto-linked instruments to take price risk. Before analyzing the chart, identify whether the exposure is spot, an exchange-traded product, a dated future or a perpetual derivative, because custody, leverage, funding, liquidation and counterparty risks can differ materially.",
    uniqueAngle:
      "The DeepScreen CHAIN checklist—Custody, How the instrument works, Asset/liquidity, Instrument leverage, Network/platform risk—forces the trader to understand what is being traded before applying technical analysis.",
    keyTakeaways: [
      "A crypto chart is not enough; identify the legal and economic instrument behind the chart.",
      "Spot, futures and perpetual derivatives can have very different leverage, funding and liquidation mechanics.",
      "Crypto custody depends on access credentials/private keys and the security of any third-party custodian.",
      "Thin liquidity can turn a visually attractive setup into a poor execution environment.",
      "Funding, fees and forced liquidation can dominate the result of a leveraged trade.",
      "Technical analysis can organize price behavior but cannot remove platform, custody, regulatory or event risk.",
    ],
    sections: [
      {
        id: "chain-framework",
        heading: "Use CHAIN before reading the crypto chart",
        answer:
          "The first step is instrument due diligence. A clean chart does not tell you who holds the assets, how leverage works or what happens if the venue fails.",
        table: {
          caption: "DeepScreen CHAIN crypto checklist",
          headers: ["Step", "Question", "Why it matters"],
          rows: [
            ["Custody", "Who controls the keys or assets?", "Theft, access, insolvency and withdrawal risk"],
            ["How it works", "Spot, ETP, future or perpetual?", "Different settlement and payoff mechanics"],
            ["Asset & liquidity", "How deep is the real market?", "Spread, slippage and exit capacity"],
            ["Instrument leverage", "Margin, funding, liquidation?", "Losses can accelerate quickly"],
            ["Network/platform risk", "Operational, regulatory and venue risk?", "The chart does not show these risks"],
          ],
        },
      },
      {
        id: "spot-vs-derivatives",
        heading: "Spot crypto vs futures and perpetuals",
        answer:
          "Spot exposure and derivatives can track the same underlying asset while producing very different trading outcomes.",
        table: {
          caption: "Simplified crypto instrument comparison",
          headers: ["Feature", "Spot crypto", "Dated futures", "Perpetual derivative"],
          rows: [
            ["Expiry", "No contract expiry", "Specified expiry/settlement", "Usually no fixed expiry"],
            ["Leverage", "Depends on venue/financing", "Often available", "Often available"],
            ["Funding/roll", "No derivative funding rate", "Basis and contract roll matter", "Periodic funding can matter"],
            ["Liquidation", "Not from unleveraged ownership itself", "Possible when margined", "Possible when margined"],
            ["Custody", "Direct or third-party crypto custody", "Derivative account/counterparty", "Derivative account/counterparty"],
          ],
        },
        paragraphs: [
          {
            text:
              "Investor.gov describes crypto assets as assets generated, issued or transferred using blockchain or similar distributed-ledger technology and notes that different crypto assets can have significantly different characteristics and risks.",
            sources: ["sec-crypto-hub"],
          },
          {
            text:
              "The SEC and CFTC have also explained that Bitcoin futures are standardized derivative contracts and can introduce contract-roll and futures-market risks that are different from simply observing the Bitcoin spot price.",
            sources: ["sec-bitcoin-futures"],
          },
        ],
      },
      {
        id: "leverage-liquidation",
        heading: "Leverage and liquidation can dominate the chart",
        answer:
          "A technically small price move can become a large account move when leverage is high.",
        paragraphs: [
          {
            text:
              "Before using leverage, read the venue's initial margin, maintenance margin, mark-price, liquidation and funding rules. A stop-loss is not the same thing as a liquidation threshold, and relying on liquidation as the risk plan can expose the account to unnecessary losses and fees.",
          },
        ],
        bullets: [
          "Know whether liquidation uses last price, index price or mark price.",
          "Know whether margin is isolated to one position or shared across positions.",
          "Model the loss before the liquidation point, not only the hoped-for target.",
          "Include periodic funding and trading fees when comparing short-horizon strategies.",
          "Reduce leverage when volatility expands; leverage does not make the underlying less volatile.",
        ],
      },
      {
        id: "custody",
        heading: "Custody risk exists even when the trade idea is correct",
        answer:
          "A profitable price move is irrelevant if access to the asset or account is lost.",
        paragraphs: [
          {
            text:
              "Investor.gov's December 2025 custody bulletin explains that crypto wallets store the private keys or passcodes used to access crypto assets rather than storing the blockchain assets themselves. The bulletin recommends carefully researching third-party custodians, never sharing private keys or seed phrases, and using strong passwords and multi-factor authentication.",
            sources: ["sec-custody"],
          },
        ],
        bullets: [
          "Do not share private keys, seed phrases or authentication codes.",
          "Understand withdrawal policies and asset-transfer fees before depositing.",
          "Separate market risk from platform insolvency or operational risk.",
          "Treat screenshots of balances or 'proof of reserves' as different from audited financial statements.",
        ],
      },
      {
        id: "liquidity",
        heading: "Liquidity changes whether a technical setup is tradable",
        answer:
          "Technical levels are less useful when the order book is too thin to enter and exit near the intended prices.",
        bullets: [
          "Compare normal spread and market depth, not only 24-hour volume.",
          "Watch for abrupt changes around token listings, delistings and major announcements.",
          "Be cautious with low-float or concentrated tokens where a few holders can influence available supply.",
          "Assume slippage grows during fast moves, forced liquidations and venue outages.",
          "Do not infer market quality from a charting interface alone.",
        ],
      },
      {
        id: "crypto-technical-analysis",
        heading: "How to use DeepChart for crypto",
        answer:
          "Use the same structure-first process as other markets, then add crypto-specific liquidity and venue risk.",
        bullets: [
          "Start with higher-timeframe structure and major swing levels.",
          "Check whether the current move is trend continuation, range rotation or a volatility expansion.",
          "Use RSI/ADX/ATR and volume-related evidence as confirmation rather than standalone signals.",
          "Mark liquidation-sensitive areas and obvious equal highs/lows as potential liquidity zones.",
          "Define invalidation and position size before using leverage.",
          "Check token-specific news, network events and venue conditions before relying on a purely technical setup.",
        ],
      },
      {
        id: "crypto-scams",
        heading: "Treat guaranteed crypto returns and withdrawal demands as red flags",
        answer:
          "A legitimate chart does not make an investment offer legitimate.",
        paragraphs: [
          {
            text:
              "Investor.gov warns that crypto-related investments can be exceptionally volatile and speculative and that platforms may lack important investor protections. It also warns about fraud, hacking, platform failure and withdrawal risk.",
            sources: ["sec-crypto-alert"],
          },
          {
            text:
              "Be especially suspicious of guaranteed returns, pressure to move conversations to private messaging apps, requests to send crypto to an unfamiliar wallet, or a demand for additional 'taxes' or fees before a withdrawal is released.",
          },
        ],
      },
    ],
    faqs: [
      {
        q: "Is spot crypto safer than crypto futures?",
        a: "Unleveraged spot avoids derivative liquidation and funding mechanics, but it still has price, custody, platform and asset-specific risks. 'Safer' depends on which risks are being compared.",
      },
      {
        q: "What is a crypto perpetual contract?",
        a: "A perpetual is a derivative linked to an underlying crypto price that typically has no fixed expiry. Venues commonly use periodic funding payments and margin/liquidation rules to keep the contract near the reference market.",
      },
      {
        q: "What does 10x leverage mean in crypto?",
        a: "It generally means the position's economic exposure is about ten times the margin committed, subject to the venue's exact rules. That magnifies gains and losses, so a relatively small adverse move can consume a large share of margin.",
      },
      {
        q: "Can I lose crypto even if the market price rises?",
        a: "Yes. Custody theft, phishing, platform failure, liquidation on a different leveraged position, operational mistakes or withdrawal restrictions can cause losses that are separate from the asset's market direction.",
      },
      {
        q: "Does DeepChart work for Bitcoin and Ethereum?",
        a: "DeepChart supports selected crypto symbols such as Bitcoin and Ethereum where market data is available. The analysis remains educational and should be combined with venue, liquidity and instrument due diligence.",
      },
      {
        q: "Are crypto trading bots guaranteed to work?",
        a: "No. A bot can automate a rule set, but it cannot guarantee that historical relationships will persist. Strategy logic, overfitting, execution, fees, market regime and operational risk all matter.",
      },
    ],
    sources: [
      {
        id: "sec-crypto-hub",
        title: "Crypto Assets",
        publisher: "U.S. Securities and Exchange Commission / Investor.gov",
        date: "accessed October 2026",
        href: "https://www.investor.gov/additional-resources/spotlight/crypto-assets",
      },
      {
        id: "sec-custody",
        title: "Crypto Asset Custody Basics for Retail Investors — Investor Bulletin",
        publisher: "U.S. Securities and Exchange Commission / Investor.gov",
        date: "December 12, 2025",
        href: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/crypto-asset-custody-basics-retail-investors-investor-bulletin-0",
      },
      {
        id: "sec-crypto-alert",
        title: "Exercise Caution with Crypto Asset Securities — Investor Alert",
        publisher: "U.S. Securities and Exchange Commission / Investor.gov",
        date: "March 23, 2023",
        href: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-alerts/crypto-asset-securities",
      },
      {
        id: "sec-bitcoin-futures",
        title: "Funds Trading in Bitcoin Futures — Investor Bulletin",
        publisher: "SEC Office of Investor Education and Advocacy / CFTC Office of Customer Education and Outreach",
        date: "June 10, 2021",
        href: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/funds-trading-bitcoin-futures-investor-bulletin",
      },
    ],
    relatedLinks: [
      { label: "Open DeepChart crypto charts", href: "/chart-reader" },
      { label: "Trading risk management", href: "/blog/trading-risk-management-position-sizing" },
      { label: "Technical analysis guide", href: "/blog/deepchart-technical-analysis-guide" },
      { label: "Forex trading guide", href: "/blog/forex-trading-guide-pips-leverage-risk-india" },
    ],
  },
  {
    slug: "forex-trading-guide-pips-leverage-risk-india",
    category: "Forex",
    title: "Forex Trading Guide: Pips, Leverage, Risk & India Rules",
    h1: "Forex trading explained: currency pairs, pips, spreads, leverage and risk",
    description:
      "Learn forex trading from first principles: currency pairs, pips, lots, spreads, leverage, macro drivers, technical analysis and RBI rules for Indian residents.",
    excerpt:
      "Forex is not simply a chart that moves 24 hours a day. A currency pair compares two economies, the instrument may be leveraged, execution may be dealer-based, and Indian residents must also check whether the platform and transaction are permitted.",
    primaryKeyword: "forex trading",
    secondaryKeywords: [
      "forex trading for beginners",
      "forex trading India",
      "pips in forex",
      "forex leverage",
      "currency pair",
      "EUR USD analysis",
      "USD INR",
      "forex technical analysis",
      "RBI forex trading rules",
    ],
    published: "2026-10-05",
    updated: "2026-10-05",
    readingMinutes: 14,
    directAnswer:
      "Forex trading means taking exposure to the exchange rate between two currencies, such as EUR/USD or USD/INR. A good forex process combines pair mechanics, spread and financing costs, leverage, macroeconomic drivers, technical structure and platform/regulatory checks. For Indian residents, RBI says permitted forex transactions must be conducted with authorised persons and, when executed electronically, through authorised ETPs or recognised stock exchanges under the applicable rules.",
    uniqueAngle:
      "The DeepScreen PAIR framework—Platform, Asset relationship, Instrument costs, Risk—keeps forex analysis grounded in both the chart and the legal/execution structure behind the quote.",
    keyTakeaways: [
      "Every forex quote is a relationship between a base currency and a quote currency.",
      "Pips, spreads, financing and slippage convert chart movement into real trading economics.",
      "Leverage can make a small exchange-rate move a large account move.",
      "Interest-rate expectations, inflation, growth and central-bank policy are major macro inputs.",
      "Technical analysis should be combined with the economic calendar because data releases can rapidly change volatility.",
      "Indian residents should verify both the permitted transaction and the authorisation status of the person/platform with RBI sources.",
    ],
    sections: [
      {
        id: "pair-framework",
        heading: "Use PAIR before trading a currency pair",
        answer:
          "Forex analysis has four layers: Platform, Asset relationship, Instrument costs and Risk.",
        table: {
          caption: "DeepScreen PAIR forex checklist",
          headers: ["Layer", "Question", "Why it matters"],
          rows: [
            ["Platform", "Is the venue/person authorised for this transaction?", "Counterparty, legal and withdrawal risk"],
            ["Asset relationship", "What drives both currencies?", "A pair is relative, not a one-country bet"],
            ["Instrument costs", "Spread, commission, financing, lot size?", "Small costs matter in frequent trading"],
            ["Risk", "Leverage, stop, event risk, position size?", "FX moves can be amplified by margin"],
          ],
        },
      },
      {
        id: "currency-pairs",
        heading: "How currency pairs work",
        answer:
          "The first currency is the base and the second is the quote. The quoted price says how much quote currency is required for one unit of the base currency.",
        paragraphs: [
          {
            text:
              "If EUR/USD is 1.1000, the quote convention means one euro is priced at 1.10 US dollars. If EUR/USD rises, the euro has strengthened relative to the dollar under that quotation. USD/INR works the same way: a higher quote means more rupees per US dollar.",
          },
        ],
      },
      {
        id: "pips-spreads-lots",
        heading: "Pips, spreads and lot size",
        answer:
          "The chart move is only one part of the trade; position size and transaction cost determine its monetary effect.",
        table: {
          caption: "Core forex terms",
          headers: ["Term", "Meaning", "Trading implication"],
          rows: [
            ["Pip", "Conventional small unit of pair movement", "Used to express move and stop distance"],
            ["Bid", "Price at which the dealer/market buys", "Relevant when selling"],
            ["Ask", "Price at which the dealer/market sells", "Relevant when buying"],
            ["Spread", "Ask minus bid", "Immediate transaction cost"],
            ["Lot/contract size", "Amount of currency represented", "Determines pip value and exposure"],
            ["Financing/swap", "Cost or credit for carrying exposure", "Can accumulate over multi-day positions"],
          ],
        },
      },
      {
        id: "forex-leverage",
        heading: "Why forex leverage deserves special attention",
        answer:
          "Margin can make a very small currency move produce a large percentage gain or loss on account equity.",
        paragraphs: [
          {
            text:
              "The CFTC warns that OTC forex uses margin and that leverage amplifies both gains and losses. Its customer advisory also notes that in dealer-based OTC forex, the customer may be trading directly against the dealer rather than on an open exchange.",
            sources: ["cftc-forex-eight"],
          },
        ],
        bullets: [
          "Calculate full notional exposure, not only margin posted.",
          "Know the broker or exchange's maintenance-margin rules.",
          "Do not use liquidation or margin call as the planned exit.",
          "Size positions using stop distance and realistic slippage.",
          "Treat leverage offered by an unfamiliar offshore platform as a due-diligence issue, not a benefit by itself.",
        ],
      },
      {
        id: "macro-drivers",
        heading: "What moves a forex pair?",
        answer:
          "FX markets constantly reprice the relative outlook for two currencies.",
        bullets: [
          "Central-bank policy and expected interest-rate paths.",
          "Inflation and inflation expectations.",
          "Employment, growth and business-activity data.",
          "Trade and capital flows.",
          "Political and geopolitical risk.",
          "Broad risk sentiment and demand for funding or safe-haven currencies.",
        ],
        paragraphs: [
          {
            text:
              "Because the price is relative, strong data in one country can have little effect if the other side of the pair improves even more. This is why forex analysis should compare the two economies and policy paths rather than reading each currency independently.",
          },
        ],
      },
      {
        id: "technical-analysis-forex",
        heading: "How to combine DeepChart with forex fundamentals",
        answer:
          "Use the chart to define structure and risk; use the economic calendar to identify events capable of changing that structure.",
        bullets: [
          "Define the higher-timeframe trend and major support/resistance.",
          "Use the trading timeframe for entry structure and invalidation.",
          "Measure current volatility before choosing stop distance.",
          "Check momentum and divergence, but do not let one oscillator overrule price structure.",
          "Review the upcoming central-bank and high-impact data calendar before holding through an event.",
          "After a major release, let spread and volatility normalize before assuming old technical levels behave the same way.",
        ],
      },
      {
        id: "india-rbi",
        heading: "Forex trading in India: check RBI authorisation before the chart",
        answer:
          "For Indian residents, platform and transaction eligibility are part of risk management, not an afterthought.",
        paragraphs: [
          {
            text:
              "RBI's forex FAQ says resident persons may undertake forex transactions only with authorised persons and for permitted purposes under FEMA. It says permitted electronic forex transactions should be undertaken only on RBI-authorised ETPs or recognised stock exchanges—NSE, BSE and MSE—under the applicable terms.",
            sources: ["rbi-forex-faq"],
          },
          {
            text:
              "RBI also states that its Alert List is not exhaustive and that a platform not appearing on the list should not automatically be assumed to be authorised. Authorisation should be verified against RBI's authorised-person and authorised-ETP information.",
            sources: ["rbi-forex-faq"],
          },
          {
            text:
              "The same FAQ says resident individuals cannot use the Liberalised Remittance Scheme to remit margin overseas for online forex trading. Rules can change, so check RBI's current material before funding an account.",
            sources: ["rbi-forex-faq"],
          },
        ],
      },
      {
        id: "forex-fraud",
        heading: "Common forex fraud warning signs",
        answer:
          "Guaranteed returns and withdrawal obstacles are stronger warning signals than a professional-looking charting platform is a trust signal.",
        paragraphs: [
          {
            text:
              "The CFTC advises checking dealer registration and disciplinary history, warns about unregistered offshore dealers found through social media, and notes that fraudulent platforms may demand additional payments before allowing withdrawals.",
            sources: ["cftc-forex-eight"],
          },
        ],
        bullets: [
          "Guaranteed or unusually consistent returns.",
          "Pressure to deposit quickly or move to private messaging.",
          "No verifiable regulator registration or physical presence.",
          "Unusually high leverage marketed as a reason to trust the platform.",
          "Crypto-only funding without clear legal/entity information.",
          "Requests for extra 'tax', 'unlock' or 'verification' payments to release your own withdrawal.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is a pip in forex?",
        a: "A pip is a conventional unit used to describe a small price change in a currency pair. Its money value depends on the pair, position size and account currency.",
      },
      {
        q: "What is the spread in forex?",
        a: "The spread is the difference between the bid and ask price. It is one component of trading cost and can widen during illiquid periods or major news.",
      },
      {
        q: "Why is leverage common in forex?",
        a: "Major currency pairs often move in relatively small percentage increments, so margin is used to create larger economic exposure. The same leverage that magnifies gains also magnifies losses.",
      },
      {
        q: "Which forex timeframe is best?",
        a: "There is no universal best timeframe. Match the chart interval to the holding period and use a higher timeframe for context. Shorter intervals contain more noise and are more sensitive to spread and execution.",
      },
      {
        q: "Is online forex trading legal in India?",
        a: "Indian residents can undertake permitted forex transactions under FEMA, but RBI says they must use authorised persons and, for electronic execution, authorised ETPs or recognised exchanges under the applicable rules. Do not assume any global trading website is permitted for an Indian resident.",
      },
      {
        q: "Can DeepChart analyze EUR/USD and USD/INR?",
        a: "Yes, DeepChart includes supported forex symbols such as EUR/USD and USD/INR where data is available. Its technical reading is educational and does not replace platform, regulatory or macroeconomic due diligence.",
      },
    ],
    sources: [
      {
        id: "rbi-forex-faq",
        title: "Frequently Asked Questions — Foreign Exchange (Forex) Transactions",
        publisher: "Reserve Bank of India",
        date: "updated August 28, 2024; accessed October 2026",
        href: "https://www.rbi.org.in/Scripts/FAQDisplay.aspx?Id=146",
      },
      {
        id: "cftc-forex-eight",
        title: "Customer Advisory: Eight Things You Should Know Before Trading Forex",
        publisher: "U.S. Commodity Futures Trading Commission",
        date: "accessed October 2026",
        href: "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/CustomerAdvisory_MustKnowForex.html",
      },
      {
        id: "cftc-forex-fraud",
        title: "Forex Frauds",
        publisher: "U.S. Commodity Futures Trading Commission",
        date: "accessed October 2026",
        href: "https://www.cftc.gov/LearnAndProtect/forexfrauds",
      },
    ],
    relatedLinks: [
      { label: "Open DeepChart forex charts", href: "/chart-reader" },
      { label: "Trading risk management", href: "/blog/trading-risk-management-position-sizing" },
      { label: "Technical analysis guide", href: "/blog/deepchart-technical-analysis-guide" },
      { label: "Crypto trading guide", href: "/blog/crypto-trading-guide-spot-futures-risk" },
      { label: "Economic calendar", href: "/calendar" },
    ],
  },
];
