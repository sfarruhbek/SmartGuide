import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeCsvCell, safeCsv } from '../src/lib/csv';
test('tourist-supplied formulas stay text, including whitespace prefixes', () => {
  for (const input of [
    '=1+1',
    '+SUM(A1:A2)',
    '-1+1',
    '@SUM(A1:A2)',
    ' \t=HYPERLINK("x")',
  ])
    assert.ok(escapeCsvCell(input).includes("'"));
  assert.equal(escapeCsvCell(-5), '-5');
  assert.equal(escapeCsvCell('Минарет'), 'Минарет');
  assert.equal(escapeCsvCell('A, "B"'), '"A, ""B"""');
});
test('API CSV handles BOM, escaped quotes and multiline fields before sanitizing', () => {
  const csv =
    '\uFEFFName,Question\r\n"A, B","=1+1"\r\nC,"Line 1\nLine ""2"""\r\n';
  assert.equal(
    safeCsv(csv),
    'Name,Question\r\n"A, B",\'=1+1\r\nC,"Line 1\nLine ""2"""',
  );
  assert.throws(() => safeCsv('A,"unfinished'));
});
