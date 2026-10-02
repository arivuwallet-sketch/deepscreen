# Complete investment data and analysis

## Build
- Fix the current investment-analysis type errors and preserve the existing type-specific analysis model.
- Repair the data-loading path so mutual-fund, ETF, and REIT pages show every verified metric returned by their appropriate sources.
- Use official AMFI data for Indian funds/ETFs and market-provider data for exchange-traded instruments; use Tickertape only where its public data is verifiable and stable.
- Keep unavailable specialist metrics clearly unavailable rather than estimating stock-style ratios.
- Add the investment directory and every known investment detail URL to the sitemap.

## Verify
- Test representative mutual-fund, ETF, and REIT pages at desktop and mobile widths.
- Confirm directory search, filters, pagination, detail navigation, source labels, and analysis sections work without console errors.
- Confirm the current build/type errors are cleared and sitemap investment URLs render correctly.

## Technical details
- Continue using server functions for external data calls and cache provider responses.
- Retain separate analysis frameworks for funds, ETFs, and REITs.
- Update project architecture notes only if the source/fallback structure changes.
