# @bci-av/sprite

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
- 8f21568: Stop requiring provenance in `publishConfig`, which blocked publishing outside
  CI. `scripts/publish.sh` passes `--provenance`, so CI publishes are still
  attested.
