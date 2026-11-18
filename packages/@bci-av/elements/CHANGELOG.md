# @bci-av/elements

## 0.1.0

### Minor Changes

- bcf4afa: Initial release: the BCI Authorized Vocabulary 2026-09-12 as typed packages.

  6,551 Blissymbols with inline SVG, BCI-AV numbers, glosses in 19 languages,
  part-of-speech classification and BCI's derivation notes, distributed as a
  typed registry, accessible React / Vue 3 / custom-element renderers, individual
  SVG files, an SVG symbol sheet and a CSS sprite.

  Symbols are CC BY-SA 4.0 by Blissymbolics Communication International; see
  NOTICE for the attribution this requires.

### Patch Changes

- bb56366: Point `homepage` at the documentation site.
- 78dc6da: Stop shipping source maps that resolve to nothing, halving the published file
  count.

  The maps referenced `../../../src`, which `files` does not ship, and
  `sourcesContent` was not embedded — so every one pointed at a file absent from
  the tarball. In `@bci-av/core` they were 26,216 of 52,437 files and 18.5 MB
  unpacked.

  `compile` now removes `dist/` first, because tsc leaves behind outputs it no
  longer emits.

- e1cdf63: Add the `.js` extension to relative imports so the ESM builds load in Node.

  Node resolves ESM specifiers exactly, so an extensionless relative import only
  works inside a bundler. `import { getSymbol } from '@bci-av/core'` would have
  failed with `Cannot find module …/dist/esm/types`.

- 8f21568: Stop requiring provenance in `publishConfig`, which blocked publishing outside
  CI. `scripts/publish.sh` passes `--provenance`, so CI publishes are still
  attested.
- Updated dependencies [bb56366]
- Updated dependencies [78dc6da]
- Updated dependencies [e1cdf63]
- Updated dependencies [bcf4afa]
- Updated dependencies [96ef07b]
- Updated dependencies [8f21568]
  - @bci-av/core@0.1.0
