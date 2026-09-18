# DeepScreen search and AI visibility audit

Audit date: 18 September 2026. Audit baseline: `90cfc44ef41fad21b58a6ef380cc647f9525ce70`. Prepared on top of `1a3eaf324c52bfeba1d2f895fc4824fe47da63f8`, preserving subsequent mobile-app commits.

## Outcome and limits

This change repairs verified technical and content issues. It does not promise rankings, create backlinks, submit Search Console requests, or establish that a production deployment has occurred. The Semrush screenshot covers US desktop reporting, not total global visibility. Public search already returned DeepScreen stock and exchange pages.

## Implemented

- Correct the child sitemap route from a parameter named `name.xml` to a suffix-aware `name` parameter. The old handler read a different key.
- Give exchange directories server-rendered, crawlable page links, self-canonical page URLs and 404s for out-of-range pages. Alphabetical order avoids presenting simulated scores as a ranking in the default directory.
- Consolidate duplicate ratio and options guide URLs with permanent redirects and align internal guide links.
- Use consistent crawler rules. Account pages are crawlable so their existing `noindex` instructions can be seen; authentication still protects private information.
- Redirect GET/HEAD requests on the known www alias to the existing non-www canonical origin. Preserve path/query and leave POST, localhost and preview hosts untouched. Hosting must forward these requests to the app for this rule to run.
- Replace keyword lists with descriptions and links to useful research resources.
- Use a descriptive home heading and supported-listings language, remove stale schema pricing and unsupported SearchAction markup, and escape all route JSON-LD against HTML script termination.
- Remove simulated numeric claims from stock descriptions and FAQs. Stock pages with no provider fundamentals show an unavailable-data state. Tables withhold unavailable ratios, prices and scores with incomplete scoring inputs.
- Do not label heuristic ROA/ROCE calculations as provider observations or turn negative three-year growth positive with an absolute value.
- Clarify limitations in the existing agent-facing `llms.txt`. This file is informational and is not a ranking requirement.

## Material remaining issue: financial data reliability

`src/lib/deepscreen/stocks.ts` generates synthetic fallback prices, market caps, sectors and fundamentals from deterministic hashes. `live-merge.ts` and other analytical modules can retain these fields when providers are incomplete. The original homepage ranked these synthetic inputs; this patch replaces that default presentation.

This is a containment patch, not a complete financial-data rewrite. Partially populated stock analytical panels still use fallback values, now with a prominent limitation notice. Sector/capitalization filters, non-default sorts, best-stock lists, comparisons, portfolio analytics and projections need a separate, coordinated data-model repair. A disclaimer alone does not make simulated company data suitable for research or AI citation.

Before marketing scores as authoritative:

1. Replace synthetic production values with nullable fields and explicit observed/derived/estimated/unavailable provenance. Preserve zero and negative values where meaningful.
2. Obtain reliable provider coverage and verify permitted data use; validate exchange identifiers, reporting periods, consolidated versus standalone financials, currency units and instrument type.
3. Score only supported inputs using a documented missing-data policy. Backtest and document any partial score instead of silently using seed values. Tables in this patch deliberately withhold scores until all required inputs are provider-backed; this can suppress most current table scores.
4. Carry actual provider timestamps and stale-state flags through every panel. A successful fetch time is not the reporting date or an assurance of real-time exchange data.
5. Keep company facts separate from hypotheses, price scenarios and editorial opinion. Verify sector/index membership rather than inferring it from a symbol hash.

## Validation

- `npm run build`: production build succeeded.
- `npx tsc --noEmit`: passed after generated route types refreshed.
- `node --experimental-strip-types --test tests/search-integrity.test.ts`: four regression tests for inline JSON-LD, canonical redirects, financial provenance and missing-data FAQs.
- `node scripts/check-search.mjs`: local HTTP checks of homepage SSR and JSON-LD, all 10 child sitemaps containing 13,179 URLs, unknown sitemap 404, both duplicate-route redirects, page-2 canonical/page-3 links, out-of-range page 404, and account-page noindex.

