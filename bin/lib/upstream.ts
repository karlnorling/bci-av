/**
 * upstream.ts
 *
 * Constants and helpers describing the upstream BCI-AV release this repo is
 * built from.
 *
 * Blissymbolics is maintained by Blissymbolics Communication International
 * (BCI), which publishes a dated "Authorized Vocabulary" edition: an archive of
 * one SVG per symbol, plus a spreadsheet of IDs, glosses in 19 languages, and
 * derivations. Unlike the sibling repos there is no scraping involved — the
 * whole dataset is two files.
 *
 * Bump EDITION when BCI publishes a new vocabulary and re-run `yarn update`.
 */

/** The BCI-AV edition this repo currently tracks, as it appears in the URL. */
export const EDITION = '2026-09-12';

const BASE = `http://www.blissymbolics.net/BCI-AV_${EDITION}`;

/**
 * One SVG per symbol, named after its English gloss.
 *
 * Two variants are published. `bliss_svg_id.zip` adds `id` attributes to the
 * drawing elements; this uses the plain one, because every file already shares
 * the same nine CSS class names (`pen0`, `brush0`, …) and those are flattened
 * into presentation attributes at generate time, so element ids would only add
 * another namespace to collide.
 */
export const SVG_ARCHIVE_URL = `${BASE}/bliss_svg.zip`;

/**
 * IDs, glosses in 19 languages, part of speech, and derivations.
 *
 * The filename encodes the language list and the covered id range, so it has to
 * be spelled out rather than derived.
 */
export const REFERENCE_URL =
  `${BASE}/BCI-AV_SKOG_${EDITION}_` +
  '(en+sv+no+fi+hu+de+nl+af+ru+is+lt+lv+po+fr+es+pt+it+dk+eo)+derivations_8483-29880.ods';

/** Where `yarn fetch` caches the two downloads. Git-ignored. */
export const DATA_DIR = 'data';
export const SVG_ARCHIVE = `${DATA_DIR}/bliss_svg.zip`;
export const REFERENCE_FILE = `${DATA_DIR}/bci-av.ods`;

/**
 * A polite, identifiable User-Agent. blissymbolics.net is a small volunteer
 * server; this repo should be identifiable in its logs.
 */
export const USER_AGENT =
  'bci-av/0.0.0 (https://github.com/karlnorling/bci-av; packages the BCI Authorized Vocabulary)';
