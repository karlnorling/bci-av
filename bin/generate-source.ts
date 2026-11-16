/**
 * generate-source.ts
 *
 * Joins the BCI-AV SVG archive to the reference spreadsheet and writes
 * `packages/@bci-av/core/src/symbols.generated.ts`.
 *
 * The join is the whole job. The archive names each file after its English
 * gloss ("house_work,housekeeping,housework.svg"), while the spreadsheet keys
 * on the numeric BCI-AV id, so the gloss string is the only link between a
 * symbol's artwork and its metadata. Matching the full gloss exactly resolves
 * 6,542 of 6,554 rows; the remainder differ only in how many synonyms the two
 * sources list, which the synonym fallbacks below pick up.
 *
 * Usage: yarn generate
 */

import fs from 'node:fs';
import path from 'node:path';
import { unzipSync } from 'fflate';
import { optimize } from 'svgo';
import { readOds } from './lib/ods';
import { EDITION, REFERENCE_FILE, SVG_ARCHIVE } from './lib/upstream';

const OUT = path.join('packages', '@bci-av', 'core', 'src', 'symbols.generated.ts');

/**
 * Spreadsheet columns, by header name. The sheet carries 63 columns, most of
 * them empty padding, so they are resolved by header rather than by index.
 */
const ID = 'BCI-AV#';
const ENGLISH = 'English';
const DERIVATION = 'Derivation - explanation';
const POS = 'POS';

/**
 * The 19 gloss languages, mapped to ISO 639-1 so consumers get `names.de`
 * rather than `names.German`. "Portugese" is the sheet's own spelling.
 */
const LANGUAGES: Record<string, string> = {
  English: 'en',
  Swedish: 'sv',
  Norwegian: 'no',
  Finnish: 'fi',
  Hungarian: 'hu',
  German: 'de',
  Dutch: 'nl',
  Afrikaans: 'af',
  Russian: 'ru',
  Icelandic: 'is',
  Lithuanian: 'lt',
  Latvian: 'lv',
  Polish: 'pl',
  French: 'fr',
  Spanish: 'es',
  Portugese: 'pt',
  Italian: 'it',
  Danish: 'da',
  Esperanto: 'eo',
};

/**
 * Flattens the shared `<style>` block into presentation attributes.
 *
 * Every one of the 6,556 files declares the same nine class names — `pen0`,
 * `brush0`, `font0` and so on. Inlining two symbols into one document makes the
 * last `<style>` win and silently restyles the others, so the classes cannot
 * survive. The rules are trivial (a stroke width, a fill colour), so they are
 * applied directly to the elements that reference them and the block is dropped.
 */
const inlineStyles = (svg: string): string => {
  const block = /<style[^>]*>([\s\S]*?)<\/style>/i.exec(svg);
  if (!block) return svg;

  const rules = new Map<string, string>();
  for (const match of block[1].matchAll(/\.([A-Za-z_][\w-]*)\s*\{([^}]*)\}/g)) {
    rules.set(match[1], match[2].replace(/\s+/g, ' ').trim().replace(/;$/, ''));
  }

  let out = svg.replace(block[0], '');
  out = out.replace(/class="([^"]*)"/g, (_whole, names: string) => {
    const style = names
      .split(/\s+/)
      .map((n) => rules.get(n))
      .filter(Boolean)
      .join('; ');
    return style ? `style="${style}"` : '';
  });
  return out;
};

/**
 * Strips the physical dimensions and normalises the root element.
 *
 * Upstream sets `width="3.385416666666666in" height="4.5in"` with
 * `preserveAspectRatio="none"`, which distorts the drawing whenever a consumer
 * sets only one of width/height. The viewBox is clean, so it alone should drive
 * scaling.
 */
const normaliseRoot = (svg: string): string =>
  svg
    .replace(/<\?xml[^>]*\?>/g, '')
    .replace(/<!DOCTYPE[^>]*>/g, '')
    .replace(/\s+(width|height)="[^"]*in"/g, '')
    .replace(/\s+preserveAspectRatio="none"/g, '')
    .trim();

