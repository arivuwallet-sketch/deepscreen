# Restore scores across all exchange screeners

## Goal
Make the DeepScreen score and verdict visible and consistent for every stock on NSE, BSE, NYSE, NASDAQ, and LSE.

## Changes
- Remove subscription locks from score and verdict cells in every screener table.
- Remove the subscription lock around the stock page’s score, verdict, strengths, and risks.
- Keep genuinely advanced tools and advanced ratios behind the existing Pro lock.
- Harden score calculation against unavailable or invalid provider values so one missing ratio cannot blank the score.
- Verify table and stock-detail scores use the same merged data and test representative stocks across all five exchanges.

## Technical details
- Preserve the existing live-source priority: Screener.in filing ratios for Indian stocks and Yahoo market fundamentals for US/UK stocks.
- Continue using the shared `mergeLiveStock` and `analyze` path for both table and detail views.
- Show modeled fallback ratios transparently when a provider does not supply a field, rather than hiding the entire score.
