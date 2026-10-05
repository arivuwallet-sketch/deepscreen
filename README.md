# DeepScreen

DeepScreen is a global stock screener, company-research, technical-analysis and market-education platform covering supported listings across **NSE, BSE, NYSE, Nasdaq and LSE**.

It combines fundamental analysis, valuation, stock filtering, technical analysis, options modeling, portfolio research, funds/ETF/REIT analysis, commodities, IPO research, market education and public search/AI discovery in one research workspace.

> DeepScreen is a research and education platform. It is not a brokerage, does not execute trades, and does not guarantee future prices, returns or investment outcomes.

## Live product

- Website: https://deepscreen.online/
- Global screener: https://deepscreen.online/screener
- Stock filters: https://deepscreen.online/stock-filters
- DeepChart: https://deepscreen.online/chart-reader
- Trading education: https://deepscreen.online/trading
- Investments: https://deepscreen.online/investments
- Options Strategy Lab: https://deepscreen.online/options
- Research blog: https://deepscreen.online/blog
- Knowledge index: https://deepscreen.online/knowledge

---

## Platform overview

DeepScreen is built around several connected research layers:

1. **Global stock screening and company research**
2. **13-factor fundamental scoring and valuation context**
3. **DeepChart technical analysis**
4. **Options strategy modeling**
5. **Mutual fund, ETF and REIT research**
6. **Commodity and market-guide research**
7. **Portfolio/watchlist research tools**
8. **Trading, crypto, forex and personal-finance education**
9. **Search, SEO, AEO, GEO and AI-crawler discovery infrastructure**
10. **Developer and machine-readable research resources**

The goal is to make research explainable: raw values, modeled outputs, source context, limitations and educational explanations are kept visible wherever possible.

---

# 1. Global stock screener

DeepScreen supports company discovery and screening across five major exchanges:

| Country / market | Exchange |
| --- | --- |
| India | NSE |
| India | BSE |
| United States | NYSE |
| United States | Nasdaq |
| United Kingdom | LSE |

Main exchange directories use:

```text
/exchange/NSE
/exchange/BSE
/exchange/NYSE
/exchange/NASDAQ
/exchange/LSE
```

Company pages use:

```text
/stock/{EXCHANGE}/{SYMBOL}
```

### Screener capabilities

- Multi-exchange company search
- Exchange filtering
- Market-cap filtering
- Sector filtering
- Index filtering
- Company-name and ticker search
- Sortable company tables
- Core valuation and quality ratios
- Live/provider-backed quote context where available
- Exchange-specific stock directories
- Sector-specific directories
- Ranking pages
- Company-comparison pages
- Peer research
- Stock-filter presets
- Public index/sector membership context

DeepScreen keeps screening separate from execution. The platform does not place trades.

---

# 2. Fundamental analysis framework

DeepScreen's core company-research framework covers the major valuation, profitability, leverage and cash-return dimensions used throughout the platform.

### Core factor set

- P/E
- PEG
- P/S
- P/B
- EV / Revenue
- EV / EBITDA
- ROE
- ROA
- ROCE
- Debt / Equity
- Payout ratio
- Operating leverage
- DCF / fair-value context where available

Additional pages and panels may also use supporting figures such as margins, growth, dividend yield, market capitalization, EPS and related balance-sheet/valuation metrics.

### DeepScreen score and verdict

Company research can include:

- DeepScreen score out of 100
- Verdict classification
- Strengths
- Risks
- Score explanations
- Score-change context
- Holding-period research
- Target-price context
- Trim-level context
- Stop-loss research context
- Long-horizon Vision & Utility analysis
- Secret Tips / research badges
- Forensic research checks
- Peer comparison

Scores and verdicts are analytical model outputs, not personalized financial advice.

---

# 3. Valuation tools

DeepScreen includes valuation-oriented research tools and context such as:

- Discounted Cash Flow (DCF)
- Graham-style intrinsic-value research
- Relative valuation ratios
- P/E
- PEG
- P/B
- P/S
- EV / Revenue
- EV / EBITDA
- Profitability and return metrics
- Leverage context
- Margin context
- Growth context

Valuation results depend on assumptions and source data. They should not be treated as guaranteed target prices.

---

