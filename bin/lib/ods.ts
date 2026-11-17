/**
 * ods.ts
 *
 * A minimal reader for the one OpenDocument spreadsheet this repo consumes.
 *
 * An .ods file is a zip whose `content.xml` holds the table. Two details make a
 * naive XML walk produce misaligned rows, and both are handled here:
 *
 *   - `table:number-columns-repeated` collapses runs of identical cells, so a
 *     row of 63 cells can be far fewer elements. Ignoring it shifts every
 *     column after the first repeat.
 *   - a cell's text can be split across several `<text:p>` / `<text:span>`
 *     children, so the value is the concatenation of its descendants.
 *   - a cell can carry an `<office:annotation>` — a spreadsheet comment —
 *     whose own date and body are descendants of the cell. Concatenating those
 *     too corrupted one row's part of speech into
 *     "2025-11-17T00:00:00Because a group is blueBLUE".
 *
 * Pulling in a spreadsheet library for one file of one known shape would be a
 * much larger dependency than the ~40 lines it replaces.
 */

import { XMLParser } from 'fast-xml-parser';
import { readFileSync } from 'node:fs';
import { unzipSync } from 'fflate';

/** A sheet as a dense array of rows, each a dense array of cell strings. */
export type Sheet = string[][];

/**
 * The repeat count is capped: the trailing columns of these sheets are padded
 * with a repeat in the thousands, which would otherwise allocate rows of
 * useless empty strings.
 */
const MAX_REPEAT = 64;

/**
 * Keys whose contents are not part of a cell's value.
 *
 * `office:annotation` is a spreadsheet comment: it lives inside the cell and
 * carries its own `<dc:date>` and body text.
 */
const NOT_CELL_TEXT = new Set(['office:annotation']);

const textOf = (node: unknown): string => {
  if (node === null || node === undefined) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (typeof node === 'object') {
    return Object.entries(node as Record<string, unknown>)
      .filter(([key]) => !key.startsWith('@_') && !NOT_CELL_TEXT.has(key))
      .map(([, value]) => textOf(value))
      .join('');
  }
  return '';
};

const asArray = <T>(value: T | T[] | undefined): T[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

/** Reads the first table out of an .ods file. */
export const readOds = (file: string): Sheet => {
  const zip = unzipSync(new Uint8Array(readFileSync(file)));
  const content = zip['content.xml'];
  if (!content) throw new Error(`${file} has no content.xml — not an .ods file?`);

  const parsed = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    trimValues: false,
  }).parse(Buffer.from(content).toString('utf-8')) as Record<string, unknown>;

  const body = (parsed['office:document-content'] as Record<string, unknown>)?.[
    'office:body'
  ] as Record<string, unknown>;
  const spreadsheet = body?.['office:spreadsheet'] as Record<string, unknown>;
  const table = asArray(spreadsheet?.['table:table'])[0] as Record<string, unknown>;
  if (!table) throw new Error(`${file} contains no table`);

  const rows: Sheet = [];
  for (const row of asArray(table['table:table-row'])) {
    const cells: string[] = [];
    for (const cell of asArray((row as Record<string, unknown>)['table:table-cell'])) {
      const record = cell as Record<string, unknown>;
      const repeat = Math.min(
        Number(record['@_table:number-columns-repeated'] ?? 1) || 1,
        MAX_REPEAT,
      );
      const value = textOf(record).trim();
      for (let i = 0; i < repeat; i++) cells.push(value);
    }
    rows.push(cells);
  }
  return rows;
};
