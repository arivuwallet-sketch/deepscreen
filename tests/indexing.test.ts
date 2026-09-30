import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createSnapshotLoader } from '../src/lib/market/snapshot-cache.ts';
import { directoryPage, exchangePath, stockPath } from '../src/lib/seo/directory.ts';
import { canonicalRedirect } from '../src/lib/seo/canonical.ts';
import { sitemapXML } from '../src/lib/sitemap.ts';

const key = { exchange: 'NSE', symbol: 'RELIANCE' };
const quote = { price: 100 } as never;
const fundamentals = { pe: 20 } as never;
const screener = { pe: 21 } as never;

test('SSR deadline retains fast results and aborts a stuck provider', async () => {
  let signal: AbortSignal | undefined;
  const load = createSnapshotLoader({
    quote: async () => quote,
    fundamentals: async (_, budget) => { signal = budget; return new Promise(() => {}); },
    screener: async () => screener,
  }, { budgetMs: 25 });
  const started = Date.now();
  const result = await load(key);
  assert.ok(Date.now() - started < 500, 'Provider hangs must not hang SSR');
  assert.equal(signal?.aborted, true);
  assert.equal(result.quote, quote);
  assert.equal(result.screener, screener);
  assert.equal(result.fundamentals, null);
  assert.equal(result.degraded, true);
});

test('simultaneous requests and a fresh cache share one provider attempt', async () => {
  let calls = 0;
  const load = createSnapshotLoader({
    quote: async () => { calls++; return quote; },
    fundamentals: async () => fundamentals,
    screener: async () => screener,
  });
  const requests = await Promise.all(Array.from({ length: 12 }, () => load(key)));
  assert.equal(calls, 1);
  assert.ok(requests.every((r) => r === requests[0]));
  assert.equal(await load(key), requests[0]);
  assert.equal(calls, 1);
});

test('partial refresh preserves cached provider fields and their older timestamp', async () => {
  let now = 1000;
  let failed = false;
  let calls = 0;
  const newerQuote = { price: 110 } as never;
  const load = createSnapshotLoader({
    quote: async () => { calls++; return failed ? newerQuote : quote; },
    fundamentals: async () => failed ? null : fundamentals,
    screener: async () => failed ? null : screener,
  }, { ttlMs: 100, retryMs: 20, now: () => now });
  await load(key);
  now += 101;
  failed = true;
  const refreshed = await load(key);
  assert.equal(refreshed.quote, newerQuote);
  assert.equal(refreshed.fundamentals, fundamentals);
  assert.equal(refreshed.screener, screener);
  assert.equal(refreshed.fetchedAt, 1000);
  assert.equal(refreshed.degraded, true);
  await load(key);
  assert.equal(calls, 2, 'Outage cooldown prevents repeated provider hits');
  now += 21;
  failed = false;
  assert.equal((await load(key)).degraded, false);
  assert.equal(calls, 3);
});

test('provider exceptions recover after cooldown and cache size stays bounded', async () => {
  let now = 1000;
  let failed = true;
  let calls = 0;
  const load = createSnapshotLoader({
    quote: async () => { calls++; if (failed) throw new Error('offline'); return quote; },
    fundamentals: async () => fundamentals,
    screener: async () => screener,
  }, { maxEntries: 1, retryMs: 10, now: () => now });
  assert.equal((await load(key)).quote, null);
  now += 11;
  failed = false;
  assert.equal((await load(key)).quote, quote);
  await load({ ...key, symbol: 'TCS' });
  await load(key);
  assert.equal(calls, 4);
});

test('non-Indian stocks do not wait for Screener.in', async () => {
  const load = createSnapshotLoader({
    quote: async () => quote,
    fundamentals: async () => fundamentals,
    screener: async () => { assert.fail('Screener must not be called'); },
  });
  const result = await load({ exchange: 'NASDAQ', symbol: 'AAPL' });
  assert.equal(result.degraded, false);
  assert.equal(result.screener, null);
});