# 4. Stock-filter library

DeepScreen has a dedicated filter directory:

https://deepscreen.online/stock-filters

Each filter has its own canonical URL:

```text
/stock-filters/{filter-slug}
```

### Filter categories include

- Value stocks
- Growth stocks
- Quality stocks
- Income stocks
- Dividend stocks
- Momentum stocks
- Market-cap screens
- Low/high debt screens
- ROE / ROCE screens
- P/E / P/B / PEG screens
- Index-membership screens
- Exchange screens
- Sector screens
- Liquidity / volume screens
- Price-movement screens
- Sustainable-growth screens
- Defensive / cyclical screens
- Graham-style screens
- GARP-style screens
- Global market screens

### Data-backed-filter policy

DeepScreen does not intentionally publish arbitrary stock memberships just to create pages.

A public filter is expected to have a supported rule and underlying data. Categories that require unavailable or insufficiently verified fields can be documented as research concepts instead of being populated with guessed memberships.

---

# 5. DeepChart — technical analysis workspace

DeepChart is DeepScreen's multi-market technical-analysis workspace:

https://deepscreen.online/chart-reader

It supports technical research across stocks, indices, forex, crypto and commodities.

### Built-in market shortcuts

**Crypto**
- Bitcoin
- Ethereum
- Solana
- XRP

**Forex**
- EUR/USD
- GBP/USD
- USD/JPY
- USD/INR

**Commodities**
- Gold
- Silver
- Crude Oil
- Natural Gas

**Stocks**
- Apple
- Nvidia
- Tesla
- Reliance Industries

**Indices**
- S&P 500
- Nasdaq
- Nifty 50
- Dow Jones

Custom compatible market symbols can also be entered.

### Timeframes

- 1 minute
- 5 minutes
- 15 minutes
- 1 hour
- 4 hours
- 1 day
- 1 week

DeepChart also pairs the selected timeframe with a higher timeframe for broader context where applicable.

### Technical-analysis capabilities

DeepChart combines multiple forms of evidence instead of relying on one indicator.

The analysis engine includes or uses:

- Candlestick structure
- Trend bias
- Higher-timeframe bias
- Support and resistance
- Swing structure
- Market regime context
- EMA 20
- EMA 50
- EMA 200
- RSI
- Stochastic RSI
- ADX
- ATR
- CCI
- MFI
- VWAP
- Supertrend
- Fibonacci retracements
- Volume context
- Volume profile
- Point of Control
- Liquidity pools
- Order blocks
- Fair Value Gaps
- Smart Money Concepts
- Divergence detection
- Technical levels
- Confluence scoring
- Confidence context

### DeepChart trade-plan research

Where sufficient data is available, DeepChart can generate educational trade-management context such as:

- Directional reading
- Entry area
- Deep-entry context
- Stop level
- Multiple targets
- Trailing-stop level
- Reward/risk context
- Exit rules
- Position-sizing notes
- Reasoning / confluence
- Playbook analysis

These are research outputs, not guaranteed signals.

### TradingView partner integration

DeepChart includes a TradingView partner CTA for users who want to continue chart research using TradingView's broader charting ecosystem.

---

# 6. Trading, crypto and forex education

DeepScreen includes a dedicated trading education hub:

https://deepscreen.online/trading

The content is designed around risk-first explanations rather than guaranteed trading claims.

### Trading topics

- Trading basics
- Risk management
- Position sizing
- Stop-loss logic
- Reward-to-risk
- R-multiples
- Trading expectancy
- Leverage risk
- Trading journals
- Multi-timeframe analysis
- Support/resistance
- Technical-analysis limitations

### Crypto topics

- Crypto trading basics
- Spot trading
- Futures
- Perpetual derivatives
- Leverage
- Liquidation
- Funding
- Custody
- Wallet security
- Liquidity
- Volatility
- Bitcoin technical analysis
- Ethereum technical analysis
- Platform/counterparty risk

### Forex topics

- Currency pairs
- Base and quote currency
- Pips
- Spreads
- Lot size
- Leverage
- Margin
- Position sizing
- Forex technical analysis
- Interest-rate effects
- Macro drivers
- Economic-calendar risk
- RBI-related guidance for Indian residents
- Platform/authorization risk

