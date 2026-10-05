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
  for (const crawler of [
    'OAI-SearchBot',
    'OAI-AdsBot',
    'ChatGPT-User',
    'GPTBot',
    'Claude-SearchBot',
    'Claude-User',
    'ClaudeBot',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'Google-CloudVertexBot',
    'Applebot-Extended',
    'CCBot',
    'meta-externalagent',
  ]) {
    assert.ok(robots.includes('User-agent: ' + crawler), crawler + ' must be explicitly allowed');
  }

  for (const path of [
    '/answers',
    '/knowledge',
    '/faq-index.txt',
    '/blog/',
    '/learn/',
    '/api/v1/answers',
    '/api/v1/metrics',
  ]) {
    assert.ok(robots.includes('Allow: ' + path), path + ' must be crawlable');
  }
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


test('investment Q&A hubs stay indexable, visible and AI-discoverable', async () => {
  const routeFiles = [
    '../src/routes/mutual-funds.tsx',
    '../src/routes/etfs.tsx',
    '../src/routes/reits.tsx',
  ];

  for (const routeFile of routeFiles) {
    const route = await readFile(new URL(routeFile, import.meta.url), 'utf8');
    assert.match(route, /staticData:\s*\{\s*sitemap:\s*true\s*\}/);
    assert.match(route, /index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1/);
    assert.match(route, /buildFAQSchema/);
    assert.match(route, /InvestmentTopicGuide/);
    assert.doesNotMatch(route, /noindex/i);
  }

  const directory = await readFile(new URL('../src/routes/investments.tsx', import.meta.url), 'utf8');
  assert.match(directory, /<Link to="\/mutual-funds"/);
  assert.match(directory, /<Link to="\/etfs"/);
  assert.match(directory, /<Link to="\/reits"/);
  assert.match(directory, /InvestmentFaqSection/);
  assert.match(directory, /buildFAQSchema/);

  const detail = await readFile(new URL('../src/routes\/investment.\$market.\$type.\$code.tsx', import.meta.url), 'utf8');
  assert.match(detail, /investmentDetailFaq/);
  assert.match(detail, /buildFAQSchema/);
  assert.match(detail, /index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1/);

  const llms = await readFile(new URL('../public/llms.txt', import.meta.url), 'utf8');
  for (const path of ['/investments', '/mutual-funds', '/etfs', '/reits']) {
    assert.match(llms, new RegExp('https://deepscreen\\.online' + path.replace('/', '\\/')));
  }
});