test('directory page inputs cannot create duplicate page-one crawl traps', () => {
  assert.equal(directoryPage(undefined), 1);
  assert.equal(directoryPage(2), 2);
  assert.equal(directoryPage('52'), 52);
  for (const bad of [0, -1, 1.5, 'abc', 'Infinity', '1e2', '01', '', null, true, [1], {}, '9007199254740992']) {
    assert.equal(directoryPage(bad), 0, String(bad));
  }
  assert.equal(exchangePath('BSE', 2), '/exchange/BSE?page=2');
  assert.equal(exchangePath('NSE', 1), '/exchange/NSE');
  assert.equal(stockPath('NSE', 'M&M'), '/stock/NSE/M%26M');
});

test('sitemaps allow real directory pagination and reject arbitrary query variants', () => {
  const xml = sitemapXML('https://deepscreen.online', [{ path: exchangePath('BSE', 52) }, { path: stockPath('NSE', 'M&M') }]);
  assert.match(xml, /exchange\/BSE\?page=52/);
  assert.match(xml, /M%26M/);
  for (const path of ['/exchange/BSE?page=1', '/exchange/BSE?page=2&sort=score', '/exchange/BSE?page=02', '/stock/NSE/TCS?x=1', '//elsewhere.test', '/exchange/BSE?page=2#x']) {
    assert.throws(() => sitemapXML('https://deepscreen.online', [{ path }]), path);
  }
});

test('public crawler policy allows major search and AI crawlers', async () => {
  const robots = await readFile(new URL('../public/robots.txt', import.meta.url), 'utf8');
  for (const agent of [
    'Googlebot',
    'Bingbot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'GPTBot',
    'Claude-SearchBot',
    'Claude-User',
    'ClaudeBot',
    'PerplexityBot',
    'Google-Extended',
    'Applebot-Extended',
    'meta-externalagent',
  ]) {
    assert.match(robots, new RegExp(`User-agent: ${agent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  }
  assert.ok(!robots.includes('User-agent: GPTBot\nDisallow: /\n'));
  assert.ok(!robots.includes('User-agent: ClaudeBot\nDisallow: /\n'));
  assert.ok(!robots.includes('User-agent: Google-Extended\nDisallow: /\n'));
  assert.match(robots, /User-agent: \*\nAllow: \//);
  assert.match(robots, /Sitemap: https:\/\/deepscreen\.online\/sitemap\.xml/);
});

test('all public stock-filter pages remain indexable and sitemap-discoverable', async () => {
  const filterRoute = await readFile(
    new URL('../src/routes/stock-filters.$slug.tsx', import.meta.url),
    'utf8',
  );
  const sitemapSections = await readFile(
    new URL('../src/lib/deepscreen/sitemap-sections.ts', import.meta.url),
    'utf8',
  );

  assert.doesNotMatch(filterRoute, /noindex\s*,?\s*follow/i);
  assert.match(filterRoute, /index,follow,max-image-preview:large/);
  assert.match(sitemapSections, /STOCK_FILTER_PRESETS\.map\(\(preset\) => \(\{ slug: preset\.id \}\)\)/);
  assert.doesNotMatch(
    sitemapSections,
    /STOCK_FILTER_PRESETS\.filter\(\(preset\) => preset\.status === ["']available["']\)/,
  );
});

test('HTTP and www consolidate to HTTPS apex without losing encoded paths or attribution', () => {
  for (const origin of ['http://deepscreen.online', 'http://www.deepscreen.online', 'https://www.deepscreen.online']) {
    for (const method of ['GET', 'HEAD']) {
      const response = canonicalRedirect(new Request(`${origin}/stock/NSE/M%26M?utm_source=test`, { method }));
      assert.equal(response?.status, 308);
      assert.equal(response?.headers.get('location'), 'https://deepscreen.online/stock/NSE/M%26M?utm_source=test');
    }
  }
  for (const origin of ['http://localhost:4175', 'https://preview.example', 'https://deepscreen.online']) {
    assert.equal(canonicalRedirect(new Request(origin)), null);
  }
  assert.equal(canonicalRedirect(new Request('http://www.deepscreen.online/api/payment', { method: 'POST' })), null);
});
