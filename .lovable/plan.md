# Complete the DeepScreen chatbot

## Build
- Add a dedicated DeepScreen chat page and link it from the shared navigation.
- Use one conversation saved in this browser, restoring it safely after refresh.
- Compose the interface from the installed AI chat elements: scrolling transcript, markdown answers, tool activity, loading state, stop control, and prompt input.
- Match DeepScreen's existing dark research-workspace design on desktop and mobile.

## Intelligence and data
- Add a streamed server chat endpoint using Lovable AI and the required `openai/gpt-6-astra` model.
- Keep the assistant focused on finance, investing, stocks, funds, ETFs, REITs, trading, options, IPOs, economic calendars, ratios, crypto, commodities, and ordinary greetings.
- Give the assistant bounded stock search and verified snapshot tools so selection requests can compare real listed peers using the same current data available to DeepScreen.
- Require source timestamps, explicit missing-data handling, balanced risk discussion, and no invented prices, ratios, scores, or guarantees.

## Cleanup and verification
- Repair the compatibility errors left by the partial AI component installation without changing existing market, payment, or pricing behavior.
- Confirm there is no `src/hooks/use-mobile.tsx`; preserve the existing hydration-safe `use-mobile.ts` implementation.
- Verify a greeting, a finance explanation, a stock-selection request with peer comparison, browser history restoration, stopping a response, and desktop/mobile presentation.
- Check the current build diagnostics and ensure the chatbot changes introduce no errors.
