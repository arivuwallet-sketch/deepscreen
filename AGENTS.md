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
