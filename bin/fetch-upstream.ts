/* oxlint-disable no-await-in-loop */

/**
 * fetch-upstream.ts
 *
 * Downloads the two files that make up a BCI-AV edition into `data/`:
 * the SVG archive and the reference spreadsheet.
 *
 * Usage:
 *   yarn fetch            # skip anything already downloaded
 *   yarn fetch --force    # re-download
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  DATA_DIR,
  EDITION,
  REFERENCE_FILE,
  REFERENCE_URL,
  SVG_ARCHIVE,
  SVG_ARCHIVE_URL,
  USER_AGENT,
} from './lib/upstream';

const FETCH_TIMEOUT_MS = 120_000;

const download = async (url: string, dest: string, force: boolean): Promise<void> => {
  const name = path.basename(dest);

  if (!force && fs.existsSync(dest) && fs.statSync(dest).size > 0) {
    const mb = (fs.statSync(dest).size / 1024 / 1024).toFixed(1);
    console.log(`  ${name}: already present (${mb} MB) — use --force to re-download`);
    return;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const bytes = Buffer.from(await res.arrayBuffer());
    // Guard against a server that answers 200 with an error page: both files
    // are zip containers, so they must start with the local file header "PK".
    if (bytes.subarray(0, 2).toString('latin1') !== 'PK') {
      throw new Error(`${name} is not a zip container — upstream returned something else`);
    }
    fs.writeFileSync(dest, bytes);
    console.log(`  ${name}: ${(bytes.length / 1024 / 1024).toFixed(1)} MB`);
  } finally {
    clearTimeout(timer);
  }
};

const main = async (): Promise<void> => {
  const force = process.argv.includes('--force');
  fs.mkdirSync(DATA_DIR, { recursive: true });

  console.log(`Fetching BCI-AV ${EDITION} from blissymbolics.net`);
  await download(SVG_ARCHIVE_URL, SVG_ARCHIVE, force);
  await download(REFERENCE_URL, REFERENCE_FILE, force);
  console.log('\nDone. Run `yarn generate` to rebuild the registry.');
};

void main();