const optimise = (svg: string): string => {
  try {
    return optimize(svg, { multipass: true, plugins: ['preset-default'] }).data;
  } catch {
    return svg;
  }
};

/** Splits a gloss field into its synonyms, e.g. "percent,percentage,%". */
const synonyms = (gloss: string): string[] =>
  gloss
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Normalises a single synonym so the spreadsheet and the archive agree on it.
 *
 * The two sources were produced by different tools and disagree in small ways
 * that all five remaining join failures came down to:
 *
 *   children's_rights      vs  children\u2019s_rights   (straight vs curly apostrophe)
 *   edit_(text)-(to)       vs  edit-(to)_(text)         (parts in a different order)
 *   picture,image,...      vs  picture,image,..._(1)    (a disambiguator suffix)
 *
 * Folding apostrophes, dropping the "_(1)" suffix and sorting the bracketed
 * and unbracketed parts makes all three forms compare equal.
 */
const normaliseSynonym = (value: string): string => {
  const folded = value
    .toLowerCase()
    .replace(/[\u2018\u2019\u02bc]/g, "'")
    .replace(/_\(\d+\)$/, '')
    .replace(/[\s_]+/g, ' ')
    .trim();
  // "edit (text)-(to)" and "edit-(to) (text)" differ only in part order.
  const parts = folded
    .split(/[-\s]+/)
    .filter(Boolean)
    .sort();
  return parts.join(' ');
};

