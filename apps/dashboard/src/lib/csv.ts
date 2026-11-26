/** Keep user-written questions as text when a spreadsheet opens the report. */
export function escapeCsvCell(value: string | number | boolean): string {
  let text = String(value ?? '');
  if (typeof value === 'string' && /^[\s\u0000-\u001f]*[=+\-@]/u.test(text))
    text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
export function safeCsv(text: string): string {
  const input = text.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [],
    cell = '',
    quoted = false;
  for (let index = 0; index < input.length; index++) {
    const char = input[index];
    if (char === '"') {
      if (quoted && input[index + 1] === '"') {
        cell += '"';
        index++;
      } else if (quoted) quoted = false;
      else if (!cell) quoted = true;
      else throw new Error('Malformed CSV');
    } else if (!quoted && char === ',') {
      row.push(cell);
      cell = '';
    } else if (!quoted && (char === '\r' || char === '\n')) {
      row.push(cell);
      rows.push(row);
      cell = '';
      row = [];
      if (char === '\r' && input[index + 1] === '\n') index++;
    } else cell += char;
  }
  if (quoted) throw new Error('Malformed CSV');
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.map((record) => record.map(escapeCsvCell).join(',')).join('\r\n');
}
