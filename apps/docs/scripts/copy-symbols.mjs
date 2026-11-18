/**
 * Copies the symbol SVGs into public/ so the gallery can reference them as
 * ordinary files.
 *
 * The gallery renders 6,551 <img loading="lazy"> cells rather than inlining the
 * SVGs, which keeps the page small and lets the browser fetch only what is
 * scrolled into view. Astro's publicDir cannot reach into a workspace package,
 * so the files are copied in before the build.
 */
import fs from 'node:fs';
import path from 'node:path';

const from = path.resolve('../../packages/@bci-av/assets/assets');
const to = path.resolve('public/symbols');

if (!fs.existsSync(from)) {
  console.error(`Missing ${from}. Run 'yarn generate-assets' at the repo root first.`);
  process.exit(1);
}

fs.rmSync(to, { recursive: true, force: true });
fs.mkdirSync(to, { recursive: true });

let copied = 0;
for (const file of fs.readdirSync(from)) {
  if (!file.endsWith('.svg')) continue;
  fs.copyFileSync(path.join(from, file), path.join(to, file));
  copied++;
}
console.log(`Copied ${copied} symbol SVGs into public/symbols`);

// A compact search index for the gallery.
//
// Rendering all 6,551 cells server-side produced 26,441 DOM elements and made
// the filter walk every cell on each keystroke. The gallery now renders one
// page and appends the rest from this index, so the initial DOM stays small
// while search still covers the whole vocabulary.
//
// Only the fields the gallery needs: id for the image path and label, the
// searchable text, and the part of speech for the filter. Keys are short
// because this repeats 6,551 times.
const { symbols } = await import('@bci-av/core');

const index = symbols.map((s) => ({
  i: s.id,
  g: s.gloss,
  n: s.bciAv,
  p: s.pos,
  s: `${s.synonyms.join(' ')} ${s.bciAv}`.toLowerCase(),
}));

const indexFile = path.resolve('public/symbol-index.json');
fs.writeFileSync(indexFile, JSON.stringify(index));
const kb = (fs.statSync(indexFile).size / 1024).toFixed(0);
console.log(`Wrote public/symbol-index.json (${index.length} entries, ${kb} KB)`);