DeepScreen also publishes dedicated long-form research articles on DeepChart, risk management, crypto and forex.

---

# 7. Options Strategy Lab

DeepScreen includes an options modeling and education workspace:

https://deepscreen.online/options

### Model inputs

- Underlying symbol
- Provider spot price where available
- Manual scenario spot
- Implied/assumed volatility
- Risk-free rate
- Dividend yield
- Days to expiry
- Market outlook filtering

### Greeks and analytics

The options engine uses Black-Scholes-Merton style calculations and can display:

- Delta
- Gamma
- Theta
- Vega
- Rho
- Net debit / credit
- Strategy payoff
- Breakeven levels
- Maximum profit
- Maximum loss
- Probability-of-profit estimates
- Multi-leg payoff charts

### 12 modeled strategy types

The current strategy engine models:

- Long Call
- Long Put
- Bull Call Spread
- Bull Put Spread
- Bear Call Spread
- Bear Put Spread
- Put Backspread (Ratio)
- Short Strangle
- Collar
- Long Call Butterfly
- Short Straddle
- Long Straddle

DeepScreen also publishes individual strategy education pages.

Calculated option premiums are theoretical estimates, not executable option-chain quotes.

---

# 8. Mutual funds

Mutual-fund research is available at:

https://deepscreen.online/mutual-funds

The wider investment directory is:

https://deepscreen.online/investments

### Mutual-fund research includes

- NAV
- AMFI-linked NAV context for supported Indian funds
- NAV history
- Rolling returns
- Drawdown
- Benchmark-relative performance
- Expense ratio / TER
- Direct vs Regular plan distinction where identified
- Portfolio / holdings context
- Risk measures
- Sharpe ratio
- Sortino ratio
- Standard deviation
- Alpha / beta context
- Exit-load context
- Manager / tenure evidence where available
- Fund comparison
- Public FAQ and educational explanations

Mutual funds are analyzed with fund-specific logic rather than the company-stock score.

---

# 9. ETF research

ETF research is available at:

https://deepscreen.online/etfs

### ETF research includes

- ETF price/NAV context
- Holdings
- Portfolio concentration
- Expense ratio
- Tracking error
- Tracking difference
- Premium / discount to NAV
- Liquidity
- Volume
- Bid/ask-spread context
- AUM context
- Volatility
- Index/basket quality
- Return context
- ETF comparison
- Public ETF FAQ

ETFs are assessed as portfolios/market vehicles, not as operating companies.

---

# 10. REIT research

REIT research is available at:

https://deepscreen.online/reits

### REIT research includes

- Occupancy
- WALE
- Tenant concentration
- NOI context
- NDCF
- AFFO
- FFO-related context
- Distribution yield
- Distribution coverage
- Debt / leverage
- LTV
- Debt-maturity context
- NAV
- Cap-rate context
- Property cash flow
- REIT valuation
- Public REIT FAQ

REITs use property/cash-flow analysis rather than the normal stock-company scoring model.

---

# 11. Investment directory

The central investment directory is:

https://deepscreen.online/investments

It brings together:

- Mutual funds
- ETFs
- REITs
- Market filtering
- Product-type filtering
- Search
- Pagination
- Live/provider-backed exchange-traded prices where available
- Fund-specific, ETF-specific and REIT-specific research paths
- FAQ / schema / search discovery

---

# 12. Commodities

Commodity research is available at:

https://deepscreen.online/commodities

The commodity workspace covers major benchmarks such as:

- Gold
- Silver
- WTI crude oil
- Natural gas
- Copper

Features include, where available:

- Timestamped prices
- Futures context
- Daily charts
- Moving averages
- RSI
- Trend analysis
- Support/resistance context
- Source-linked market information
- Commodity FAQ
- Links into DeepChart for deeper technical research

---

# 13. GIFT Nifty research

GIFT Nifty education and market context are available at:

https://deepscreen.online/gift-nifty

Topics include:

- What GIFT Nifty is
- NSE IX context
- Trading-session/timing explanations
- Relationship with Nifty 50
- Difference from the former SGX Nifty arrangement
- Futures basis
- How traders use GIFT Nifty as pre-market context
- Limitations of using GIFT Nifty as a guaranteed opening prediction
- FAQ and source-backed educational material

