# @bci-av/nl

## 0.1.0

### Minor Changes

- 316eea9: Initial release: per-language gloss packages.

  `@bci-av/core` carries glosses for all 19 languages, which is 2.6 MB of its
  registry. A single-language application shipped all of it to use ~170 KB.
  These packages make that proportional — a Swedish app bundles 59 KB gzipped
  instead of 1,397 KB.

  Keyed by BCI-AV number, which is stable across vocabulary editions. Named by
  ISO 639-1 language code, because these are glosses for the same symbols rather
  than regional variants.
