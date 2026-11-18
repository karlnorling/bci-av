/**
 * generate-languages.ts
 *
 * Writes one package per gloss language: @bci-av/sv, @bci-av/de, and so on.
 *
 * `@bci-av/core` carries glosses for all 19 languages, which is 2.6 MB of the
 * registry. Almost every consumer uses one or two, so a Swedish application
 * ships 2.6 MB to use 167 KB of it. These packages make that proportional.
 *
 * Named by ISO 639-1 **language** code, not ISO 3166 country code: these are
 * glosses for the same symbols, not regional variants of them the way
 * road-signs has per-country sign sets. `@bci-av/se` would imply a Swedish
 * Bliss that does not exist, would disagree with core's own `names.sv` key,
 * and has no answer for Esperanto.
 *
 * Usage: yarn generate-languages
 */

import fs from 'node:fs';
import path from 'node:path';
import { symbols } from '../packages/@bci-av/core/src/symbols.generated';

const PKG_ROOT = path.join('packages', '@bci-av');

/** ISO 639-1 code -> English name, for descriptions and keywords. */
const LANGUAGES: Record<string, string> = {
  af: 'Afrikaans',
  da: 'Danish',
  de: 'German',
  en: 'English',
  eo: 'Esperanto',
  es: 'Spanish',
  fi: 'Finnish',
  fr: 'French',
  hu: 'Hungarian',
  is: 'Icelandic',
  it: 'Italian',
  lt: 'Lithuanian',
  lv: 'Latvian',
  nl: 'Dutch',
  no: 'Norwegian',
  pl: 'Polish',
  pt: 'Portuguese',
  ru: 'Russian',
  sv: 'Swedish',
};

/**
 * The one language package with a real test suite.
 *
 * All 19 are generated from the same template, so testing each would be
 * nineteen copies of identical assertions. Swedish is the representative: it
 * has near-complete coverage, and its code (`sv`) differs from its country
 * code (`se`), which is the mistake the suite exists to pin.
 *
 * The others run an echo rather than `jest --passWithNoTests`, because calling
 * jest without depending on it fails the workspace-wide test run.
 */
const TESTED = 'sv';

const manifest = (code: string, language: string, covered: number) => ({
  name: `@bci-av/${code}`,
  version: '0.0.0',
  description:
    `${language} glosses for the BCI Authorized Vocabulary of Blissymbolics — ` +
    `${covered.toLocaleString()} of ${symbols.length.toLocaleString()} symbols`,
  keywords: [
    'aac',
    'accessibility',
    'blissymbolics',
    'blissymbols',
    code,
    language.toLowerCase(),
    'glosses',
    'i18n',
  ],
  homepage: 'https://karlnorling.github.io/bci-av/',
  bugs: 'https://github.com/karlnorling/bci-av/issues',
  repository: {
    type: 'git',
    url: 'git+https://github.com/karlnorling/bci-av.git',
    directory: `packages/@bci-av/${code}`,
  },
  license: 'MIT',
  author: 'Karl Norling',
  sideEffects: false,
  main: './dist/cjs/index.js',
  module: './dist/esm/index.js',
  types: './dist/esm/index.d.ts',
  exports: {
    '.': {
      import: './dist/esm/index.js',
      require: './dist/cjs/index.js',
      types: './dist/esm/index.d.ts',
    },
  },
  files: ['dist/', 'package.json', 'README.md', 'NOTICE'],
  scripts: {
    compile:
      'rm -rf dist && tsc -p tsconfig.cjs.json && tsc -p tsconfig.esm.json && node -e ' +
      "\"require('fs').writeFileSync('dist/cjs/package.json', JSON.stringify({type:'commonjs'})); " +
      "require('fs').writeFileSync('dist/esm/package.json', JSON.stringify({type:'module'}))\"",
    test: code === TESTED ? 'jest' : `echo '${code} package — no tests'`,
    'type-check': 'tsc --noEmit -p tsconfig.cjs.json',
  },
  devDependencies: {
    '@typescript/native': 'npm:typescript@^7.0.2',
    typescript: 'npm:@typescript/typescript6@^6.0.2',
    ...(code === TESTED
      ? {
          '@bci-av/core': 'workspace:^',
          '@types/jest': '^30.0.0',
          jest: '^30.0.0',
          'ts-jest': '^29.4.6',
        }
      : {}),
  },
  publishConfig: { access: 'public', provenance: true },
});

