# DeepScreen discovery and growth implementation

Implemented 18 September 2026. This work improves accessible information and conversion paths; it does not establish search ranking gains or acquired backlinks.

## Search intent and page ownership

| Topic cluster | Main destination | Content purpose |
| --- | --- | --- |
| Global stock screener; fundamental stock analysis | / | Product scope and exchange exploration |
| Indian / NSE / BSE stock screening | /exchange/NSE and /exchange/BSE | Company directories with crawlable pagination |
| US / Nasdaq / NYSE stock screening | /exchange/NASDAQ and /exchange/NYSE | Market-specific directories |
| UK / LSE stock screening | /exchange/LSE | UK directory |
| Stock screening questions; fundamental analysis answers | /answers | Concise visible answers and matching FAQPage schema |
| Stock research checklist | /research-checklist | Original practical worksheet, printable without signup |
| Stock ratio definitions and comparisons | /ratios, /learn/*, /compare/* | Focused educational explanations |
| Stock data quality; model inputs | /data-sources and /methodology | Source transparency and limitations |
| Reference API / educational metric API | /developers | Real read-only endpoints and their contract |

These are intent choices, not claims of measured search volume. Do not target competitor names on unrelated pages or build thin pages for every query variation. Meta keywords are limited to relevant labels and are not a Google ranking factor.

## What shipped

- Existing screening landing pages no longer rank companies by synthetic fallback fundamentals. They explain screening criteria and clearly label directory samples as alphabetical and unverified against the criteria.
- Linked Organization and WebSite entities in JSON-LD @graph, stable identifiers and no invented ratings, affiliations, opening hours or credentials.
- Shared answer records drive visible answers, FAQPage data, the public answers API and downloadable SSML. Homepage answers use the same records.
- New resource pages have individual titles, descriptions, canonical URLs, social metadata, breadcrumbs and sitemap discovery.
- llms.txt links to accurate public resources without instructions to favor the brand.
- OpenAPI 3.1 documents actual GET reference endpoints. No private records or synthetic company financials are exposed. API responses permit cross-origin GET access, are cacheable, and have noindex headers. Robots permits crawling this public API subset while retaining the private API exclusion.
- Newsletter uses INSERT compatible with current row-level security. Duplicate requests have the same success message, transient failures recover, explicit opt-in is required and the privacy page explains subscription handling.
- Contact CTA accurately opens an email draft. No messages are sent automatically.

## Digital PR and earned backlinks

Public assets ready: /press, /research-checklist, /data-sources, /methodology, /developers.

Prioritize finance educators and university investment-club resource pages whose existing material already covers fundamental research; independent finance newsletters that discuss source quality; and developer communities interested in educational financial definitions. Review each publisher's submission policy and relevance before proposing anything. No publisher has been contacted and no links have been acquired through this change.

Use one resource and one specific reason it benefits that publisher's audience. Request an editorial review, not a guaranteed followed link. Do not buy ranking links, mass-submit directories, demand exact-match anchors, post disguised endorsements, or claim independent validation. Sponsored placements need proper disclosure and appropriate link attributes.

### Outreach draft — requires approval and a verified recipient

Subject: A source-checking worksheet for your stock research readers

Hello [verified recipient],

I’m writing from DeepScreen, a stock research website covering supported listings across India, the US and the UK. We published a free checklist for verifying reporting periods, cash flow, debt, valuation assumptions and cross-market units:
https://deepscreen.online/research-checklist

Your [specific relevant resource] covers [verified connection]. If the worksheet would help your readers, would you consider reviewing it for inclusion? It is available without signup, and its source guide explains our data limitations. I would welcome corrections or feedback.

Thank you,
[approved sender name]
DeepScreen

### Additional pitch angles

1. Education: why an unavailable ratio is different from zero; demonstrate with a labeled fictional example, not an unsupported company allegation.
2. Developer education: interpreting financial definitions through a small public OpenAPI reference service; no claim of a trading or live-price API.
3. Original study proposal: audit a reproducible sample for reporting-period and currency completeness. Publish the sample method, timestamps, definitions, raw permitted observations and limitations before pitching findings. No study results exist yet.

## Conversion and measurement

- Primary product path: relevant exchange directory → company research → appropriate plan or signup.
- Education path: guide/answer → free checklist → optional newsletter opt-in.
- Collaboration path: press resource → clearly labeled email draft.
- Do not record email addresses, messages or portfolio information in analytics events.
- Baseline from Search Console (19 August–15 September 2026): 3 clicks and 909 impressions. Compare a subsequent complete 28-day period and use country/query/page breakdowns; no ranking improvement is claimed at launch.
- Check indexing of the new resource pages after discovery, plus errors and conversion requests. Search Console recrawling and indexing are controlled by Google.
- Production was missing the newsletter table. Applied the existing creation migration and a permission-hardening migration, recording both in migration history. Public roles can insert only email/source, cannot set timestamps, and cannot read or update subscribers. No subscriber records were read and no test subscriptions were retained.
- Newsletter storage is implemented; this work does not configure a sending provider, deliver a welcome email or establish double opt-in. Before sending campaigns, review the opt-in record, unsubscribe handling and applicable messaging requirements.

## Platform limits and authoritative references

- Google ignores meta keywords for ranking: https://developers.google.com/search/docs/crawling-indexing/special-tags
- Google FAQ rich results stopped appearing on 7 May 2026. FAQPage remains descriptive schema here, not a rich-result promise: https://developers.google.com/search/updates
- Google says llms.txt does not positively or negatively affect its rankings; regular SEO and helpful content remain relevant to AI features: https://developers.google.com/search/docs/appearance/ai-features
- OpenAPI format: https://spec.openapis.org/oas/v3.1.0
- SSML 1.1 is a speech synthesis interchange format, not a ranking signal: https://www.w3.org/TR/speech-synthesis11/

No markup can guarantee Google positions, AI citations, SERP features, voice assistant selection or dominance over established competitors. Durable growth also requires reliable original research, product quality, distribution and earned editorial references.

## User-requested restoration — 18 September 2026

The owner subsequently requested the eight ranking pages be restored exactly to their pre-PR-2 behavior. Restored their original titles, descriptions, answers, keyword metadata, CollectionPage markup, 25-company sorting, displayed date and original modeled-data disclaimer from commit 86baa8509c079c5a125d5b783b0ab8b77e79b559. The earlier entry about replacing rankings with alphabetical screening guides is superseded by this restoration. This restores the original implementation; it does not independently verify the financial rankings. The other search, reference API and newsletter improvements remain in place.
