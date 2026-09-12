# DeepScreen roadmap — "God's Eye" institutional platform

Source: uploaded 12-section spec (Sept 2026).

## Phase 1 — Intelligence engine (in progress)
- [x] Shared Screener.in ratio cache + bulk fetch fix (all Indian stocks)
- [x] Extended ratio layer: OPM, net margin, P/CF, current/quick ratio, interest coverage, asset turnover, DSI, EV/EBITDA
- [x] Secret Tips badge engine (operating leverage, ROA trap, fortress balance sheet, liquidity guardrails, ROCE vs WACC, EV/Rev sector bands, quality of earnings, smart-money accumulation)
- [x] Forensic suite: Piotroski F-Score, Altman Z-Score, Beneish M-Score (computed where inputs exist, otherwise flagged unavailable)
- [x] DuPont ROE breakdown + business-model classification
- [x] Vision & Utility Score (0-100) + qualitative holding horizon + generational override
- [x] Stock detail UI: Vision gauge, horizon badge, God's Eye forensic panel, Secret Tips panel

## Phase 2 — Peer & industry comparison
- [ ] Auto peer set (sector + sub-industry + cap band), side-by-side matrix
- [ ] Industry average / sector median benchmarking with out/under-performance badges
- [ ] Custom competitor multi-select + best-in-class highlighting

## Phase 3 — News & calendar upgrade
- [x] Resilient ticker-level news with Google, Bing and Yahoo fallbacks plus shared last-good cache
- [ ] News sentiment + event tagging
- [ ] Exchange-scoped market news tabs (NSE/BSE/NYSE/NASDAQ/LSE)
- [ ] Economic calendar filtering by region/impact + manual refresh control

## Phase 4 — Index database
- [ ] Index membership mapping (NIFTY family, BSE family, S&P/Dow/Russell/Nasdaq 100, FTSE)
- [ ] Index pill bar on stock pages + multi-select index filter in screener
- [ ] Daily constituent verification job (zero-orphan rule)

## Phase 5 — Screener filters & alerts
- [ ] New screener columns/filters (P/CF, quick ratio, DSI, ATR, interest coverage, Piotroski)
- [ ] Holding-horizon dropdown + quick toggles (generational moats, unmanipulated compounders, industry leaders)
- [ ] Alert triggers (valuation touchpoints, smart money, forensic flags, margin shifts)
- [ ] Delivery channels: email, web push, Telegram, Discord

## Phase 6 — Portfolio X-Ray
- [ ] CSV import (broker exports)
- [ ] Portfolio Piotroski audit, forensic exposure, generational moat coverage

## Index mapping (uploaded spec)
- [x] Index membership engine (all 25 indices, 5 exchanges) — src/lib/deepscreen/indices.ts
- [x] Membership pill bar on stock detail pages
- [x] Multi-select "Filter by Index" in exchange screener
- Note: flagship indices use curated constituents; broad indices derive from live market-cap ranking so zero stocks are orphaned