---

# 14. IPO research and IPO GMP education

### IPO research

https://deepscreen.online/ipo

DeepScreen provides IPO research and pipeline context across supported markets.

Depending on the issue/data available, research can include:

- IPO pipeline
- Price-band context
- Lot-size context
- Subscription context
- Valuation context
- Risk discussion
- Listing research
- IPO education

### IPO GMP

https://deepscreen.online/ipo-gmp

The IPO GMP guide explains:

- Grey Market Premium
- How GMP is interpreted
- GMP formula examples
- Positive vs negative GMP
- GMP vs listing price
- GMP vs subscription
- Reliability limitations
- Risks of unofficial grey-market information

DeepScreen does not present unofficial GMP as a guaranteed listing-price predictor.

---

# 15. Economic calendar and market context

DeepScreen includes an economic calendar at:

https://deepscreen.online/calendar

The calendar is used alongside broader research to help users account for scheduled macro events that can affect market volatility.

The platform also includes:

- General market context
- Company news
- Market news surfaces
- IPO events
- Macro-event context
- Cross-links into company and technical research

---

# 16. My Stocks / portfolio research

DeepScreen includes a personal research/watchlist area under:

```text
/portfolio
```

Features include:

- Saved stocks
- Portfolio/watchlist research
- Portfolio X-Ray
- Portfolio health context
- Concentration analysis
- Risk matrix
- Research alerts
- Cross-stock research context

Portfolio outputs are research aids, not portfolio-management or brokerage services.

---

# 17. Research Desk

DeepScreen has a dedicated personal research workspace:

```text
/research-desk
```

The Research Desk supports organization of investment research such as:

- Watchlists
- Research notes
- Source documents
- Manually entered holdings
- Local research organization
- Backup/export workflows
- CSV export/import-related workflows where supported

The Research Desk is intentionally treated as a personal workspace rather than a public search landing page.

---

# 18. Company comparison and peer research

DeepScreen provides:

- Company-vs-company comparison pages
- Side-by-side ratios
- Score / verdict context
- Peer comparisons
- Industry / sector context
- Valuation comparison
- Profitability comparison
- Leverage comparison
- Growth comparison
- Market-cap context

Comparison pages are intended to help identify differences, not automatically choose a winner.

---

# 19. Research blog

DeepScreen publishes a structured research blog:

https://deepscreen.online/blog

Current content areas include:

### Investing and markets
- Mutual funds
- ETFs
- REITs
- Commodities
- GIFT Nifty
- IPOs
- Retail-investor statistics
- Market research

### DeepChart and trading
- How to read a trading chart
- Technical analysis
- Trading risk management
- Position sizing
- Stop-losses
- Reward-to-risk
- R-multiples

### Crypto
- Spot vs futures
- Perpetual derivatives
- Leverage
- Liquidation
- Funding
- Custody
- Platform risk

### Forex
- Currency pairs
- Pips
- Spreads
- Leverage
- Macro drivers
- Technical analysis
- India-specific regulatory context

### Personal finance
- Save Money
- Protect Money
- Make More Money
- Subscription/recurring-payment audits
- UPI/bank-fraud response
- Freelancing pricing, profit and tax basics

Structured posts can include:

- Direct-answer summaries
- Key takeaways
- Tables
- FAQs
- Primary sources
- Internal links
- Schema markup
- Publication/update dates
- RSS discovery

RSS feed:

https://deepscreen.online/blog/feed.xml

---

# 20. Answers, FAQs and knowledge index

DeepScreen has several public answer/discovery layers.

### Answers hub

https://deepscreen.online/answers

Contains concise answers covering:

- DeepScreen
- Stock-market basics
- Fundamental analysis
- Valuation
- Financial ratios
- Stock screening
- Investment research

### Knowledge index

https://deepscreen.online/knowledge

The knowledge index inventories public:

- Q&A
- FAQ
- Blog articles
- Learn content
- Ratio FAQs
- Market-guide FAQs
- Investment FAQs
- DeepChart FAQs
- Trading FAQs
- Crypto FAQs
- Forex FAQs
- Options questions

### Plain-text FAQ index

https://deepscreen.online/faq-index.txt

