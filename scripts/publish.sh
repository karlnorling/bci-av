#!/usr/bin/env bash
# Publish every public workspace package whose version is not on the registry.
#
# Internal dependencies here use real semver ranges ("@bci-av/core": "^0.1.0"),
# not `workspace:*`, so a plain `npm publish` ships a correct manifest and does
# the npm OIDC token exchange for trusted publishing. road-signs cannot do this
# -- it declares `workspace:*`, which only `yarn pack` rewrites -- and a
# hand-run publish there shipped an uninstallable package. Keeping real ranges
# avoids that whole class of problem.
set -euo pipefail

# changesets/action v2 does not parse stdout for "New tag:" lines the way v1
# did. It passes a file path in CHANGESETS_OUTPUT and reads newline-delimited
# JSON from it, one object per published package:
#
#   {"type":"git-tag","tag":"<pkg>@<version>","packageName":"<pkg>"}
#
# Without that file it logs "GitHub releases and git tags cannot be created
# without this output" and silently skips both. The file must exist even when
# nothing is published, because a missing file is itself the read error.
if [ -n "${CHANGESETS_OUTPUT:-}" ]; then
  : > "$CHANGESETS_OUTPUT"
fi

record_published() {
  [ -n "${CHANGESETS_OUTPUT:-}" ] || return 0
  printf '{"type":"git-tag","tag":"%s@%s","packageName":"%s"}\n' "$1" "$2" "$1" \
    >> "$CHANGESETS_OUTPUT"
}

published=0
skipped=0

for dir in packages/@bci-av/*/; do
  [ -f "${dir}package.json" ] || continue

  name=$(node -p "require('./${dir}package.json').name")
  version=$(node -p "require('./${dir}package.json').version")
  private=$(node -p "require('./${dir}package.json').private || false")
  [ "$private" = "true" ] && continue

  if npm view "${name}@${version}" version >/dev/null 2>&1; then
    echo "Skipping ${name}@${version} (already published)"
    skipped=$((skipped + 1))
    continue
  fi

  echo "Publishing ${name}@${version}..."
  (cd "$dir" && npm publish --provenance --access public)
  record_published "$name" "$version"
  published=$((published + 1))
done

echo
echo "${published} published, ${skipped} skipped"

# No `yarn changeset tag` here. It appends to CHANGESETS_OUTPUT as well, so
# every tag is recorded twice and the action tries to create each GitHub
# release twice — the second attempt failing with already_exists. The action
# creates the tags itself, through the API, from the events recorded above.
# ghs hit this and fixed it the same way.
