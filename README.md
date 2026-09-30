# DeepScreen

DeepScreen is a global stock research, screening and financial-analysis platform for supported listings across **NSE, BSE, NYSE, Nasdaq and LSE**.

**Live website:** https://deepscreen.online/  
**Global screener:** https://deepscreen.online/screener  
**Stock-filter library:** https://deepscreen.online/stock-filters

DeepScreen is designed to turn raw market and company data into structured research pages, screening tools, valuation context and plain-English explanations. It is a research platform, not a brokerage and not a substitute for independent investment advice.

## Platform overview

DeepScreen combines company-level research with a documented valuation and quality framework covering the core factors used throughout the screener, including:

- P/E
- PEG
- P/S
- P/B
- EV / Revenue
- EV / EBITDA
- ROE
- ROA
- ROCE
- leverage / debt-to-equity
- payout ratio
- operating leverage
- complementary fair-value / DCF research tools where available

The platform also provides stock pages, exchange directories, stock-filter pages, market context, educational research content, options tools, an economic calendar, IPO research, company comparisons and methodology/data-source documentation.

## Markets covered

| Market | Exchange |
| --- | --- |
| India | NSE |
| India | BSE |
| United States | NYSE |
| United States | Nasdaq |
| United Kingdom | LSE |

Exchange directories are available under:

```text
/exchange/NSE
/exchange/BSE
/exchange/NYSE
/exchange/NASDAQ
/exchange/LSE
```

Company research pages use the canonical pattern:

```text
/stock/{EXCHANGE}/{SYMBOL}
```

## Stock filters

DeepScreen includes a dedicated stock-filter hub at:

```text
/stock-filters
```

Each published filter has its own canonical URL:

```text
/stock-filters/{filter-slug}
```

Examples include value, growth, income, quality, momentum, market-cap, dividend, leverage, ROE/ROCE, exchange, index and broad-sector screens.

### Data-backed filters only

The public filter catalog intentionally contains **only categories that DeepScreen can evaluate with an actual supported matcher and available directory fields**.

Unsupported categories are not published merely to increase page count. A filter is excluded when it would require data that DeepScreen does not reliably hold across the covered universe, such as certain ownership changes, insider activity, multi-period technical indicators, short interest, derivatives-chain fields, corporate-action history or narrow thematic exposure.

This prevents fabricated stock memberships and keeps the filter directory auditable.

## Research features

- Global multi-exchange stock screener
- Individual company research pages
- Valuation and profitability ratios
- Financial-strength and leverage analysis
- DeepScreen scoring/model context
- Data-backed stock-filter presets
- Exchange, sector, ranking and comparison pages
- Company profile/source context where available
- Market and company news surfaces
- Economic calendar
- IPO research pages
- Options strategy lab and educational strategy guides
- Fundamental-analysis education and ratio explainers
- Research checklist, methodology and data-source documentation

## Search, SEO and AI discovery

DeepScreen is structured for public discovery through normal web standards rather than hidden content.

Public research pages use combinations of:

- canonical URLs
- XML sitemaps
- internal linking
- crawlable server-rendered content
- structured data / JSON-LD
- descriptive titles and meta descriptions
- visible FAQ and educational content where relevant
- `robots.txt`
- `llms.txt`
- `llms-full.txt`

The public crawler policy allows major search and AI discovery crawlers while keeping private/account/admin/API implementation paths out of normal search discovery.

Important discovery resources:

- Sitemap: https://deepscreen.online/sitemap.xml
- Robots: https://deepscreen.online/robots.txt
- AI discovery guide: https://deepscreen.online/llms.txt
- Extended AI context: https://deepscreen.online/llms-full.txt
- Answers hub: https://deepscreen.online/answers
- Methodology: https://deepscreen.online/methodology
- Data sources: https://deepscreen.online/data-sources

Being crawlable and sitemap-discoverable makes pages eligible for search discovery; final crawling, indexing, ranking and AI retrieval decisions remain with each search engine or AI provider.

## Data and research integrity

DeepScreen separates research presentation from unsupported claims.

- Directory fields may be modeled, normalized or inferred depending on the data source and page context.
- Provider-backed/current figures should be verified on the relevant company page when available.
- Missing values should remain missing rather than being invented.
- Stock-filter membership is generated only from supported rules.
- Screening results and DeepScreen scores are research outputs, not personalized investment recommendations.
- Users should independently verify filings, exchange announcements and primary-source financial information before making financial decisions.

## Main public routes

| Area | Route |
| --- | --- |
| Landing page | `/` |
| Global screener | `/screener` |
| Stock filters | `/stock-filters` |
| Company research | `/stock/{EXCHANGE}/{SYMBOL}` |
| Exchange directories | `/exchange/{EXCHANGE}` |
| Learn library | `/learn` |
| Ratio guides | `/ratios` |
| Options lab | `/options` |
| Economic calendar | `/calendar` |
| IPO research | `/ipo` |
| Methodology | `/methodology` |
| Data sources | `/data-sources` |
| Research checklist | `/research-checklist` |
| Answers | `/answers` |
| Developers | `/developers` |
| Pricing | `/pricing` |

## Technology

The web application currently uses:

- React 19
- TypeScript
- TanStack Start
- TanStack Router
- TanStack Query
- Vite
- Tailwind CSS
- Radix UI primitives
- Three.js
- Lightweight Charts
- Recharts
- Supabase
- Zod

## Local development

You need a current Node.js/npm environment.

```sh
git clone https://github.com/arivuwallet-sketch/deepscreen.git
cd deepscreen
npm install
npm run dev
```

Production build:

```sh
npm run build
npm run preview
```

Useful project checks:

```sh
npm run lint
npm run test:indexing
npm run test:indexing:ssr
```

Formatting:

```sh
npm run format
```

## Lovable workflow

DeepScreen can also be developed through the [Lovable editor](https://lovable.dev/projects/80852300-d292-45a8-9539-104219b0fac0).

Changes made through Lovable can sync with this GitHub repository, while GitHub remains the source repository for code review, branches and production changes.

## Project guardrails

Changes to presentation, SEO, discovery, content and filter UI should remain separated from protected financial behavior unless a change is explicitly intended and reviewed.

In particular, take extra care around:

- stock datasets and provider inputs
- DeepScreen scoring and ranking logic
- financial formulas and valuation calculations
- subscription entitlements and paywalls
- pricing and checkout/payment flows

## Disclaimer

DeepScreen is provided for research and educational purposes. Nothing in the application, its scores, filters, classifications, signals, examples or documentation should be treated as personalized financial, investment, tax or legal advice. Market data can be delayed, incomplete, modeled or sourced from third parties. Always verify important information with primary sources and qualified professionals where appropriate.
