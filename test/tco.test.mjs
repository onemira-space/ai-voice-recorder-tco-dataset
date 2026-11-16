import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTcoTable, loadDataset } from '../src/tco.mjs';

test('dataset contains valid URLs and excludes discontinued hardware from active TCO table', () => {
  const ds = loadDataset();
  assert.ok(ds.devices.length >= 14);
  for (const d of ds.devices) {
    assert.match(d.official_url, /^https:\/\//);
    assert.match(d.comparison_url, /^https:\/\/onemira\.com\//);
  }
  const active = calculateTcoTable({ monthlyMinutes: 900, months: 24 });
  assert.ok(!active.some((r) => r.id === 'limitless-pendant'));
});

test('computes accurate 24-month TCO above 300-minute monthly starter caps', () => {
  const active = calculateTcoTable({ monthlyMinutes: 900, months: 24 });
  const c1 = active.find((r) => r.id === 'onemira-c1');
  const plaud = active.find((r) => r.id === 'plaud-note');
  assert.equal(c1.totalUsd, 84.00);
  assert.equal(plaud.totalUsd, Number((159 + 99.99 * 2).toFixed(2)));
});
