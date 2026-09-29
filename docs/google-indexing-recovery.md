# Google indexing recovery — 29 September 2026

## Scope and evidence

The user reported approximately 3.89k non-indexed pages in the domain property's Page indexing report. The report itself and its example URLs could not be read: the GSC Wizard connector returned `payment_required` (expired trial/no active subscription). The report URL's opaque item key is not evidence of a specific exclusion reason. Public production fetches were also unavailable from the audit environment, so the results below describe the repository's production build, not a verified live deployment or Google's index.

Confirmed repository issues addressed:

- Stock SSR awaited a full chain of provider calls. Yahoo session, crumb and fundamentals requests each had separate 8/8/10-second deadlines; Screener could attempt multiple pages and searches. A shared 3-second SSR budget now cancels upstream work, keeps completed results and cached fields, and deduplicates concurrent requests for the same stock. Client refresh behaviour remains available. Partial/outage results retry after 30 seconds instead of hammering providers. The in-memory cache is bounded at 500 entries and is per worker, not durable storage.
- Clean exchange URLs were temporarily redirected to `?page=1` even though their canonical tags specified the clean URL. The clean URL now serves 200, and explicit page-one variants permanently redirect to it.
- Malformed page values were clamped/coerced into copies of page one. Invalid and out-of-range directory pages now return 404.
- Deep exchange pages were reachable primarily through sequential pagination. Every directory page now links directly to every other page for that exchange. A dedicated sitemap lists all 128 pages after page one (the five first pages remain in the markets sitemap).
- Case variants of stock/exchange routes now redirect to the stored canonical values. Stock canonical and structured-data URLs encode special ticker characters consistently with the sitemap. Known HTTP/www public aliases consolidate to HTTPS apex; preview hosts and non-GET/HEAD requests are preserved.

## Verification

- `npm run test:indexing`: 8/8 tests passed for deadline/cancellation, simultaneous request reuse, cache preservation/retry/eviction, market-specific providers, page validation, sitemap safety and host redirects.
- `npm run build`: production Cloudflare build passed.
- `node scripts/check-indexing.mjs`: exercised the built worker HTTP handler without client JavaScript. All 11 child sitemaps passed; 13,319 unique sitemap URLs; all 13,055 stocks reachable via 133 directory pages. Each directory returned 200 and a single self-canonical tag. Invalid pages returned 404; alias/page-one redirects returned 308. NSE M&M and Nasdaq AAPL returned indexable HTML and valid JSON-LD in approximately 3.0 seconds while external providers were unavailable.
- `tsc --noEmit`: 9 existing errors, identical in substance to base commit `ffc046f` (nullable scores, optional snapshot fields, and ExchangeCode types). No new type errors.
- Existing search/broken-link tests: 9 passed, 1 failed on both the base and this patch. The existing no-provider FAQ test expects the literal phrase “currently unavailable”; the current copy uses “not available.” No assertion was weakened or removed.

The SSR check may also be run against a deployed URL with `SEO_TEST_ORIGIN=https://deepscreen.online node scripts/check-indexing.mjs`. It reads directory pages plus two stock examples; it does not submit URLs or request indexing.

## After release

1. Deploy the updated main branch through the existing Lovable production workflow. A merged GitHub commit is not proof the public deployment has changed.
2. Verify `/exchange/NSE` returns 200, `?page=1` redirects to it, `/sitemaps/directories.xml` returns XML, and representative excluded stock URLs return indexable HTML with the correct canonical.
3. In Search Console, submit/re-submit `https://deepscreen.online/sitemap.xml` (the index includes all child sitemaps).
4. Export the exact exclusion reason and affected URLs, plus URL Inspection details for examples from each path group: coverage state, last crawl, page fetch, indexing permission, user canonical and Google canonical. Compare these examples against the deployed fix before using Validate Fix where available.
5. For a few representative priority pages, use URL Inspection → Test live URL and request indexing where appropriate. Monitor Page indexing and Crawl stats after Google's subsequent crawls; do not claim all 3.89k pages are indexed simply because the code passed tests.

Crawl accessibility and indexing are separate. Company-specific content quality, provider coverage, duplicates, and Google's selection still affect indexing. This patch preserves the existing scoring and company-content logic. Missing real data is not fixed by adding keywords or submitting the same URLs repeatedly.

References:
- https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors
- https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading
- https://developers.google.com/search/docs/specialty/ecommerce/designing-a-url-structure-for-ecommerce-sites
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/fundamentals/how-search-works
