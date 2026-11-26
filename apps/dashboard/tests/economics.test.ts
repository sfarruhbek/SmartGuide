import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateEconomics } from '../src/lib/economics';
test('default scenario subtracts museum, processing, AI and server exactly once', () => {
  const result = calculateEconomics(400, 4, 25);
  assert.deepEqual(
    { ...result, margin: Math.round(result.margin * 100) / 100 },
    {
      buyers: 3000,
      gross: 12000,
      museum: 3600,
      payment: 240,
      ai: 120,
      server: 43,
      contribution: 7997,
      margin: 66.64,
    },
  );
});
test('zero sales still pays server and stress usage reduces contribution', () => {
  const empty = calculateEconomics(400, 4, 0);
  assert.equal(empty.contribution, -43);
  assert.equal(empty.margin, 0);
  const base = calculateEconomics(400, 4, 25),
    stress = calculateEconomics(400, 4, 25, 0.15);
  assert.equal(base.contribution - stress.contribution, 330);
  assert.equal(Math.ceil(1604 / (4 * 0.68 - 0.04)), 599);
  assert.equal(Math.ceil(1604 / (4 * 0.68 - 0.15)), 625);
  assert.equal(Math.ceil(1604 / (4 * 0.58 - 0.04)), 704);
});
