/**
 * A representative language package. These are generated from the same
 * registry, so one real suite protects the shape for all 19 rather than
 * nineteen copies of the same assertions.
 */
import { getSymbol, symbols } from '@bci-av/core';
import { getName, language, names } from '../index';

describe('@bci-av/sv', () => {
  it('declares its ISO 639-1 code, not a country code', () => {
    // `se` is Sweden; Swedish is `sv`. These are glosses for the same symbols,
    // not regional variants, so the language code is the correct identifier.
    expect(language).toBe('sv');
  });

  it('agrees with core for every symbol it covers', () => {
    const covered = symbols.filter((s) => s.names.sv);
    expect(covered.length).toBeGreaterThan(6000);
    for (const s of covered) expect(names[s.bciAv]).toBe(s.names.sv);
  });

  it('is keyed by BCI-AV number, which is stable across editions', () => {
    const s = getSymbol('house-work')!;
    expect(getName(s.bciAv)).toBe(s.names.sv);
    // The slug is deliberately not a key: it follows the English gloss.
    expect(names[s.id]).toBeUndefined();
  });

  it('returns undefined for an untranslated or unknown symbol', () => {
    expect(getName('99999999')).toBeUndefined();
    expect(getName('')).toBeUndefined();
  });

  it('tolerates surrounding whitespace', () => {
    const s = getSymbol('house-work')!;
    expect(getName(` ${s.bciAv} `)).toBe(s.names.sv);
  });

  it('carries no symbol core does not have', () => {
    const known = new Set(symbols.map((s) => s.bciAv));
    for (const key of Object.keys(names)) expect(known.has(key)).toBe(true);
  });
});
