import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const origin = process.env.SEO_TEST_ORIGIN || 'http://127.0.0.1:4175';
const server = process.env.SEO_TEST_ORIGIN ? null : spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4175'], { stdio: ['ignore', 'pipe', 'pipe'] });
let logs = '';
server?.stdout.on('data', chunk => { logs += chunk; });
server?.stderr.on('data', chunk => { logs += chunk; });
async function get(path, options = {}) {
  return fetch(new URL(path, origin), { signal: AbortSignal.timeout(45000), ...options });
}
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try { await get('/robots.txt'); ready = true; break; } catch { await delay(200); }
  }
  assert.ok(ready, `Server did not start: ${logs}`);
  const home = await get('/');
  assert.equal(home.status, 200);
  const html = await home.text();
  assert.match(html, /Global stock screening across five exchanges/);
  assert.ok(!html.includes('SearchAction'));
  assert.ok(!html.includes('Highest-scoring companies globally'));
  const jsonScripts = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  assert.ok(jsonScripts.length > 0);
  for (const match of jsonScripts) JSON.parse(match[1]);
  console.log('PASS home SSR, descriptive heading and valid JSON-LD');

  const index = await get('/sitemap.xml');
  assert.equal(index.status, 200);
  const sections = [...(await index.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname);
  assert.ok(sections.length > 3);
  let urls = 0;
  for (const path of sections) {
    const response = await get(path);
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get('content-type'), /xml/);
    const xml = await response.text();
    assert.ok(!xml.includes('/ratios/pe-ratio'));
    assert.ok(!xml.includes('/options-strategy/'));
    urls += [...xml.matchAll(/<url>/g)].length;
  }
  assert.ok(urls > 13000);
  assert.equal((await get('/sitemaps/unknown.xml')).status, 404);
  console.log(`PASS sitemap index, ${sections.length} child sitemaps and ${urls} URLs`);

  for (const [from, to] of [['/ratios/pe-ratio', '/learn/pe-ratio'], ['/options-strategy/long-call', '/options/long-call']]) {
    const response = await get(from, { redirect: 'manual' });
    assert.equal(response.status, 301, from);
    assert.equal(new URL(response.headers.get('location'), origin).pathname, to);
  }
  console.log('PASS permanent redirects for duplicate guides');
  const page = await get('/exchange/NSE?page=2');
  assert.equal(page.status, 200);
  const pageHtml = await page.text();
  assert.match(pageHtml, /href="https:\/\/deepscreen.online\/exchange\/NSE\?page=2"/);
  assert.match(pageHtml, /href="\/exchange\/NSE\?page=3"/);
  assert.equal((await get('/exchange/NSE?page=999')).status, 404);
  console.log('PASS crawlable pagination, self-canonical URLs and out-of-range 404');
  const auth = await get('/auth');
  assert.match(await auth.text(), /noindex, follow/);
  console.log('PASS account page noindex');
  const footerPages = ['/contact', '/about', '/methodology', '/answers', '/research-checklist', '/data-sources', '/developers', '/press', '/terms', '/privacy', '/refund-policy'];
  for (const path of footerPages) {
    const response = await get(path);
    assert.equal(response.status, 200, path);
    const pageHtml = await response.text();
    for (const match of pageHtml.matchAll(/(?:href|to)="(\/[^"]+)"/g)) {
      const target = match[1];
      if (/^\/(?:api|sitemaps\/)/.test(target) || target === '/sitemap.xml' || target === '/openapi.json' || target.endsWith('.txt') || target.endsWith('.ssml')) continue;
      const targetResponse = await get(target, { redirect: 'manual' });
      assert.ok(targetResponse.status < 500, `${path} -> ${target} returned ${targetResponse.status}`);
    }
  }
  const peRatio = await get('/learn/pe-ratio', { redirect: 'manual' });
  assert.equal(peRatio.status, 308);
  assert.equal(new URL(peRatio.headers.get('location'), origin).pathname, '/learn/pe-ratio-explained');
  console.log('PASS footer destination crawl and legacy P/E URL compatibility');

} finally {
  server?.kill('SIGTERM');
}
