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
