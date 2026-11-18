---
'@bci-av/core': minor
---

Add a `./symbols/*` subpath so a single symbol can be imported on its own.

```ts
import houseWork from '@bci-av/core/symbols/house-work';
```

`symbols` is one exported array, so importing anything from the package root
pulls all 6,551 symbols — 6.2 MB, or 1.4 MB gzipped, for a consumer who wanted
one. Importing directly costs about 1 KB. The root entry is unchanged and still
carries the whole registry, which search and galleries need.
