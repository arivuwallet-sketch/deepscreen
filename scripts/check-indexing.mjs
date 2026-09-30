import assert from 'node:assert/strict';
// Exercise the built Cloudflare worker's HTTP handler without client JavaScript.
// Run `npm run build` first. Set SEO_TEST_ORIGIN to audit an existing deployment.
const origin = process.env.SEO_TEST_ORIGIN || 'http://localhost';
const app = process.env.SEO_TEST_ORIGIN ? null : (await import('../.output/server/index.mjs')).default;
const get = (path, options = {}) => {
  const request = new Request(new URL(path, origin), { signal: AbortSignal.timeout(15000), ...options });
  return app ? app.fetch(request, {}, { waitUntil() {} }) : fetch(request);
};
const locs = xml => [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1].replaceAll('&amp;', '&'));
const hrefs = html => [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1].replaceAll('&amp;', '&'));
const canonical = html => [...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"[^>]*>/g)].map(m => m[1].replaceAll('&amp;', '&'));
try {
  const sitemap = await get('/sitemap.xml');
  assert.equal(sitemap.status, 200);
  assert.match(sitemap.headers.get('content-type') || '', /xml/);
  const sitemapXml = await sitemap.text();
  assert.match(sitemapXml, /<urlset\b/);
  assert.ok(!sitemapXml.includes('<sitemapindex'));
  const urls = locs(sitemapXml);
  assert.equal(new Set(urls).size, urls.length, 'Sitemap URLs must be unique');
  assert.ok(urls.every(url => url.startsWith('https://deepscreen.online/')));
  assert.ok(urls.every(url => !/\/auth|\/portfolio/.test(url)));
  const stocks = new Set(urls.filter(url => new URL(url).pathname.startsWith('/stock/')).map(url => new URL(url).pathname));
  const directories = urls.filter(url => new URL(url).pathname.startsWith('/exchange/'));
  assert.ok(stocks.size > 13000);
  assert.ok(directories.length > 100);
  const found = new Set();
  // A bounded crawl of every directory proves no listed company is orphaned.
  let next = 0;
  await Promise.all(Array.from({ length: 3 }, async () => {
    while (next < directories.length) {
      const url = new URL(directories[next++]);
      const response = await get(url.pathname + url.search);
      assert.equal(response.status, 200, url.href);
      const html = await response.text();
      assert.deepEqual(canonical(html), [url.href], `Unique self-canonical: ${url.href}`);
      const links = hrefs(html);
      for (const href of links) if (href.startsWith('/stock/')) found.add(new URL(href, origin).pathname);
      if (!url.search) {
        for (const peer of directories.filter(peer => new URL(peer).pathname === url.pathname)) {
          const target = new URL(peer);
          assert.ok(links.includes(target.pathname + target.search), `Missing direct page link: ${peer}`);
        }
      }
    }
  }));
  assert.deepEqual([...stocks].filter(path => !found.has(path)), [], 'Every stock in the sitemap must have an SSR directory link');
  console.log(`PASS flat sitemap, ${urls.length} unique URLs, ${stocks.size} stocks reachable through ${directories.length} directory pages`);

  for (const query of ['0', '-1', '1.5', 'abc', 'Infinity', '999999']) {
    assert.equal((await get(`/exchange/NSE?page=${query}`)).status, 404, query);
  }
  for (const [from, to] of [
    ['/exchange/nse?page=2', '/exchange/NSE?page=2'],
    ['/exchange/NSE?page=1', '/exchange/NSE'],
    ['/stock/nse/tcs', '/stock/NSE/TCS'],
  ]) {
    const response = await get(from, { redirect: 'manual' });
    assert.equal(response.status, 308, from);
    assert.equal(new URL(response.headers.get('location'), origin).pathname + new URL(response.headers.get('location'), origin).search, to);
  }
  assert.equal((await get('/stock/NSE/NOT_A_REAL_STOCK')).status, 404);
  console.log('PASS invalid-page 404s and permanent redirects for duplicate URLs');

  for (const path of ['/stock/NSE/M%26M', '/stock/NASDAQ/AAPL']) {
    const start = Date.now();
    const response = await get(path);
    const html = await response.text();
    assert.equal(response.status, 200, path);
    assert.ok(Date.now() - start < 8000, `Slow stock SSR: ${path}`);
    assert.deepEqual(canonical(html), [`https://deepscreen.online${path}`]);
    assert.match(html, /<h1\b/);
    assert.ok(!/<meta[^>]*name="robots"[^>]*content="noindex/.test(html));
    for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
    console.log(`PASS stock SSR ${path}: ${Date.now() - start}ms, canonical and JSON-LD`);
  }
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
// Nitro and database SDKs retain worker-lifetime timers. All HTTP bodies and
// assertions above are awaited; close this standalone local audit afterwards.
if (app) process.exit(process.exitCode ?? 0);