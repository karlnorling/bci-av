# @bci-av/da

Danish glosses for the BCI Authorized Vocabulary of Blissymbolics —
3,345 of 6,551 symbols
(51% coverage).

```sh
npm install @bci-av/da
```

```ts
import { getName, names } from '@bci-av/da';

getName('23536'); //=> "procent, %"
```

Keyed by **BCI-AV number**, which is stable across vocabulary editions —
unlike the slug ids, which follow their English gloss.

`@bci-av/core` carries all 19 languages, which is 2.6 MB of its registry.
This package exists so a single-language application does not ship the
other eighteen.

## Licensing

The glosses are **CC BY-SA 4.0** by Blissymbolics Communication
International. See [NOTICE](./NOTICE).
