import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

async function source(path: string) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("pricing page describes the current Free and Pro feature boundary", async () => {
  const pricing = await source("../src/routes/pricing.tsx");
  const features = await source("../src/lib/billing/features.ts");
  const plans = await source("../src/hooks/useSubscription.ts");

  assert.ok(pricing.includes("Free vs Pro"));
  assert.ok(pricing.includes("FEATURE_COMPARISON"));
  assert.ok(pricing.includes("FREE_FEATURES"));
  assert.ok(pricing.includes("PRO_FEATURES"));

  for (const feature of [
    "DeepChart advanced reading",
    "DeepChart trade plan",
    "13-factor DeepScreen score & verdict",
    "DCF & Graham valuation",
    "Options Strategy Lab analytics",
    "Portfolio X-Ray",
  ]) {
    assert.ok(features.includes(feature), feature);
  }

  assert.equal((plans.match(/"All DeepScreen Pro features"/g) ?? []).length, 3);
});

test("strict PaywallGate omits premium children for Free users", async () => {
  const gate = await source("../src/components/ds/PaywallGate.tsx");
  assert.ok(gate.includes("strict = false"));
  assert.ok(gate.includes("!strict &&"));
  assert.ok(gate.includes("Strict mode does not render premium values for Free users"));
});

test("DeepChart keeps basic chart free and gates advanced analysis", async () => {
  const route = await source("../src/routes/chart-reader.tsx");
  const chart = await source("../src/components/chart-reader/PriceChart.tsx");

  assert.ok(route.includes("advanced={isPro}"));
  assert.ok(route.includes('strict feature="DeepChart advanced reading & playbook"'));
  assert.ok(route.includes('strict feature="DeepChart verdict & trade plan"'));
  assert.ok(chart.includes("advanced = false"));
  assert.ok(chart.includes("if (advanced)"));
  assert.ok(chart.includes('pl(p.entry, T.entry, "ENTRY")'));
});

test("Options, stock intelligence and portfolio analytics are gated for Pro", async () => {
  const options = await source("../src/routes/options.index.tsx");
  const stock = await source("../src/routes/stock.$exchange.$symbol.tsx");
  const portfolio = await source("../src/routes/portfolio.tsx");
  const stockTable = await source("../src/components/ds/StockTable.tsx");
  const movers = await source("../src/components/ds/MarketMovers.tsx");
  const peers = await source("../src/components/ds/PeerAnalysisPanel.tsx");
  const compare = await source("../src/routes/compare.$slug.tsx");

  assert.ok(options.includes('strict'));
  assert.ok(options.includes('feature="Options Strategy Lab payoff analytics"'));

  for (const feature of [
    "13-factor DeepScreen score, verdict, strengths & risks",
    "Score explanation & score-change analysis",
    "Research alerts",
    "DCF & Graham intrinsic value calculators",
    "DeepScreen Secret Tips, traps & X-Ray analysis",
  ]) {
    assert.ok(stock.includes(feature), feature);
  }

  assert.ok(portfolio.includes('strict feature="My Stocks research alerts"'));
  assert.ok(portfolio.includes('strict feature="Portfolio X-Ray"'));

  assert.ok(stockTable.includes('isPro ? merged.fundamentals.peg.toFixed(2) : <ProCell />'));
  assert.ok(stockTable.includes('isPro ? <ScoreBar score={analysis.score} /> : <ProCell />'));
  assert.ok(movers.includes('const score = isPro ? analyze(merged).score : null'));
  assert.ok(movers.includes('Most-active gainers'));
  assert.ok(peers.includes('...(isPro ? [{ key: "score" as const, label: "DeepScreen score" }] : [])'));
  assert.ok(compare.includes('feature="DeepScreen score, verdict & advanced comparison"'));
});
