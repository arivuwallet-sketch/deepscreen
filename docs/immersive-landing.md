# Immersive landing page

The public entry route `/` presents DeepScreen's features in a scroll-driven Three.js experience. The previous homepage is preserved at `/screener`; every Get started button opens that route, and the main application navigation includes Screener.

## Experience

- A physically lit emerald core, metallic orbital rings, thirteen markers, and particles respond to scrolling and pointer movement.
- Five exchange tabs and thirteen factor buttons explain the existing research coverage and scoring framework.
- A DCF slider calculates an illustrative five-year valuation; three options strategies update an illustrative payoff chart. These demonstrations are explicitly labeled and do not use live market data.
- Feature cards link to existing news, calendar, IPO, research, watchlist, and learning routes.
- Responsive navigation, FAQ disclosures, pause controls, and reduced-motion support work independently of the decorative scene.

## Rendering and performance

Three.js is imported only in the client effect. Server-rendered content, canonical metadata, and ordinary navigation links remain available without JavaScript. A CSS illustration remains when WebGL is unavailable. The scene caps pixel density, suspends rendering outside its viewport or in hidden tabs, and disposes GPU resources on route changes.

The original screener retains its own canonical URL, and `/screener` remains in the core sitemap.

## Verification (2026-09-29)

- Production build passed with the frozen Bun lockfile.
- Production-worker SSR checks passed for `/`, `/screener`, and the core sitemap.
- Chromium checks passed at desktop and mobile sizes for actual WebGL rendering, exchange and factor selection, the DCF slider, options strategies, FAQ, mobile navigation, and Get started routing.
- Reduced-motion and JavaScript-disabled checks passed. No uncaught browser errors were observed. The scene canvas was removed after navigating to the screener.
- Desktop and mobile screenshots were visually reviewed, including scroll transitions and interactive cards.
- The repository still has nine existing TypeScript errors in stock/peer/score/discovery code, outside this change. Local screener data requests require the existing Supabase environment configuration.

GitHub changes sync to the connected Lovable project. Public deployment must be confirmed separately after publishing the updated project.
