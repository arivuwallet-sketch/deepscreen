# DeepScreen AI chatbot — public SEO / GEO / AEO / AAO Q&A integration

Review date: 7 October 2026

## Canonical destination

https://deepscreen.online/chat

New public title: **DeepScreen AI Chatbot: Stock Research & Finance Q&A | DeepScreen**

Description: Ask DeepScreen AI about 13,000+ stocks across NSE, BSE, NYSE, Nasdaq and LSE, fundamental ratios, ETFs, REITs, options and personal finance. Explore chatbot FAQs.

The canonical site-level brand is **Global Stock Screener - Filter & Analyze 13000+ Stocks**. DeepScreen remains the organization name and the human-facing chatbot is DeepScreen AI.

## Public answer architecture

- The chat page publishes 29 visible, direct-answer FAQs across four clusters: assistant scope; stock research and sources; investment/personal finance topics; safety, privacy and troubleshooting.
- Source of truth: `src/lib/seo/ai-chat-faq.ts` for visible content, FAQPage JSON-LD and the site's `/knowledge` and `/faq-index.txt` discovery surfaces.
- The chat still uses its original browser interface and API endpoint. FAQ content is rendered outside the browser-only conversation, so public explanation remains visible in server-rendered HTML even when JavaScript chat hydration is unavailable.
- Canonical URL, descriptive page-specific title/description, Open Graph, Twitter, breadcrumb, WebPage, WebApplication and FAQPage JSON-LD are provided by `src/routes/chat.tsx`.
- `/chat` is intentionally marked `index,follow` and included in the existing route-generated XML sitemap. Individual messages are browser-local UI state and never included in public metadata, the FAQ, or the sitemap.
- Search engines are permitted to crawl the public FAQ. No claims of guaranteed featured snippets, Google FAQ rich results, AI citations or rankings are made.
- The full 29-answer set is mirrored in the AI-readable `llms-full.txt` companions; `llms.txt` provides a concise canonical discovery summary.
- The separate 38-question stock-market FAQ remains unchanged; chatbot FAQs are linked as an independent group to avoid conflating topics and breaking existing anchors.

## Important factual limits

- DeepScreen's directory spans more than 13,000 stock listings across NSE, BSE, NYSE, Nasdaq and LSE, but company data completeness and timestamps vary.
- Current chat tools: `searchStocks` and `getStockResearch`; no broker order entry, real-time option-chain retrieval or live ETF/fund-data tool is exposed by this chat.
- Stock quotes are **latest available**, not guaranteed real-time. Returned data and scoring inputs may be incomplete or modeled.
- The 13-factor score is research model output, not independent investment advice.
- The browser saves conversation UI messages in local storage and submits messages to the backend AI service. New conversation clears local browser history; this should not be marketed as deleting third-party service records.
- The chat route is publicly accessible, but successful replies depend on a configured AI backend. Do not invent pricing access limits or "unlimited free AI" claims.
- Avoid asking users to provide card details, government IDs or account credentials in chat.

## QA before deployment/indexing

1. Run `npm run test:indexing` and `npm run build` in the ordinary CI/deployment environment.
2. Confirm server response for `/chat` has the canonical title, visible FAQ Q&A text and JSON-LD before any client-side chat messages.
3. Confirm source links, 29 unique question anchors and `/faq-index.txt` entries.
4. Confirm live `/sitemap.xml` or core child sitemap exposes `/chat` once the new route reaches production.
5. Confirm "New conversation" still clears the visible thread, messages still stream via `/api/chat`, and the chat is not wrapped in duplicate page shells.
6. After production deployment, request recrawl where useful; do not promise immediate indexing.

Scope: SEO/content/FAQ/chat product-explanation updates only. No changes to equity data, scores, verdicts, pricing, subscription entitlement, checkout, or financial calculations.
