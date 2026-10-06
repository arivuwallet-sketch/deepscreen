# DeepScreen SEO, GEO, AEO and AAO hardening

## Goal
Verify and strengthen DeepScreen’s technical discoverability without changing stock data, scores, subscriptions, or existing product behavior.

## Changes
- Audit every public route in the rendered server HTML for a unique title, description, self-canonical URL, Open Graph fields, Twitter card, indexability, and meaningful visible heading/content.
- Correct only confirmed metadata gaps or contradictions, keeping redirect-only and private/auth pages excluded appropriately.
- Validate the generated sitemap across all public route families, remove only inaccurate generated timestamps if found, and preserve the current public-domain URL inventory.
- Verify Google and major AI crawler access in `robots.txt`; keep private account and internal API paths blocked.
- Strengthen answer-engine and AI discovery through visible, source-linked answers, methodology, data-source, knowledge, and entity markup; keep `llms.txt` as a discovery aid rather than claiming it guarantees citations.
- Ensure structured data matches visible page content and uses accurate page types, breadcrumbs, publisher/entity references, and current-data limitations.
- Recheck the reported mobile hook path and run full type checks, rendered-HTML checks, sitemap checks, and desktop/mobile browser verification.

## Technical boundaries
- Keep TanStack Start routing and server rendering.
- Use each leaf route’s `head()` for page metadata and canonical URLs; retain only sitewide defaults in the root route.
- Do not add fabricated facts, keyword stuffing, fake reviews, unsupported `lastmod` dates, or hidden AI-only content.
- Ranking and AI citations cannot be guaranteed; success here means correct crawlability, discoverability, semantics, and answer-ready public content.