/** A URL- and identifier-safe slug, e.g. "house_work,housekeeping" -> "house-work". */
const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const main = (): void => {
  for (const file of [SVG_ARCHIVE, REFERENCE_FILE]) {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing ${file}. Run 'yarn fetch' first.`);
    }
  }

  // --- artwork -------------------------------------------------------------
  const zip = unzipSync(new Uint8Array(fs.readFileSync(SVG_ARCHIVE)));
  const artwork = new Map<string, string>();
  /** Every normalised synonym a file is reachable by -> that file's key. */
  const bySynonym = new Map<string, string>();
  for (const [entry, bytes] of Object.entries(zip)) {
    if (!entry.endsWith('.svg')) continue;
    const gloss = path.basename(entry, '.svg');
    artwork.set(gloss, Buffer.from(bytes).toString('utf-8'));
    for (const syn of synonyms(gloss)) {
      const key = normaliseSynonym(syn);
      if (key && !bySynonym.has(key)) bySynonym.set(key, gloss);
    }
  }
  console.log(`Read ${artwork.size} SVGs from ${SVG_ARCHIVE}`);

  // --- metadata ------------------------------------------------------------
  const sheet = readOds(REFERENCE_FILE);
  const header = sheet[0];
  const col = (name: string): number => {
    const index = header.indexOf(name);
    if (index === -1) throw new Error(`Column "${name}" is missing from ${REFERENCE_FILE}`);
    return index;
  };
  console.log(`Read ${sheet.length - 1} rows from ${REFERENCE_FILE}`);

  const idCol = col(ID);
  const englishCol = col(ENGLISH);
  const derivationCol = col(DERIVATION);
  const posCol = col(POS);
  const langCols = Object.entries(LANGUAGES)
    .filter(([name]) => header.includes(name))
    .map(([name, code]) => [code, col(name)] as const);

  // --- join ----------------------------------------------------------------
  type GeneratedSymbol = {
    id: string;
    bciAv: string;
    gloss: string;
    synonyms: string[];
    names: Record<string, string>;
    derivation: string;
    pos: string;
    svg: string;
  };

  const symbols: GeneratedSymbol[] = [];
  const unmatched: string[] = [];
  const usedIds = new Set<string>();
  const usedArtwork = new Set<string>();

  for (const row of sheet.slice(1)) {
    const bciAv = (row[idCol] ?? '').trim();
    const gloss = (row[englishCol] ?? '').trim();
    if (!bciAv || !gloss) continue;

    const words = synonyms(gloss);
    // Exact filename first, which covers 6,542 of 6,554 rows. Then match on any
    // single normalised synonym, which resolves the rest: the two sources
    // sometimes list a different number of synonyms, or spell one differently.
    const key =
      (artwork.has(gloss) ? gloss : undefined) ??
      words.map((w) => bySynonym.get(normaliseSynonym(w))).find(Boolean);

    if (!key) {
      unmatched.push(`${bciAv} ${gloss}`);
      continue;
    }
    usedArtwork.add(key);

    // Ids come from the gloss, not the BCI-AV number, so lookups read as
    // getSymbol('house-work') rather than getSymbol('14916'). The number stays
    // available as `bciAv`, and is the stable key across editions.
    let id = slugify(words[0]);
    if (!id) id = `bci-${bciAv}`;
    if (usedIds.has(id)) id = `${id}-${bciAv}`;
    usedIds.add(id);

    const names: Record<string, string> = {};
    for (const [code, index] of langCols) {
      const value = (row[index] ?? '').trim();
      if (value) names[code] = value;
    }

    symbols.push({
      id,
      bciAv,
      gloss: words[0],
      synonyms: words,
      names,
      derivation: (row[derivationCol] ?? '').trim(),
      pos: (row[posCol] ?? '').trim(),
      svg: optimise(normaliseRoot(inlineStyles(artwork.get(key)!))),
    });
  }

  symbols.sort((a, b) => Number(a.bciAv) - Number(b.bciAv));

  // --- write ---------------------------------------------------------------
  const lines = [
    '// THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY.',
    "// Run 'yarn update' to regenerate.",
    "// @ts-nocheck — 6,500+ literal objects exceed TypeScript's union complexity",
    '// limit (TS2590). The array is annotated BlissSymbol[], so consumers still get',
    "// full type information; only checking this file's own literals is skipped.",
    `// Source: BCI Authorized Vocabulary ${EDITION}, Blissymbolics Communication International.`,
    '// Blissymbols are licensed CC BY-SA 4.0 by BCI. See NOTICE.',
    '',
    "import type { BlissSymbol } from './types';",
    '',
    `/** The BCI-AV edition this registry was generated from. */`,
    `export const EDITION = ${JSON.stringify(EDITION)};`,
    '',
    'export const symbols: BlissSymbol[] = [',
  ];
  for (const s of symbols) {
    lines.push(
      '  {',
      `    bciAv: ${JSON.stringify(s.bciAv)},`,
      `    derivation: ${JSON.stringify(s.derivation)},`,
      `    gloss: ${JSON.stringify(s.gloss)},`,
      `    id: ${JSON.stringify(s.id)},`,
      `    names: ${JSON.stringify(s.names)},`,
      `    pos: ${JSON.stringify(s.pos)},`,
      `    svg: ${JSON.stringify(s.svg)},`,
      `    synonyms: ${JSON.stringify(s.synonyms)},`,
      '  },',
    );
  }
  lines.push('];', '');

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, lines.join('\n'), 'utf-8');

  const size = (fs.statSync(OUT).size / 1024 / 1024).toFixed(1);
  console.log(`\nWrote ${OUT} (${symbols.length} symbols, ${size} MB)`);
  if (unmatched.length > 0) {
    console.log(`\n${unmatched.length} row(s) had no matching artwork:`);
    for (const u of unmatched) console.log(`  ${u}`);
  }
  const orphans = [...artwork.keys()].filter((k) => !usedArtwork.has(k));
  if (orphans.length > 0) {
    console.log(`\n${orphans.length} SVG(s) not referenced by any row (first 10):`);
    for (const o of orphans.slice(0, 10)) console.log(`  ${o}`);
  }
};

main();
