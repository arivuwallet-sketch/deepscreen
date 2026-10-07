import { createOpenAI } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  isStepCount,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";

import { analyze } from "@/lib/deepscreen/metrics";
import { mergeLiveStock } from "@/lib/deepscreen/live-merge";
import { searchStocks } from "@/lib/deepscreen/stocks";
import { createSnapshotLoader } from "@/lib/market/snapshot-cache";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server";

const SYSTEM_PROMPT = `You are DeepScreen, a rigorous professional finance research assistant.

Scope: greetings and questions about personal finance, economics, investing, stocks, mutual funds, ETFs, REITs, trading, technical analysis, options, IPOs, ratios, cryptocurrencies, and commodities. Politely decline unrelated requests and redirect to finance.

Product-specific facts when asked about DeepScreen AI:
- DeepScreen is a global stock screener supporting more than 13,000 listed stocks across NSE, BSE, NYSE, Nasdaq and LSE. Directory coverage does not guarantee complete data for a ticker.
- This chat interface accepts text messages, not uploaded chart images. Your available research tools are searchStocks and getStockResearch; neither places trades, connects bank accounts or obtains a dedicated live fund, ETF or options-chain feed.
- Conversation messages are saved in browser local storage and sent to DeepScreen's AI backend for replies. New conversation clears the local browser thread; do not promise server-side or third-party deletion.
- For the public product FAQ, direct users to https://deepscreen.online/chat#chatbot-faq, and for data quality to https://deepscreen.online/data-sources.
- Do not invent subscription entitlements, unlimited usage, model provenance, exact freshness or privacy guarantees.

Rules:
- Be direct, clear, balanced and educational. Never promise returns or imply certainty.
- Distinguish facts from analysis. Mention material risks, time horizon and assumptions.
- Never invent a current price, ratio, score, filing, news item, forecast, or source.
- For any request to select, rank, recommend or compare stocks, use searchStocks first. Use getStockResearch for every serious candidate before deciding. Compare at least three valid peers when available.
- Treat DeepScreen scores as model output, not investment advice. State when live provider fields are missing or when a score includes modeled fields.
- Cite the returned source names and timestamps beside time-sensitive facts. Do not claim data is real-time; call it latest available.
- If the request lacks geography, risk tolerance or horizon, state reasonable assumptions and explain how the answer changes under alternatives.
- Keep answers structured and concise, normally under 700 words.`;

const loadSnapshot = createSnapshotLoader({
  quote: async (key, signal) => {
    const { fetchChartQuote, yahooSymbol } = await import("@/lib/market/yahoo.server");
    return fetchChartQuote(yahooSymbol(key.exchange, key.symbol), signal);
  },
  fundamentals: async (key, signal) => {
    const { fetchFundamentals, yahooSymbol } = await import("@/lib/market/yahoo.server");
    return fetchFundamentals(yahooSymbol(key.exchange, key.symbol), signal);
  },
  screener: async (key, signal) => {
    const { fetchScreenerRatios } = await import("@/lib/market/screener.server");
    return fetchScreenerRatios(key.symbol, key.name, null, signal);
  },
});

function compactNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export async function handleDeepScreenChat(request: Request): Promise<Response> {
  let body: { messages?: UIMessage[] };
  try {
    body = (await request.json()) as { messages?: UIMessage[] };
  } catch {
    return Response.json({ message: "The chat request could not be read." }, { status: 400 });
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 80) {
    return Response.json({ message: "Send between 1 and 80 conversation messages." }, { status: 400 });
  }
  if (JSON.stringify(messages).length > 240_000) {
    return Response.json({ message: "This conversation is too long. Start a new conversation." }, { status: 413 });
  }

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    return Response.json({ message: "DeepScreen AI is not configured yet." }, { status: 503 });
  }

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    instructions: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    abortSignal: request.signal,
    maxRetries: 1,
    stopWhen: isStepCount(50),
    tools: {
      searchStocks: tool({
        description: "Find listed stocks in DeepScreen by company name, ticker, industry word, or exchange.",
        inputSchema: z.object({
          query: z.string().describe("Company, ticker, industry, or theme to search"),
          exchange: z.string().nullable().describe("Optional exchange code such as NSE, BSE, NASDAQ, NYSE, or LSE"),
        }),
        execute: async ({ query, exchange }) => {
          const matches = searchStocks(query, 20)
            .filter((stock) => !exchange || stock.exchange.toLowerCase() === exchange.toLowerCase())
            .slice(0, 8);
          return {
            query,
            matches: matches.map((stock) => ({
              symbol: stock.symbol,
              name: stock.name,
              exchange: stock.exchange,
              sector: stock.sector,
              size: stock.cap,
            })),
          };
        },
      }),
      getStockResearch: tool({
        description: "Load the latest available market quote, verified fundamentals, DeepScreen score, and risk/strength summary for one listed stock.",
        inputSchema: z.object({
          exchange: z.string().describe("Exchange code returned by searchStocks"),
          symbol: z.string().describe("Exact ticker returned by searchStocks"),
        }),
        execute: async ({ exchange, symbol }) => {
          const stock = searchStocks(symbol, 20).find(
            (candidate) =>
              candidate.symbol.toLowerCase() === symbol.toLowerCase() &&
              candidate.exchange.toLowerCase() === exchange.toLowerCase(),
          );
          if (!stock) return { found: false, exchange, symbol };
          const snapshot = await loadSnapshot({ exchange: stock.exchange, symbol: stock.symbol, name: stock.name });
          const merged = mergeLiveStock(stock, snapshot.quote, snapshot.fundamentals, snapshot.screener);
          const assessment = analyze(merged.stock);
          const f = merged.stock.fundamentals;
          const liveFields = Object.entries(merged.sources)
            .filter(([, source]) => source === "live")
            .map(([field]) => field);
          return {
            found: true,
            company: { name: stock.name, symbol: stock.symbol, exchange: stock.exchange, sector: stock.sector, size: stock.cap },
            quote: snapshot.quote
              ? {
                  price: snapshot.quote.price,
                  currency: snapshot.quote.currency,
                  changePct: snapshot.quote.changePct,
                  marketState: snapshot.quote.marketState,
                  asOf: snapshot.quote.asOf,
                }
              : null,
            ratios: {
              pe: compactNumber(f.pe),
              peg: compactNumber(f.peg),
              priceToBook: compactNumber(f.pb),
              debtToEquity: compactNumber(f.debtToEquity),
              roePct: compactNumber(f.roe),
              rocePct: compactNumber(f.roce),
              roaPct: compactNumber(f.roa),
              revenueGrowthPct: compactNumber(f.growth),
              netMarginPct: compactNumber(f.netMargin),
              dividendYieldPct: compactNumber(f.dividendYield),
            },
            deepScreen: {
              score: assessment.score,
              verdict: assessment.verdict,
              strengths: assessment.strengths,
              risks: assessment.risks,
              liveFields,
              includesModeledFields: liveFields.length < Object.keys(merged.sources).length,
            },
            sources: [
              snapshot.quote ? `Yahoo Finance chart (${snapshot.quote.asOf})` : null,
              snapshot.fundamentals ? "Yahoo Finance fundamentals" : null,
              snapshot.screener ? "Screener.in company filings summary" : null,
            ].filter(Boolean),
            fetchedAt: new Date(snapshot.fetchedAt).toISOString(),
            degraded: snapshot.degraded,
          };
        },
      }),
    },
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "medium",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  return withLovableAiGatewayRunIdHeader(
    result.toUIMessageStreamResponse({ originalMessages: messages, sendReasoning: true }),
    runIdFetch,
  );
}