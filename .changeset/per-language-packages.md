---
'@bci-av/af': minor
'@bci-av/da': minor
'@bci-av/de': minor
'@bci-av/en': minor
'@bci-av/eo': minor
'@bci-av/es': minor
'@bci-av/fi': minor
'@bci-av/fr': minor
'@bci-av/hu': minor
'@bci-av/is': minor
'@bci-av/it': minor
'@bci-av/lt': minor
'@bci-av/lv': minor
'@bci-av/nl': minor
'@bci-av/no': minor
'@bci-av/pl': minor
'@bci-av/pt': minor
'@bci-av/ru': minor
'@bci-av/sv': minor
---

Initial release: per-language gloss packages.

`@bci-av/core` carries glosses for all 19 languages, which is 2.6 MB of its
registry. A single-language application shipped all of it to use ~170 KB.
These packages make that proportional — a Swedish app bundles 59 KB gzipped
instead of 1,397 KB.

Keyed by BCI-AV number, which is stable across vocabulary editions. Named by
ISO 639-1 language code, because these are glosses for the same symbols rather
than regional variants.