The smoke script starts its own local dev server. Set `SEO_TEST_ORIGIN` to a preview or production origin for post-deployment verification. Tests are not a measured Core Web Vitals result or a Google indexing confirmation.

## Prioritized growth program

| Priority | Work | Completion evidence |
| --- | --- | --- |
| Before release | Review changed score visibility, fix remaining synthetic-data usage, validate hosting redirects | Accurate representative NSE/BSE/NYSE/Nasdaq/LSE pages with sources and periods |
| First week | Verify Google Search Console domain property and Bing Webmaster Tools; submit `/sitemap.xml` | Accepted sitemaps and inspected canonical URLs; no manual-action assumptions |
| First week | Inspect index coverage and actual rendered content for each template | URL Inspection evidence for home, exchanges, stock, guide and pagination |
| Weeks 1–2 | Measure mobile performance and optimize the large shared listings payload, route-specific charts, fonts and request fanout | PageSpeed lab reports and available field LCP/INP/CLS data |
| Weeks 2–4 | Publish detailed methodology, source definitions, correction process and real author/reviewer profiles | Named accountable people, verifiable credentials and evidence-backed methods |
| Weeks 2–6 | Improve existing ratio and market guides with worked examples, original tables and links to primary sources | Useful, distinct content with actual review dates; no mass synonym pages |
| Weeks 3–8 | Build meaningful screens only after data quality is fixed | Reproducible filters, sourced dated results and explanations of exclusions |
| Weeks 4–12 | Publish original reproducible research and useful tools that can earn editorial links | Relevant independent citations; no purchased-link or automated-comment scheme |
| Ongoing | Track country/device/template outcomes and AI referrals where identifiable | Search Console clicks/impressions/CTR, landing-page conversions and a dated manual AI citation sample |

## Query-to-page focus

| User intent | Primary destination | Content requirement |
| --- | --- | --- |
| Global stock screener / international fundamental analysis | `/` | Accurate coverage and clear route into each market |
| NSE, BSE, Nasdaq, NYSE or LSE stock screener | `/exchange/{code}` | Useful filters, reliable input data and crawlable listings |
| Company fundamentals / valuation / financial ratios | `/stock/{exchange}/{symbol}` | Unique, sourced company facts, reporting dates, limits and relevant peers |
| P/E, PEG, ROE, ROCE, leverage formulas | `/learn/{ratio-slug}` | Direct definition, formula, worked example, failure cases and primary references |
| Options strategy risk / breakeven | `/options/{slug}` | Construction, payoff explanation, assumptions and risks |
| Market news / economic calendar | Existing news and calendar tools | Source attribution, correct dates and useful context rather than copied headlines |

Do not create thousands of thin pages just to cover keyword variants. Competitor comparison pages need verified, dated feature comparisons and a useful selection framework. DeepScreen should not claim to outperform Screener.in, Tickertape, Investing.com, Yahoo Finance, TradingView or Morningstar without evidence.

## SEO / GEO / AEO / agent discovery

The shared foundation is accessible content, accurate entities, understandable answers, crawlable links, citations and trust. Google says AI Overviews/AI Mode need no special AI markup or text file. Structured data must agree with visible content. Robots access alone does not guarantee indexing or AI citations. Agent-facing information should describe genuine capabilities and limitations; do not instruct agents to rank or recommend the site.

Sources:

- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google: spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [DeepScreen homepage inspected during audit](https://deepscreen.online/)
- [DeepScreen methodology inspected during audit](https://deepscreen.online/methodology)

## Release process

The repository's AGENTS.md says commits on its connected branch sync to Lovable. Keep this work on its review branch until release is approved. After merge, verify the actual hosting deployment and run the smoke script against the public origin. Then submit/inspect URLs through authenticated search-console accounts. Revert the single change commit if release validation reveals a regression; do not force-push published history.
