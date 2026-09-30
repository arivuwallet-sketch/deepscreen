import assert from 'node:assert/strict';

// Production SSR audit. External providers are deliberately unavailable so a
// network failure cannot mask content, crawlability or missing-data regressions.
globalThis.fetch = async () => new Response('{}', { status: 503, headers: { 'content-type': 'application/json' } });
const app = (await import('../.output/server/index.mjs')).default;
const get = path => app.fetch(new Request(`http://localhost${path}`), {}, { waitUntil() {} });
const decode = text => text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const normalized = text => text.replace(/\s+/g, '');
const locs = xml => [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => decode(match[1]));
const schemaNodes = value => Array.isArray(value) ? value.flatMap(schemaNodes) : value && typeof value === 'object' ? [value, ...Object.values(value).flatMap(schemaNodes)] : [];
const documents = new Map();
const issues = [];
try {
  const sitemapResponse = await get('/sitemap.xml');
  assert.equal(sitemapResponse.status, 200, 'sitemap status');
  const sitemapXml = await sitemapResponse.text();
  assert.match(sitemapXml, /<urlset\b/, 'flat sitemap root');
  assert.ok(!sitemapXml.includes('<sitemapindex'), 'sitemap is not a child index');
  const allUrls = locs(sitemapXml);
  const listed = new Set(allUrls.map(url => new URL(url).pathname + new URL(url).search));
  const samples = ['NSE', 'BSE', 'NYSE', 'NASDAQ', 'LSE'].map(exchange => {
    const path = [...listed].find(path => path.startsWith(`/stock/${exchange}/`));
    assert.ok(path, `${exchange}: company sample exists`);
    return path;
  });
  samples.push('/stock/NSE/M%26M', '/stock/NASDAQ/AAPL');
  for (const path of samples) assert.ok(listed.has(path), `${path}: listed company sample`);
  // Audit every non-company content URL, including all directory pages, and a
  // stock from each supported exchange. Existing indexing checks cover all stock links.
  const paths = [...new Set([...listed].filter(path => !path.startsWith('/stock/')).concat(samples, ['/auth', '/portfolio']))];
  let cursor = 0;
  await Promise.all(Array.from({ length: 3 }, async () => {
    while (cursor < paths.length) {
      const path = paths[cursor++];
      const response = await get(path);
      assert.equal(response.status, 200, `${path}: SSR status`);
      const html = await response.text();
      const title = decode(html.match(/<title[^>]*>(.*?)<\/title>/s)?.[1] || '');
      assert.ok(title.length, `${path}: title`);
      assert.equal((html.match(/<h1\b/g) || []).length, 1, `${path}: one main heading`);
      const descriptions = [...html.matchAll(/<meta\b[^>]*name="description"[^>]*content="([^"]*)"/g)];
      assert.equal(descriptions.length, 1, `${path}: one description`);
      assert.ok(descriptions[0][1].length > 20, `${path}: meaningful description`);
      if (!['/auth', '/portfolio'].includes(path)) {
        const canonical = [...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/g)].map(match => decode(match[1]));
        assert.deepEqual(canonical, [`https://deepscreen.online${path}`], `${path}: unique self-canonical`);
        assert.ok(!/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html), `${path}: remains indexable`);
      }
      const visible = normalized(decode(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, '')));
      const nodes = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(match => schemaNodes(JSON.parse(match[1])));
      for (const node of nodes.filter(node => node['@type'] === 'Question')) {
        if (!visible.includes(normalized(node.name))) issues.push(`${path}: invisible FAQ question ${node.name}`);
        if (!visible.includes(normalized(node.acceptedAnswer.text))) issues.push(`${path}: invisible FAQ answer ${node.name}`);
      }
      const related = html.match(/<nav[^>]*aria-label="Continue your research"[\s\S]*?<\/nav>/)?.[0];
      if (['/pricing', '/auth', '/portfolio'].includes(path)) assert.equal(related, undefined, `${path}: new SEO component excluded`);
      if (related) for (const [, href] of related.matchAll(/href="([^"]+)"/g)) assert.ok(listed.has(decode(href)), `${path}: valid research link ${href}`);
      documents.set(path, { title, html });
    }
  }));
  assert.deepEqual(issues, [], "FAQ structured data must match visible text");
  const titles = new Map();
  for (const [path, { title }] of documents) {
    assert.ok(!titles.has(title), `${path}: title duplicates ${titles.get(title)}`);
    titles.set(title, path);
  }
  for (const path of samples) {
    const html = documents.get(path).html;
    assert.match(html, /Financial data currently unavailable/, `${path}: explicit unavailable state`);
    assert.match(html, /Company profile reference:/, `${path}: missing profile is not attributed as a sourced description`);
    assert.match(html, /href="https:\/\/finance\.yahoo\.com\/quote\/[^"]+\/profile\/"/, `${path}: external company profile reference`);
    assert.match(html, /Financial statements and reporting periods/, `${path}: statement coverage explained`);
    assert.ok(!html.includes('DeepScreen Score'), `${path}: no synthetic score in degraded structured data`);
  }
  console.log(`PASS ${documents.size} SSR pages: unique titles, descriptions, H1s, canonicals, visible FAQ answers and valid contextual links`);
  console.log('PASS provider-outage company pages and pricing/account exclusions');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  // Provider SDK timers need not keep this standalone audit alive.
  process.exit(process.exitCode || 0);
}