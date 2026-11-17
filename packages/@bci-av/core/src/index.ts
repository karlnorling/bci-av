/**
 * Typed access to the BCI Authorized Vocabulary of Blissymbolics.
 *
 * Blissymbolics is a semantic graphical language maintained by Blissymbolics
 * Communication International (BCI). This package ships one edition of their
 * Authorized Vocabulary: every symbol's inline SVG, its BCI-AV number, glosses
 * in 19 languages, and BCI's derivation notes.
 *
 * The symbols are licensed CC BY-SA 4.0 by BCI; see NOTICE for the attribution
 * this obliges you to carry.
 *
 * @module @bci-av/core
 */

import { symbols } from './symbols.generated.js';
import type { BlissSymbol } from './types.js';

export type { BlissSymbol } from './types.js';
export { EDITION, symbols } from './symbols.generated.js';

/** Returns every symbol. The array is a copy, so callers may sort it. */
export const getAllSymbols = (): BlissSymbol[] => [...symbols];

/** Returns a symbol by its slug id, e.g. `"house-work"`. */
export const getSymbol = (id: string): BlissSymbol | undefined => symbols.find((s) => s.id === id);

/**
 * Returns a symbol by its BCI-AV number, e.g. `"8483"`.
 *
 * Prefer this when persisting a reference: BCI-AV numbers are stable across
 * vocabulary editions, whereas a slug follows its gloss and can change.
 */
export const getSymbolByBciAv = (bciAv: string): BlissSymbol | undefined => {
  const wanted = bciAv.trim();
  return wanted ? symbols.find((s) => s.bciAv === wanted) : undefined;
};

/**
 * Returns every symbol carrying `gloss` as one of its English synonyms,
 * case-insensitively.
 *
 * This is an exact synonym match rather than a search: BCI lists synonyms in a
 * single field, so `"housekeeping"` and `"housework"` both resolve to the same
 * symbol, while `"house"` resolves to its own.
 */
export const getSymbolsByGloss = (gloss: string): BlissSymbol[] => {
  const wanted = gloss.trim().toLowerCase();
  if (!wanted) return [];
  return symbols.filter((s) => s.synonyms.some((syn) => syn.toLowerCase() === wanted));
};

/**
 * Case-insensitive substring search over English synonyms and, when `language`
 * is given, that language's gloss.
 *
 * @param query - Text to look for.
 * @param language - ISO 639-1 code to search in addition to English, e.g. `"de"`.
 */
export const searchSymbols = (query: string, language?: string): BlissSymbol[] => {
  const wanted = query.trim().toLowerCase();
  if (!wanted) return [];
  return symbols.filter((s) => {
    if (s.synonyms.some((syn) => syn.toLowerCase().includes(wanted))) return true;
    const translated = language ? s.names[language] : undefined;
    return translated ? translated.toLowerCase().includes(wanted) : false;
  });
};

/**
 * Returns every ISO 639-1 language code present in this edition.
 *
 * BCI has not translated every symbol into every language, so this is the union
 * across the registry rather than a guarantee for any single symbol.
 */
export const getLanguages = (): string[] =>
  [...new Set(symbols.flatMap((s) => Object.keys(s.names)))].sort();

/**
 * Returns a single displayable name for a symbol in `language`, falling back to
 * the English gloss.
 *
 * Use this rather than reading `names[language]` directly, for two reasons:
 * the entry is absent for symbols BCI has not translated, and where it exists
 * it holds every synonym in that language as one comma-separated string
 * (`"tareas domésticas"`, `"hushållsarbete, hemarbete"`). `names` keeps
 * upstream's text verbatim; this takes the first synonym, which is the one to
 * put in front of a reader or in an accessible name.
 */
export const getName = (symbol: BlissSymbol, language = 'en'): string => {
  const raw = symbol.names[language] ?? symbol.names.en;
  const first = raw?.split(',')[0]?.trim();
  return first || symbol.gloss;
};
