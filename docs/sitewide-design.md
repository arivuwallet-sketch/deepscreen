# Shared immersive design

DeepScreen's landing-page identity now extends through the shared research workspace: emerald surfaces, ivory type, lime accents, editorial serif highlights, metallic Three.js geometry, and restrained interaction feedback.

## Coverage

`Shell` supplies the responsive header, stock search, active navigation, compact 3D masthead, skip link, reading progress and footer. All existing screeners, exchanges, stocks, sectors, rankings, comparisons, options, portfolio, calendar, IPO, learning, pricing, authentication, company and policy pages use it. The root not-found and error views use the same design tokens.

Global tokens also cover dialogs, menus, authentication fields and other UI rendered in portals. Table numbers keep their monospace alignment, and positive, negative and warning colors remain distinct. Options chart axes and tooltips use the shared palette. Existing calculations, pricing, data access and paywall rules are unchanged.

## Motion and accessibility

- The landing and compact scenes share the same Three.js renderer. The compact scene fits its own column and responds to pointer movement and scroll without covering the page's controls.
- Motion can be paused, with the preference remembered across routes. Reduced-motion settings are respected. WebGL is client-only and has a CSS fallback; GPU resources are disposed on unmount and rendering stops when the scene is offscreen or the tab is hidden.
- Mobile navigation uses a native disclosure, so it also works without JavaScript. Navigation closes after choosing a page or pressing Escape.
- Scroll entrances enhance already-visible content. Focus outlines, a skip link, one main landmark per page, labeled filters and keyboard-operable inputs preserve access to the tools.
- The watchlist notification capability check now runs after hydration, fixing the server/client markup mismatch observed during the review.

## Verification

Production build passed. SSR coverage checked 27 representative routes for page titles, shared layout and a single main landmark. Browser checks covered desktop and mobile navigation, persisted motion preference, stock search, exchange sorting/filtering, options inputs, sign-in/sign-up switching, responsive layouts down to 320px, reduced motion, JavaScript-disabled navigation and unavailable-WebGL fallback. Screenshots were reviewed for screeners, options, pricing, sign-in, learning and mobile navigation.

UI verification ran with external market/account services unavailable; authenticated accounts, live data and payment processing were not exercised. The same nine pre-existing TypeScript errors in peer/score/discovery and stock/exchange data types remain outside this design update. Publishing the synced Lovable project is a separate deployment step.
