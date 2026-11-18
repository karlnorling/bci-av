# bci-av

The **BCI Authorized Vocabulary** of Blissymbolics as typed npm packages —
6,551 symbols with inline SVG, glosses in 19 languages, and BCI's derivation
notes.

Blissymbolics is a semantic graphical language used in augmentative and
alternative communication (AAC). Unlike an icon set, it is _generative_: symbols
compose into new words, and BCI records how each compound is built.

```ts
import { getSymbol, getName } from '@bci-av/core';

const housework = getSymbol('house-work');

housework.bciAv; //=> "23536"
housework.derivation; //=> "(work + house: work to maintain a house)"
housework.synonyms; //=> ["house_work", "housekeeping", "housework"]
getName(housework, 'de'); //=> "Haushaltsführung"
housework.svg; //=> "<svg viewBox=…"
```

```tsx
import { BlissSymbolView } from '@bci-av/react';

<BlissSymbolView symbol={housework} size={96} language="de" />;
```

The React component injects an accessible name and description into the SVG
itself — the description defaults to BCI's derivation, which for a compound is
genuinely informative rather than filler.

## Packages

| Package            | What it is                                |
| ------------------ | ----------------------------------------- |
| `@bci-av/core`     | The registry, types and lookups. No deps. |
| `@bci-av/react`    | One accessible React component.           |
| `@bci-av/vue`      | One accessible Vue 3 component.           |
| `@bci-av/elements` | A framework-free custom element.          |
| `@bci-av/assets`   | One `.svg` file per symbol.               |
| `@bci-av/sprite`   | An SVG symbol sheet plus an id map.       |
| `@bci-av/css`      | One `background-image` class per symbol.  |

```html
<!-- sprite: one request, then reference any symbol by id -->
<svg width="64" height="64">
  <use href="node_modules/@bci-av/sprite/sprite.svg#bliss-house-work" />
</svg>

<!-- css: install @bci-av/assets alongside; backgrounds resolve into it -->
<link rel="stylesheet" href="node_modules/@bci-av/css/sprite.css" />
<span class="bliss-house-work" style="display:inline-block;width:64px;height:64px"></span>
```

There are **no raster variants**. The sibling repos rasterise every pictogram to
jpg/png/webp at five sizes, which here would be 98,265 files — the pattern that
left road-signs with a 16GB asset tree and tarballs npm refused. Blissymbols are
line drawings that scale perfectly as SVG.

There is deliberately **no component per symbol**. With 6,551 entries that would
mean thousands of modules for no benefit, so you pass a symbol from the registry
instead. (The sibling `@ghs-hazard-pictograms` packages do generate per-symbol
components, because there are 38 of them.)

## Importing one symbol

`symbols` is a single array, so importing anything from the package root pulls
all 6,551 — measured at **6.2 MB** (1.4 MB gzipped) for a consumer who wanted
one. If you need a known set rather than search, import them directly:

```ts
import houseWork from '@bci-av/core/symbols/house-work';

houseWork.svg;
houseWork.derivation; //=> "(work + house: work to maintain a house)"
```

|                                         | bundled   |
| --------------------------------------- | --------- |
| one symbol via `@bci-av/core/symbols/…` | **~1 KB** |
| five symbols                            | ~5 KB     |
| the root entry                          | 6.2 MB    |

The root entry still carries the whole registry, because search and the gallery
genuinely need every symbol. Use it when you are searching; import directly
when you are not.

## Lookups

|                           |                                                                              |
| ------------------------- | ---------------------------------------------------------------------------- |
| `getSymbol(id)`           | by slug, e.g. `"house-work"`                                                 |
| `getSymbolByBciAv(n)`     | by BCI-AV number — **stable across editions**, prefer this when persisting   |
| `getSymbolsByGloss(g)`    | exact English synonym match; `"housekeeping"` and `"housework"` both resolve |
| `searchSymbols(q, lang?)` | substring search over English and optionally one other language              |
| `getName(symbol, lang?)`  | one displayable name, falling back to English then the gloss                 |
| `getLanguages()`          | the 19 ISO 639-1 codes present                                               |

`names` holds BCI's text verbatim, which means every synonym in one
comma-separated string (`"hushållsarbete, hemarbete"`). Use `getName` to render.

## Updating to a new BCI-AV edition

BCI publishes a dated edition a few times a year. There is no scraping involved
— the whole dataset is two files.

```sh
# 1. bump EDITION in bin/lib/upstream.ts
yarn update        # fetch + generate
yarn test          # the suite pins the symbol count
```

`yarn fetch` caches both downloads into the git-ignored `data/`, and CI asserts
the committed registry was generated from the edition `upstream.ts` declares, so
a bumped `EDITION` that nobody regenerated fails the build.

## Licensing — read this before shipping

**The code is MIT. The symbols are not.**

The artwork and metadata are **CC BY-SA 4.0, by Blissymbolics Communication
International**. That obliges you to credit BCI, and to release any
_modifications to the symbols_ under the same licence. It does not make your
application CC BY-SA.

See [NOTICE](./NOTICE) for what that means in practice. This is the only one of
these pictogram repos whose artwork is not public domain, so don't assume the
terms carry over from the others.

## Source

[BCI Authorized Vocabulary](https://www.blissymbolics.org/), Blissymbolics
Communication International. This is an unofficial packaging; BCI are not
responsible for it.
