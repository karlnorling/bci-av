---
'@bci-av/core': patch
'@bci-av/react': patch
'@bci-av/vue': patch
'@bci-av/elements': patch
'@bci-av/assets': patch
'@bci-av/sprite': patch
'@bci-av/css': patch
---

Stop requiring provenance in `publishConfig`, which blocked publishing outside
CI. `scripts/publish.sh` passes `--provenance`, so CI publishes are still
attested.
