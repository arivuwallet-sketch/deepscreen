import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  computeHistoricalMetrics,
  parseMutualFundPlan,
  type HistoricalPoint,
} from '../src/lib/deepscreen/investment-analysis.ts';

const DAY = 86_400_000;
const YEAR = 365.2425 * DAY;

test('mutual fund plan parser distinguishes Direct, Regular, Growth and IDCW', () => {
  assert.deepEqual(parseMutualFundPlan('Example Equity Fund — Direct Plan · Growth'), {
    planType: 'Direct',
    optionType: 'Growth',
  });
  assert.deepEqual(parseMutualFundPlan('Example Equity Fund — Regular Plan · IDCW'), {
    planType: 'Regular',
    optionType: 'IDCW',
  });
  assert.deepEqual(parseMutualFundPlan('Example Fund Institutional Option'), {
    planType: 'Unclear',
    optionType: 'Other',
  });
});

test('historical metrics recover stable annualized growth and rolling consistency', () => {
  const start = Date.UTC(2014, 0, 3);
  const points: HistoricalPoint[] = [];
  for (let week = 0; week < 12 * 52; week += 1) {
    const at = start + week * 7 * DAY;
    const years = (at - start) / YEAR;
    points.push({ at, value: 100 * Math.pow(1.1, years) });
  }
  const metrics = computeHistoricalMetrics(points);
  assert.ok(metrics);
  assert.ok(Math.abs(metrics.return3yAnnualizedPct! - 10) < 0.15);
  assert.ok(Math.abs(metrics.return5yAnnualizedPct! - 10) < 0.15);
  assert.ok(Math.abs(metrics.return10yAnnualizedPct! - 10) < 0.15);
  assert.equal(metrics.rolling3yPositivePct, 100);
  assert.equal(metrics.rolling5yPositivePct, 100);
  assert.ok((metrics.volatility3yPct ?? 1) < 0.05);
});

test('historical metrics report drawdown as a negative percentage', () => {
  const start = Date.UTC(2020, 0, 3);
  const values = [100, 110, 120, 90, 80, 100, 125];
  const points: HistoricalPoint[] = values.map((value, index) => ({
    at: start + index * 180 * DAY,
    value,
  }));
  const metrics = computeHistoricalMetrics(points);
  assert.ok(metrics);
  assert.ok((metrics.maxDrawdown3yPct ?? 0) < -30);
  assert.ok((metrics.maxDrawdown3yPct ?? -100) > -35);
});
