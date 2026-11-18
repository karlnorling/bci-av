---
'@bci-av/core': patch
'@bci-av/react': patch
'@bci-av/vue': patch
'@bci-av/elements': patch
---

Stop shipping source maps that resolve to nothing, halving the published file
count.

The maps referenced `../../../src`, which `files` does not ship, and
`sourcesContent` was not embedded — so every one pointed at a file absent from
the tarball. In `@bci-av/core` they were 26,216 of 52,437 files and 18.5 MB
unpacked.

`compile` now removes `dist/` first, because tsc leaves behind outputs it no
longer emits.
