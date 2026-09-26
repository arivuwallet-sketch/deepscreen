import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ANSWERS } from '../src/lib/discovery/answers.ts';
import { findStockComparison, ratioGuideSlug } from '../src/lib/seo/content.ts';
import { legacyGuideRedirect } from '../src/lib/seo/canonical.ts';

test('published comparison answer targets an existing company comparison', () => {
  const answer = ANSWERS.find((item) => item.id === 'compare-stocks')!;
  assert.ok(findStockComparison(answer.href.replace('/compare/', '')));
});

test('P/E canonical guide mapping preserves other metric slugs', () => {
  assert.equal(ratioGuideSlug('pe-ratio'), 'pe-ratio-explained');
  assert.equal(ratioGuideSlug('roe'), 'roe');
});

test('legacy P/E GET and HEAD links preserve query parameters', () => {
  for (const method of ['GET', 'HEAD']) {
    for (const path of ['/learn/pe-ratio', '/learn/pe-ratio/']) {
      const response = legacyGuideRedirect(new Request(`https://deepscreen.online${path}?source=old`, { method }));
      assert.equal(response?.status, 308);
      assert.equal(response?.headers.get('location'), 'https://deepscreen.online/learn/pe-ratio-explained?source=old');
    }
  }
  assert.equal(legacyGuideRedirect(new Request('https://deepscreen.online/learn/pe-ratio', { method: 'POST' })), null);
  assert.equal(legacyGuideRedirect(new Request('https://deepscreen.online/learn/pe-ratio-explained')), null);
});

test('guide inventory has no empty entries and every slug resolves', async () => {
  const { GUIDES, findGuide } = await import('../src/lib/deepscreen/guides.ts');
  for (const guide of GUIDES) {
    assert.ok(guide?.slug, 'Empty guide entries break sitemap generation and lookup');
    assert.equal(findGuide(guide.slug), guide);
  }
  assert.equal(findGuide('not-a-real-guide'), undefined);
});