This provides a lightweight machine-readable discovery layer for search engines and AI systems.

---

# 21. Learn library and ratio education

DeepScreen includes an educational library under:

```text
/learn
```

and financial-ratio guides under:

```text
/ratios
```

Topics include:

- Fundamental analysis
- Candlestick reading
- Valuation
- Profitability
- Capital efficiency
- Leverage
- Financial ratios
- Screening concepts
- Research methodology
- Options education
- Market terminology

Educational pages are designed to explain both the formula and the limitations of the metric.

---

# 22. Search, SEO, AEO, GEO and AI discovery

DeepScreen uses normal open-web discovery mechanisms rather than hidden crawler-only pages.

### Discovery infrastructure

- Server-rendered public content
- Canonical URLs
- XML sitemap
- Sitemap `lastmod` dates for structured blog posts
- Internal linking
- Breadcrumbs
- Structured data / JSON-LD
- FAQPage schema where appropriate
- BlogPosting schema
- WebPage / WebSite / Organization schema
- Search-focused titles
- Meta descriptions
- Page-specific keyword mapping
- Visible FAQ/Q&A copy
- Stable FAQ anchor URLs
- Research RSS feed
- `robots.txt`
- `llms.txt`
- `llms-full.txt`
- `faq-index.txt`
- Developer resources
- IndexNow submission tooling

### Important discovery URLs

- Sitemap: https://deepscreen.online/sitemap.xml
- Robots: https://deepscreen.online/robots.txt
- AI site guide: https://deepscreen.online/llms.txt
- Extended AI context: https://deepscreen.online/llms-full.txt
- FAQ text index: https://deepscreen.online/faq-index.txt
- Knowledge index: https://deepscreen.online/knowledge
- Answers hub: https://deepscreen.online/answers
- Blog RSS: https://deepscreen.online/blog/feed.xml
- Methodology: https://deepscreen.online/methodology
- Data sources: https://deepscreen.online/data-sources
- Developers: https://deepscreen.online/developers

### AI/search crawler policy

DeepScreen's public crawler configuration is intended to permit major compliant search and AI discovery agents to crawl public research content while private/account/admin areas remain protected.

The current crawler policy explicitly accounts for major agents from ecosystems including Google, Bing, OpenAI, Anthropic, Perplexity, Apple, Meta and Common Crawl, plus a permissive wildcard rule for other compliant public-content crawlers.

Crawlability does not guarantee indexing, ranking, citation or inclusion by any search engine or AI provider.

---

# 23. Data sources and research integrity

DeepScreen is designed to distinguish source-backed data from modeled or inferred research.

Principles include:

- Missing data should not be invented.
- Provider-backed values should be identified when available.
- Modeled or inferred directory values should be treated as research inputs rather than audited financial statements.
- Stock filters should use explicit rules.
- Current company facts should be checked against primary filings/exchange sources when material.
- Technical signals are probabilistic research outputs.
- Option prices are modeled estimates unless explicitly sourced from a live executable chain.
- GIFT Nifty and IPO GMP education should not be interpreted as guaranteed forecasts.
- Crypto/forex research should be combined with venue, legal, custody and leverage due diligence.

Supporting pages:

- https://deepscreen.online/methodology
- https://deepscreen.online/data-sources
- https://deepscreen.online/research-checklist

---

# 24. DeepScreen Pro and pricing

Pricing page:

https://deepscreen.online/pricing

Current paid durations are:

| Plan | Price | Access period |
| --- | ---: | ---: |
| Weekly | ₹50 | 7 days |
| Monthly | ₹175 | 30 days |
| Yearly | ₹1,800 | 365 days |

Payment flow is integrated with Cashfree and supports the methods made available by the checkout provider, including UPI/card/net-banking options where available.

The current Pricing page describes Free access around search/raw research and Pro access around deeper model outputs such as:

- 13-factor verdict
- Holding-period / target / trim / stop research
- DCF and Graham valuation
- Vision & Utility score
- Secret Tips research badges
- Forensic breakdowns
- Advanced ratios
- Contextual ratio insights
- Portfolio X-Ray
- Research alerts

Subscription state is tied to authenticated user entitlements and paid-order history.

---

# 25. Public route map

