# @bci-av/it

Italian glosses for the BCI Authorized Vocabulary of Blissymbolics —
4,122 of 6,551 symbols
(63% coverage).

```sh
npm install @bci-av/it
```

```ts
import { getName, names } from '@bci-av/it';

getName('23536'); //=> "faccende di casa, gestione della casa"
```

Keyed by **BCI-AV number**, which is stable across vocabulary editions —
unlike the slug ids, which follow their English gloss.

`@bci-av/core` carries all 19 languages, which is 2.6 MB of its registry.
This package exists so a single-language application does not ship the
other eighteen.

## Licensing

The glosses are **CC BY-SA 4.0** by Blissymbolics Communication
International. See [NOTICE](./NOTICE).
