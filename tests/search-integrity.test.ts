import { test } from 'node:test';
import assert from 'node:assert/strict';
import { jsonLd } from '../src/lib/seo/json-ld.ts';
import { canonicalRedirect } from '../src/lib/seo/canonical.ts';
import { mergeFundamentals } from '../src/lib/deepscreen/live-merge.ts';
import { stockFaqs } from '../src/lib/deepscreen/narrative.ts';

test('JSON-LD cannot close its script element and preserves the source text', () => {
  const input = { name: '</script><script>alert("x")</script> & company' };
  const result = jsonLd(input);
  assert.ok(!result.includes('<'));
  assert.deepEqual(JSON.parse(result), input);
});
test('canonical redirect preserves a stock path and query; ignores local, preview and POST requests', () => {
  const result = canonicalRedirect(new Request('https://www.deepscreen.online/stock/NSE/M%26M?x=1'));
  assert.equal(result?.status, 308);
  assert.equal(result?.headers.get('location'), 'https://deepscreen.online/stock/NSE/M%26M?x=1');
  for (const host of ['deepscreen.online', 'localhost', 'preview.example']) {
    assert.equal(canonicalRedirect(new Request(`https://${host}/`)), null);
  }
  assert.equal(canonicalRedirect(new Request('https://www.deepscreen.online/api/payment', { method: 'POST' })), null);
});
const base = { pe: 10, peg: 1, ps: 2, pb: 2, evRevenue: 2, evEbitda: 10, roe: 20, roa: 10, roce: 15, debtToEquity: 1, longTermDebtToEquity: .5, dividendYield: 2, payoutRatio: 20, operatingLeverage: 1.5, growth: 10, netMargin: 20, ebitdaMargin: 25 };
test('heuristic profitability is not marked as provider data', () => {
  const merged = mergeFundamentals(base, { roe: 20, debtToEquity: 1 } as never);
  assert.equal(merged.sources.roa, 'model');
  assert.equal(merged.sources.roce, 'model');
});
test('no-provider FAQs do not expose synthetic ratios or buy verdicts', () => {
  const text = JSON.stringify(stockFaqs({ name: 'Example', symbol: 'EXAMPLE', fundamentals: base } as never));
  assert.match(text, /currently unavailable/);
  assert.ok(!text.includes('10.0x'));
  assert.ok(!text.includes('Strong Buy'));
});
