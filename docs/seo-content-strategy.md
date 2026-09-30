# People-first SEO for DeepScreen

This implements the two SEO discussions supplied by the owner. A competitor's
estimated ranking-keyword count is a set of search queries, not a list to insert
into pages. Build useful pages around real research tasks and available evidence.

## Editorial rules

- Give each indexable URL a clear, distinct title and a self-canonical URL.
  Use the company name, exchange and symbol to disambiguate stock listings.
- State the page's purpose in its main heading and opening text. Use relevant
  terms naturally in explanations, table headings and descriptive links.
- Make company facts, definitions and navigation readable in initial HTML.
  The existing immersive design remains a progressive enhancement.
- Match metadata and structured data to visible content. Do not advertise
  historical financial statements or company disclosures the page cannot supply.
- Separate provider-backed information, model output and missing information in
  explanatory copy. An inferred directory group does not establish competitors.
- Link to the next useful research step, not to every possible keyword variation.
  Do not create near-duplicate pages for each query wording.
- Preserve the existing complete stock-research question set. Use the same
  provider inputs for its SSR answers and FAQ structured data.
- The legacy meta-keyword lists are not a ranking target. Search intent and useful
  visible content take priority over adding phrases to those lists.

## Coverage in this update

| Page family | Content and SEO work |
| --- | --- |
| Landing and screener | Clear global stock-screening intent in metadata and visible introductory text; screener FAQ schema matches visible answers |
| All stock detail URLs | Company/exchange/symbol titles; SSR company profile when available; explicit statement-coverage limits; cash-flow, debt and curated comparison links; consistent FAQ inputs |
| Exchange directory pages | Page-specific descriptions and H1s; classification and input-source context; existing pagination retained |
| Sector and ranking pages | Accurate directory/model descriptions; contextual research links; initial selection and score calculations retained |
| Company comparisons | Modeled-input explanation and links to each company's research page; numerical comparison unchanged |
| Guides and ratio glossary | Relevant related reading; worked educational examples in generated ratio guides; one FAQ definition for visible text and schema |
| Options | Clear calculator assumptions; existing FAQ questions made visible on strategy guides; links between education and tools |
| Corporate calendar | Accurate illustrative-schedule description; no generated dates or amounts changed |
| IPO, information and policy pages | Existing unique content retained; contextual next-step links through the shared shell |
| Pricing, checkout and account pages | Excluded from the new shared SEO section; pricing and checkout untouched; existing account indexing policy retained |

## Protected behavior

The owner explicitly requested no changes to screener data, scores, pricing or
checkout. This update changes no datasets, market-provider integration, financial
formulas, score weights, table calculations, ranking selection/order, subscription
prices, entitlement gates, payment handling or checkout UI. Company profile
content reads the already-loaded snapshot; it adds no provider requests.

## Verification

- Production build: passed.
- `node scripts/check-content-seo.mjs` after building: 274 SSR pages passed,
  including all non-stock sitemap URLs and company samples from all five exchanges.
  Checks titles, descriptions, one H1, canonical URLs, visible FAQ questions and
  answers, contextual link destinations, and pricing/account exclusions.
- Existing indexing audit: 11 child sitemaps, 13,320 unique URLs, all 13,055 stock
  pages reachable through 133 directory pages; invalid-page 404s and canonical
  redirects passed. Provider-outage stock responses still contain useful HTML.
- Existing indexing and search-integrity unit suites: 14 checks passed. The latter
  needs a TypeScript-aware resolver for extensionless relative imports under Node.
- Source comparison: protected data/scoring/billing files unchanged; AST comparison
  confirms data and score variable expressions in stock, exchange, screener,
  ranking and comparison components are unchanged.
- TypeScript still reports seven pre-existing errors in peer/score panels and
  optional stock/market props. Those scoring components were deliberately not
  changed. No new TypeScript diagnostics remain.
- Additional browser screenshots could not be completed because the installed
  Chromium process crashed at startup. SSR and build validation completed; no new
  visual-browser verification is claimed for this update.

## After publishing

Verify the production deployment separately. Keep the sitemap index submitted in
Search Console, inspect representative URLs from each affected exclusion reason,
and request validation when applicable. Track indexed pages, impressions, clicks,
queries and conversions over time. Re-crawling and indexing are Google decisions;
this change does not establish that all previously excluded URLs are indexed or
promise a particular keyword count.

Useful references:
- https://developers.google.com/search/docs/essentials
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/docs/appearance/structured-data/sd-policies
