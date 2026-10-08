<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Subscription entitlements are anchored to each order's verified payment time; the latest paid order replaces earlier access rather than stacking durations, so expiry is deterministic.
- Browser viewport state uses `useSyncExternalStore` with CSS-first responsive rendering so cold loads never depend on a post-mount resize effect.
- Landing-page CSS uses `ds-toolkit-*` names for its toolkit demo and must not reuse the shared `ds-workspace` app-shell namespace, preventing route-style leakage.
- Mutual funds, ETFs and REITs live in a separate investment directory, not the stock scoring universe, because company valuation ratios and synthetic equity fundamentals do not apply to pooled investments.
- Investment detail pages use type-specific analysis: ETF basket/holdings and execution, mutual-fund process/performance/risk/cost, and REIT property cash-flow/leverage/NAV governance. Missing specialist data stays explicitly unavailable; never backfill it with synthetic stock metrics or guessed benchmarks.
- Investment detail data loads verified NAV/price history first and bounds supplementary provider waits; alternate chart hosts mitigate rate limits, and thin BSE ETF history may use a price- and currency-matched NSE cross-listing while preserving the BSE quote, without inventing specialist figures.
- Standalone market-topic pages keep their quotes and user-entered calculations separate from stock and IPO research; this prevents unofficial premiums or proxy index values from being presented as verified exchange data.
- AI chat streams through a dedicated server route and stores its single conversation only in browser localStorage, keeping credentials server-side and avoiding a parallel chat database.
- Paid AI actions verify bearer identity and caller-owned payment-ledger entitlement server-side before model use; interactive Pro tools mount only after access resolves, preventing client-only payment bypasses.
- TypeScript retains strict mode but omits unchecked-index, exact-optional, and index-signature property checks because legacy market-analysis modules intentionally use guarded array and provider-record access patterns.