const main = (): void => {
  const summary: Array<[string, number, number]> = [];

  for (const [code, language] of Object.entries(LANGUAGES)) {
    const entries = symbols
      .filter((s) => s.names[code])
      .map((s) => [s.bciAv, s.names[code]] as const);
    if (entries.length === 0) continue;

    const dir = path.join(PKG_ROOT, code);
    fs.mkdirSync(path.join(dir, 'src'), { recursive: true });

    // Keyed by BCI-AV number rather than slug id: the number is stable across
    // vocabulary editions, so a stored reference keeps resolving.
    const names = Object.fromEntries(entries);

    const src = [
      '// THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY.',
      "// Run 'yarn generate-languages' to regenerate.",
      `// Source: BCI Authorized Vocabulary, Blissymbolics Communication International.`,
      '',
      `/** ${language} glosses, keyed by BCI-AV number. */`,
      `export const names: Record<string, string> = ${JSON.stringify(names, null, 2)};`,
      '',
      `/** ISO 639-1 code for this package's language. */`,
      `export const language = ${JSON.stringify(code)};`,
      '',
      '/**',
      ` * Returns the ${language} gloss for a BCI-AV number, or undefined when BCI`,
      ' * has not translated that symbol.',
      ' *',
      ' * BCI lists synonyms in one comma-separated string, so this returns the',
      ' * raw field; take the first part for display.',
      ' */',
      'export const getName = (bciAv: string): string | undefined => names[bciAv.trim()];',
      '',
    ].join('\n');
    fs.writeFileSync(path.join(dir, 'src', 'index.ts'), src, 'utf-8');

    fs.writeFileSync(
      path.join(dir, 'package.json'),
      `${JSON.stringify(manifest(code, language, entries.length), null, 2)}\n`,
      'utf-8',
    );

    // Build configs and the licence notice are identical to core's.
    const configs = ['tsconfig.json', 'tsconfig.cjs.json', 'tsconfig.esm.json', 'NOTICE'];
    if (code === TESTED) configs.push('jest.config.js');
    for (const file of configs) {
      fs.copyFileSync(path.join(PKG_ROOT, 'core', file), path.join(dir, file));
    }

    const readme = [
      `# @bci-av/${code}`,
      '',
      `${language} glosses for the BCI Authorized Vocabulary of Blissymbolics —`,
      `${entries.length.toLocaleString()} of ${symbols.length.toLocaleString()} symbols`,
      `(${Math.round((entries.length / symbols.length) * 100)}% coverage).`,
      '',
      '```sh',
      `npm install @bci-av/${code}`,
      '```',
      '',
      '```ts',
      `import { getName, names } from '@bci-av/${code}';`,
      '',
      `getName('23536'); //=> ${JSON.stringify(names['23536'] ?? Object.values(names)[0])}`,
      '```',
      '',
      'Keyed by **BCI-AV number**, which is stable across vocabulary editions —',
      'unlike the slug ids, which follow their English gloss.',
      '',
      '`@bci-av/core` carries all 19 languages, which is 2.6 MB of its registry.',
      'This package exists so a single-language application does not ship the',
      'other eighteen.',
      '',
      '## Licensing',
      '',
      'The glosses are **CC BY-SA 4.0** by Blissymbolics Communication',
      'International. See [NOTICE](./NOTICE).',
      '',
    ].join('\n');
    fs.writeFileSync(path.join(dir, 'README.md'), readme, 'utf-8');

    summary.push([code, entries.length, Buffer.byteLength(src)]);
  }

  console.log(`Wrote ${summary.length} language packages:`);
  for (const [code, n, bytes] of summary.sort((a, b) => b[1] - a[1])) {
    console.log(
      `  @bci-av/${code.padEnd(3)} ${String(n).padStart(5)} glosses  ${(bytes / 1024).toFixed(0)} KB`,
    );
  }
};

main();
