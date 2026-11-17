---
'@bci-av/core': patch
'@bci-av/react': patch
'@bci-av/vue': patch
'@bci-av/elements': patch
---

Add the `.js` extension to relative imports so the ESM builds load in Node.

Node resolves ESM specifiers exactly, so an extensionless relative import only
works inside a bundler. `import { getSymbol } from '@bci-av/core'` would have
failed with `Cannot find module …/dist/esm/types`.
