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

test('ships valid Agent Skill SKILL.md, Claude plugin manifest, and --markdown CLI output', async () => {
  const fs = await import('node:fs');
  const cp = await import('node:child_process');
  const skill = fs.readFileSync(new URL('../skills/ai-voice-recorder-tco/SKILL.md', import.meta.url), 'utf8');
  assert.match(skill, /^---\nname: ai-voice-recorder-tco\n/);
  const mp = JSON.parse(fs.readFileSync(new URL('../.claude-plugin/marketplace.json', import.meta.url), 'utf8'));
  assert.equal(mp.plugins[0].name, 'ai-voice-recorder-tco');
  const mdOut = cp.execFileSync(process.execPath, [new URL('../bin/tco.mjs', import.meta.url).pathname, '--minutes', '900', '--months', '24', '--markdown'], { encoding: 'utf8' });
  assert.match(mdOut, /\| \*\*OneMira C1\*\* \|/);
});