test('investment blog cluster remains indexable, sourced and sitemap-discoverable', async () => {
  const blogIndex = await readFile(new URL('../src/routes/blog.index.tsx', import.meta.url), 'utf8');
  const blogDetail = await readFile(new URL('../src/routes/blog.$slug.tsx', import.meta.url), 'utf8');
  const blogContent = await readFile(new URL('../src/lib/content/investment-blog.ts', import.meta.url), 'utf8');
  const sitemapSections = await readFile(new URL('../src/lib/deepscreen/sitemap-sections.ts', import.meta.url), 'utf8');
  const llms = await readFile(new URL('../public/llms.txt', import.meta.url), 'utf8');

  assert.match(blogIndex, /createFileRoute\("\/blog\/"\)/);
  assert.match(blogIndex, /staticData:\s*\{\s*sitemap:\s*true\s*\}/);
  assert.match(blogDetail, /createFileRoute\("\/blog\/\$slug"\)/);
  assert.match(blogDetail, /BlogPosting/);
  assert.match(blogDetail, /buildFAQSchema/);
  assert.match(blogDetail, /retail-investing-statistics-2026\.html/);
  assert.match(blogDetail, /statusCode:\s*308/);
  assert.match(blogDetail, /index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1/);

  for (const slug of [
    'direct-vs-regular-mutual-funds-india',
    'etf-tracking-error-vs-tracking-difference',
    'ndcf-vs-affo-reit-analysis-india',
    'stop-subscription-creep-recurring-payments-india',
    'what-to-do-after-upi-bank-fraud-india',
    'freelancing-pricing-profit-tax-india',
  ]) {
    assert.match(blogContent, new RegExp('slug: "' + slug + '"'));
    assert.match(llms, new RegExp('https://deepscreen\\.online/blog/' + slug));
  }

  assert.match(sitemapSections, /INVESTMENT_BLOG_POSTS\.map\(\(post\) => \(\{/);
  assert.match(sitemapSections, /path: "\/blog\/" \+ encodePathSegment\(post\.slug\)/);
  assert.match(sitemapSections, /lastmod: post\.updated/);
  assert.match(sitemapSections, /retail-investing-statistics-2026\.html/);
  assert.match(blogContent, /Association of Mutual Funds in India/);
  assert.match(blogContent, /National Stock Exchange of India/);
  assert.match(blogContent, /Securities and Exchange Board of India/);
  assert.match(blogContent, /DeepScreen Tracking Matrix/);
  assert.match(blogContent, /DeepScreen REIT Cash-Flow Bridge/);
  assert.match(blogContent, /DeepScreen Cost-Gap Calculator/);
  assert.match(blogContent, /DeepScreen RACE recurring-payment audit/);
  assert.match(blogContent, /DeepScreen FREEZE fraud-response protocol/);
  assert.match(blogContent, /DeepScreen FLOOR freelance pricing method/);
});

test('commodities GIFT Nifty and IPO GMP Q&A stay visible indexable and source-backed', async () => {
  const routes = [
    ['../src/routes/commodities.tsx', '/blog/how-to-read-commodity-prices-india'],
    ['../src/routes/gift-nifty.tsx', '/blog/gift-nifty-vs-nifty-50-opening-gap'],
    ['../src/routes/ipo-gmp.tsx', '/blog/ipo-gmp-vs-listing-price-reliability'],
  ] as const;

  for (const [routeFile, supportingArticle] of routes) {
    const route = await readFile(new URL(routeFile, import.meta.url), 'utf8');
    assert.match(route, /staticData:\s*\{\s*sitemap:\s*true\s*\}/);
    assert.match(route, /index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1/);
    assert.match(route, /MarketGuideFaqSection/);
    assert.match(route, /buildFAQSchema/);
    assert.match(route, new RegExp(supportingArticle.replaceAll('/', '\\/')));
    assert.doesNotMatch(route, /noindex/i);
  }

  const faq = await readFile(new URL('../src/lib/seo/market-guide-faq.ts', import.meta.url), 'utf8');
  assert.match(faq, /What are commodities in financial markets\?/);
  assert.match(faq, /What is GIFT Nifty\?/);
  assert.match(faq, /What is IPO GMP\?/);
  assert.match(faq, /NSE IX/);
  assert.match(faq, /SEBI/);

  const blogContent = await readFile(new URL('../src/lib/content/investment-blog.ts', import.meta.url), 'utf8');
  for (const slug of [
    'how-to-read-commodity-prices-india',
    'gift-nifty-vs-nifty-50-opening-gap',
    'ipo-gmp-vs-listing-price-reliability',
  ]) {
    assert.match(blogContent, new RegExp('slug: "' + slug + '"'));
  }
  assert.match(blogContent, /DeepScreen Commodity Translation Stack/);
  assert.match(blogContent, /DeepScreen Four-Reference Check/);
  assert.match(blogContent, /DeepScreen IPO Evidence Ladder/);

  const llms = await readFile(new URL('../public/llms.txt', import.meta.url), 'utf8');
  for (const path of [
    '/commodities',
    '/gift-nifty',
    '/ipo-gmp',
    '/blog/how-to-read-commodity-prices-india',
    '/blog/gift-nifty-vs-nifty-50-opening-gap',
    '/blog/ipo-gmp-vs-listing-price-reliability',
  ]) {
    assert.match(llms, new RegExp('https://deepscreen\\.online' + path.replaceAll('/', '\\/')));
  }
});

test('daily personal finance posts remain indexable sourced and AI-discoverable', async () => {
  const blogContent = await readFile(new URL('../src/lib/content/investment-blog.ts', import.meta.url), 'utf8');
  const blogIndex = await readFile(new URL('../src/routes/blog.index.tsx', import.meta.url), 'utf8');
  const llms = await readFile(new URL('../public/llms.txt', import.meta.url), 'utf8');

  for (const slug of [
    'how-to-save-money-every-month-india',
    'how-to-protect-your-money-india',
    'how-to-make-more-money-income-paths-india',
  ]) {
    assert.match(blogContent, new RegExp('slug: "' + slug + '"'));
    assert.match(llms, new RegExp('https://deepscreen\\.online/blog/' + slug));
  }

  assert.match(blogContent, /DeepScreen Savings Ladder/);
  assert.match(blogContent, /DeepScreen Financial Fortress/);
  assert.match(blogContent, /DeepScreen Income Engine Map/);
  assert.match(blogContent, /Reserve Bank of India/);
  assert.match(blogContent, /Deposit Insurance and Credit Guarantee Corporation/);
  assert.match(blogContent, /Insurance Regulatory and Development Authority of India/);
  assert.match(blogContent, /Ministry of Micro, Small and Medium Enterprises/);
  assert.match(blogIndex, /Today · 5 October 2026/);
  assert.match(blogIndex, /Today's money guide: recurring costs, fraud response and freelance economics/);
});

test('investment blog registry has no sparse array entries', async () => {
  const blogContent = await readFile(new URL('../src/lib/content/investment-blog.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(
    blogContent,
    /\},\s*,\s*\{/,
    'A double comma between blog-post objects creates a sparse array entry and breaks new Map() at runtime',
  );
});

test('commodities route does not render escaped newline artifacts', async () => {
  const route = await readFile(new URL('../src/routes/commodities.tsx', import.meta.url), 'utf8');
  assert.ok(!route.includes('>\\n'), 'JSX must not contain literal \\n text after an element');
  assert.ok(!route.includes('\\n<'), 'JSX must not contain literal \\n text before an element');
});

test('DeepScreen and stock-market FAQ remains canonical visible and AI-discoverable', async () => {
  const answersData = await readFile(new URL('../src/lib/discovery/answers.ts', import.meta.url), 'utf8');
  const answersRoute = await readFile(new URL('../src/routes/answers.tsx', import.meta.url), 'utf8');
  const screenerRoute = await readFile(new URL('../src/routes/screener.tsx', import.meta.url), 'utf8');
  const llms = await readFile(new URL('../public/llms.txt', import.meta.url), 'utf8');

  const questionCount = (answersData.match(/^\s{4}question:\s*"/gm) ?? []).length;
  assert.equal(questionCount, 38, 'The canonical FAQ should contain the reviewed 38-answer set');

  assert.match(answersRoute, /ANSWER_GROUPS\.map/);
  assert.match(answersRoute, /resourceHead\([\s\S]*ANSWERS/);
  assert.match(answersRoute, /DeepScreen and stock market questions, answered/);

  assert.match(screenerRoute, /SCREENER_ANSWERS\.map/);
  assert.match(screenerRoute, /buildFAQSchema\([\s\S]*SCREENER_ANSWERS\.map/);
  assert.match(screenerRoute, /Browse all stock-market Q&amp;A/);

  assert.match(llms, /DeepScreen & stock market FAQ/);
  assert.match(llms, /38 visible, canonical answers/);
});
test('all FAQ Q&A and blog discovery surfaces stay crawlable and linked', async () => {
  const knowledgeRoute = await readFile(new URL('../src/routes/knowledge.tsx', import.meta.url), 'utf8');
  const faqIndexRoute = await readFile(new URL('../src/routes/faq-index[.]txt.ts', import.meta.url), 'utf8');
  const feedRoute = await readFile(new URL('../src/routes/blog.feed[.]xml.ts', import.meta.url), 'utf8');
  const knowledgeRegistry = await readFile(new URL('../src/lib/discovery/knowledge-index.ts', import.meta.url), 'utf8');
  const homepageRoute = await readFile(new URL('../src/routes/index.tsx', import.meta.url), 'utf8');
  const homepage = await readFile(new URL('../src/components/landing/LandingPage.tsx', import.meta.url), 'utf8');
  const blogArticle = await readFile(new URL('../src/components/ds/InvestmentBlogArticle.tsx', import.meta.url), 'utf8');
  const learnRoute = await readFile(new URL('../src/routes/learn.$slug.tsx', import.meta.url), 'utf8');
  const optionsRoute = await readFile(new URL('../src/routes/options.$slug.tsx', import.meta.url), 'utf8');
  const stockRoute = await readFile(new URL('../src/routes/stock.$exchange.$symbol.tsx', import.meta.url), 'utf8');
  const legacyBlog = await readFile(new URL('../public/blog/retail-investing-statistics-2026.html', import.meta.url), 'utf8');
  const llms = await readFile(new URL('../public/llms.txt', import.meta.url), 'utf8');

  assert.ok(knowledgeRoute.includes('createFileRoute("/knowledge")'));
  assert.match(knowledgeRoute, /staticData:\s*\{\s*sitemap:\s*true\s*\}/);
  assert.ok(knowledgeRoute.includes('index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'));
  assert.ok(knowledgeRoute.includes('knowledgeGroups()'));
  assert.ok(knowledgeRoute.includes('INVESTMENT_BLOG_POSTS'));

  assert.ok(faqIndexRoute.includes('createFileRoute("/faq-index.txt")'));
  assert.ok(faqIndexRoute.includes('knowledgeText()'));
  assert.ok(faqIndexRoute.includes('text/plain; charset=utf-8'));
  assert.ok(!faqIndexRoute.includes('X-Robots-Tag'));
  assert.ok(feedRoute.includes('createFileRoute("/blog/feed.xml")'));
  assert.ok(feedRoute.includes('application/rss+xml'));
  assert.ok(feedRoute.includes('INVESTMENT_BLOG_POSTS'));
  assert.ok(feedRoute.includes('LEGACY_BLOGS'));

  for (const token of [
    'ANSWERS', 'LANDING_FAQS', 'MARKET_GUIDE_FAQS', 'INVESTMENT_FAQS',
    'INVESTMENT_BLOG_POSTS', 'GUIDES', 'RATIOS', 'STRATEGY_GUIDES',
    'retail-investing-statistics-2026.html',
  ]) assert.ok(knowledgeRegistry.includes(token), token);

  assert.ok(homepageRoute.includes('buildFAQSchema'));
  assert.ok(homepageRoute.includes('LANDING_FAQS'));
  assert.ok(homepage.includes('faqAnchor(question)'));
  assert.ok(blogArticle.includes('id={faqAnchor(faq.q)}'));
  assert.ok(learnRoute.includes('id={faqAnchor('));
  assert.ok(optionsRoute.includes('id={faqAnchor('));
  assert.ok(stockRoute.includes('id={faqAnchor(faq.q)}'));

  assert.ok(legacyBlog.includes('name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"'));
  assert.ok(legacyBlog.includes('rel="canonical" href="https://deepscreen.online/blog/retail-investing-statistics-2026.html"'));
  assert.ok(legacyBlog.includes('id="faq-how-many-retail-investors-does-india-have"'));

  for (const url of [
    'https://deepscreen.online/knowledge',
    'https://deepscreen.online/faq-index.txt',
    'https://deepscreen.online/blog/retail-investing-statistics-2026.html',
  ]) assert.ok(llms.includes(url), url);
});

test('DeepChart trading crypto and forex content stays visible indexable and AI-discoverable', async () => {
  const chartRoute = await readFile(new URL('../src/routes/chart-reader.tsx', import.meta.url), 'utf8');
  const tradingRoute = await readFile(new URL('../src/routes/trading.tsx', import.meta.url), 'utf8');
  const tradingFaq = await readFile(new URL('../src/lib/seo/market-education-faq.ts', import.meta.url), 'utf8');
  const tradingBlog = await readFile(new URL('../src/lib/content/trading-blog.ts', import.meta.url), 'utf8');
  const blogRegistry = await readFile(new URL('../src/lib/content/investment-blog.ts', import.meta.url), 'utf8');
  const knowledgeRegistry = await readFile(new URL('../src/lib/discovery/knowledge-index.ts', import.meta.url), 'utf8');
  const answersRoute = await readFile(new URL('../src/routes/answers.tsx', import.meta.url), 'utf8');
  const robots = await readFile(new URL('../public/robots.txt', import.meta.url), 'utf8');
  const llms = await readFile(new URL('../public/llms.txt', import.meta.url), 'utf8');

  assert.match(chartRoute, /createFileRoute\("\/chart-reader"\)/);
  assert.match(chartRoute, /index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1/);
  assert.match(chartRoute, /buildFAQSchema\(DEEPCHART_FAQS/);
  assert.match(chartRoute, /MarketEducationFaqSection/);
  assert.match(chartRoute, /deepchart-technical-analysis-guide/);
  assert.match(chartRoute, /trading-risk-management-position-sizing/);
  assert.match(chartRoute, /crypto-trading-guide-spot-futures-risk/);
  assert.match(chartRoute, /forex-trading-guide-pips-leverage-risk-india/);

  assert.match(tradingRoute, /createFileRoute\("\/trading"\)/);
  assert.match(tradingRoute, /staticData:\s*\{\s*sitemap:\s*true\s*\}/);
  assert.match(tradingRoute, /buildFAQSchema/);
  assert.match(tradingRoute, /MarketEducationFaqSection/);
  assert.match(tradingRoute, /RBI — Forex transactions FAQ/);
  assert.doesNotMatch(tradingRoute, /noindex/i);

  for (const question of [
    'What is DeepChart?',
    'What is risk management in trading?',
    'What is crypto trading?',
    'What is forex trading?',
    'Can Indian residents trade forex on any online platform?',
  ]) assert.ok(tradingFaq.includes(question), question);

  for (const slug of [
    'deepchart-technical-analysis-guide',
    'trading-risk-management-position-sizing',
    'crypto-trading-guide-spot-futures-risk',
    'forex-trading-guide-pips-leverage-risk-india',
  ]) {
    assert.ok(tradingBlog.includes(`slug: "${slug}"`), slug);
    assert.ok(llms.includes('https://deepscreen.online/blog/' + slug), slug);
  }

  assert.match(blogRegistry, /\.\.\.TRADING_BLOG_POSTS/);
  assert.match(knowledgeRegistry, /MARKET_EDUCATION_FAQS/);
  assert.match(knowledgeRegistry, /\/chart-reader#/);
  assert.match(knowledgeRegistry, /\/trading#/);
  assert.match(answersRoute, /DeepChart, trading, crypto and forex/);

  assert.ok(robots.includes('Allow: /chart-reader'));
  assert.ok(robots.includes('Allow: /trading'));
  assert.ok(llms.includes('https://deepscreen.online/chart-reader'));
  assert.ok(llms.includes('https://deepscreen.online/trading'));
});

test('DeepChart TradingView affiliate link stays transparent and correctly attributed', async () => {
  const chartRoute = await readFile(new URL('../src/routes/chart-reader.tsx', import.meta.url), 'utf8');
  assert.ok(chartRoute.includes('https://in.tradingview.com/?aff_id=1171851'));
  assert.ok(chartRoute.includes('rel="sponsored nofollow noopener noreferrer"'));
  assert.ok(chartRoute.includes('Affiliate disclosure: DeepScreen may earn a commission'));
  assert.ok(chartRoute.includes('Open TradingView'));
});

