# @bci-av/lv

Latvian glosses for the BCI Authorized Vocabulary of Blissymbolics —
5,586 of 6,551 symbols
(85% coverage).

```sh
npm install @bci-av/lv
```

```ts
import { getName, names } from '@bci-av/lv';

getName('23536'); //=> "saimniecības darbi"
```

Keyed by **BCI-AV number**, which is stable across vocabulary editions —
unlike the slug ids, which follow their English gloss.

`@bci-av/core` carries all 19 languages, which is 2.6 MB of its registry.
This package exists so a single-language application does not ship the
other eighteen.

## Licensing

The glosses are **CC BY-SA 4.0** by Blissymbolics Communication
International. See [NOTICE](./NOTICE).