| Area | Route |
| --- | --- |
| Home | `/` |
| Global screener | `/screener` |
| Investments | `/investments` |
| Mutual funds | `/mutual-funds` |
| ETFs | `/etfs` |
| REITs | `/reits` |
| Stock filters | `/stock-filters` |
| Stock-filter detail | `/stock-filters/{slug}` |
| Company research | `/stock/{EXCHANGE}/{SYMBOL}` |
| Exchange directory | `/exchange/{EXCHANGE}` |
| Sector directory | `/sector/{EXCHANGE}/{SECTOR}` |
| DeepChart | `/chart-reader` |
| Trading education | `/trading` |
| Commodities | `/commodities` |
| GIFT Nifty | `/gift-nifty` |
| IPO GMP | `/ipo-gmp` |
| Options Strategy Lab | `/options` |
| Options guide | `/options/{slug}` |
| Economic calendar | `/calendar` |
| IPO research | `/ipo` |
| My Stocks / portfolio | `/portfolio` |
| Research Desk | `/research-desk` |
| Learn library | `/learn` |
| Learn article | `/learn/{slug}` |
| Ratio guides | `/ratios` |
| Company comparisons | `/compare` |
| Research blog | `/blog` |
| Blog article | `/blog/{slug}` |
| Answers | `/answers` |
| Knowledge index | `/knowledge` |
| Methodology | `/methodology` |
| Data sources | `/data-sources` |
| Research checklist | `/research-checklist` |
| Developers | `/developers` |
| Pricing | `/pricing` |
| Contact | `/contact` |
| About | `/about` |
| Press | `/press` |
| Terms | `/terms` |
| Privacy | `/privacy` |
| Refund policy | `/refund-policy` |

---

# 26. Technology stack

The current web application uses:

- React 19
- TypeScript
- TanStack Start
- TanStack Router
- TanStack Query
- Vite
- Tailwind CSS
- Radix UI
- Lightweight Charts
- Recharts
- Three.js
- Supabase
- Zod
- AI SDK packages
- Lucide icons
- date-fns
- React Hook Form
- Sonner
- Motion
- Shiki
- Streamdown

The application is structured around typed route modules, server functions, reusable research components and shared SEO/discovery utilities.

---

# 27. Local development

Requirements:

- Current Node.js runtime
- npm

Clone and install:

```sh
git clone https://github.com/arivuwallet-sketch/deepscreen.git
cd deepscreen
npm install
```

Run development server:

```sh
npm run dev
```

Production build:

```sh
npm run build
npm run preview
```

Lint:

```sh
npm run lint
```

Format:

```sh
npm run format
```

Indexing tests:

```sh
npm run test:indexing
npm run test:indexing:ssr
```

IndexNow:

```sh
npm run indexnow:dry-run
npm run indexnow:submit
```

---

# 28. Lovable workflow

DeepScreen is connected to Lovable:

https://lovable.dev/projects/80852300-d292-45a8-9539-104219b0fac0

GitHub remains the source repository for code review, branches and production changes. Commits made to connected branches can sync with Lovable, so repository history should remain clean and non-destructive.

---

# 29. Project guardrails

DeepScreen contains financial models, live/provider data paths, authentication, subscription state and payment flows. Changes should be scoped carefully.

Extra care is required around:

- Stock datasets
- Provider integrations
- Fundamental calculations
- 13-factor scoring
- Verdict logic
- Ranking logic
- Valuation formulas
- DeepChart analysis
- Options calculations
- Subscription entitlements
- Cashfree checkout/payment verification
- Authentication
- Sitemap/discovery generation
- Public financial claims

Presentation/content/SEO changes should not silently change financial behavior.

---

# 30. Disclaimer

DeepScreen is provided for research and educational purposes only.

Nothing in DeepScreen—including scores, verdicts, rankings, filters, technical signals, trade-plan examples, valuations, target prices, option calculations, crypto/forex education, IPO research or portfolio analysis—should be interpreted as personalized investment, financial, tax or legal advice.

Market data may be delayed, incomplete, modeled, inferred or supplied by third-party providers. Technical and fundamental models can fail. Past performance does not guarantee future results.

Always verify material information with primary sources, official exchange/regulator filings and qualified professionals where appropriate.
