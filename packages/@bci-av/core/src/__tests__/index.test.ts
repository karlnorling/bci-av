import {
  EDITION,
  getAllSymbols,
  getLanguages,
  getName,
  getSymbol,
  getSymbolByBciAv,
  getSymbolsByGloss,
  searchSymbols,
  symbols,
} from '../index.js';

describe('registry', () => {
  // BCI states 6,551 symbols for the 2026-09-12 edition. The generator joins
  // the SVG archive to the reference spreadsheet by gloss, so a drop here means
  // the join regressed rather than that upstream changed.
  it('contains the full authorized vocabulary', () => {
    expect(symbols).toHaveLength(6551);
  });

  it('records the edition it was generated from', () => {
    expect(EDITION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('ids and BCI-AV numbers are unique', () => {
    expect(new Set(symbols.map((s) => s.id)).size).toBe(symbols.length);
    expect(new Set(symbols.map((s) => s.bciAv)).size).toBe(symbols.length);
  });

  it('every symbol has artwork, a gloss and a number', () => {
    for (const s of symbols) {
      expect(s.svg).toMatch(/^<svg/);
      expect(s.gloss).toBeTruthy();
      expect(s.bciAv).toMatch(/^\d+$/);
      expect(s.synonyms.length).toBeGreaterThan(0);
    }
  });

  // Upstream ships a <style> block using nine class names shared by every
  // symbol, so two symbols inlined in one document would restyle each other.
  // The generator flattens those rules into presentation attributes.
  it('no symbol carries a <style> block or class attribute', () => {
    for (const s of symbols) {
      expect(s.svg).not.toMatch(/<style/i);
      expect(s.svg).not.toMatch(/class="/);
    }
  });

  // Upstream sets width/height in inches with preserveAspectRatio="none",
  // which distorts when a consumer sets only one dimension.
  it('every symbol scales from its viewBox alone', () => {
    for (const s of symbols) {
      expect(s.svg).toMatch(/viewBox="/);
      expect(s.svg).not.toMatch(/="[\d.]+in"/);
    }
  });

  it('getAllSymbols returns a copy', () => {
    const a = getAllSymbols();
    a.pop();
    expect(getAllSymbols()).toHaveLength(symbols.length);
  });
});

describe('lookups', () => {
  it('finds a symbol by slug id', () => {
    expect(getSymbol('house-work')?.gloss).toBe('house_work');
  });

  it('finds a symbol by its BCI-AV number, tolerating whitespace', () => {
    const target = symbols[0];
    expect(getSymbolByBciAv(target.bciAv)?.id).toBe(target.id);
    expect(getSymbolByBciAv(` ${target.bciAv} `)?.id).toBe(target.id);
  });

  it('returns undefined for unknown or empty lookups', () => {
    expect(getSymbol('no-such-symbol')).toBeUndefined();
    expect(getSymbolByBciAv('')).toBeUndefined();
    expect(getSymbolByBciAv('   ')).toBeUndefined();
  });

  // BCI lists synonyms in one comma-separated field; the generator splits them
  // so every synonym resolves, not just the first.
  it('resolves any English synonym to the same symbol', () => {
    const byPrimary = getSymbolsByGloss('house_work');
    const bySynonym = getSymbolsByGloss('housekeeping');
    expect(byPrimary.length).toBeGreaterThan(0);
    expect(bySynonym.map((s) => s.bciAv)).toEqual(byPrimary.map((s) => s.bciAv));
  });

  it('gloss lookup is case-insensitive and exact, not a substring match', () => {
    expect(getSymbolsByGloss('HOUSEKEEPING').length).toBeGreaterThan(0);
    expect(getSymbolsByGloss('housekeepin')).toEqual([]);
  });

  it('searchSymbols does match substrings', () => {
    expect(searchSymbols('housekeepin').length).toBeGreaterThan(0);
    expect(searchSymbols('')).toEqual([]);
  });

  it('searchSymbols can search a second language', () => {
    const german = symbols.find((s) => s.names.de);
    const word = german!.names.de.split(',')[0].trim();
    expect(searchSymbols(word, 'de').some((s) => s.bciAv === german!.bciAv)).toBe(true);
  });
});

describe('names', () => {
  it('exposes all 19 BCI gloss languages', () => {
    const langs = getLanguages();
    expect(langs).toContain('en');
    expect(langs).toContain('sv');
    expect(langs).toContain('eo');
    expect(langs).toHaveLength(19);
  });

  // `names` keeps upstream's raw field, which lists every synonym in one
  // string. getName is what callers should render.
  it('getName returns one displayable name, not the whole synonym list', () => {
    const s = getSymbol('house-work')!;
    expect(s.names.en).toContain(',');
    expect(getName(s)).toBe('house_work');
  });

  it('getName falls back to English, then to the gloss', () => {
    const s = getSymbol('house-work')!;
    expect(getName(s, 'zz')).toBe(getName(s, 'en'));
  });
});

describe('per-symbol modules', () => {
  // `symbols` is one exported array, so importing anything from the package
  // root pulls all 6,551 — measured at 6.2 MB (1.4 MB gzipped) for a consumer
  // who wanted one symbol. These modules make the cost proportional.
  it('a per-symbol module matches the registry entry exactly', async () => {
    const mod = await import('../symbols/house-work');
    const fromRegistry = getSymbol('house-work');
    expect(mod.blissSymbol).toEqual(fromRegistry);
    expect(mod.default).toBe(mod.blissSymbol);
  });

  it('carries the full symbol, not a reduced one', async () => {
    const { blissSymbol } = await import('../symbols/house-work');
    expect(blissSymbol.svg).toMatch(/^<svg/);
    expect(blissSymbol.derivation).toBeTruthy();
    expect(Object.keys(blissSymbol.names).length).toBeGreaterThan(10);
    expect(blissSymbol.synonyms.length).toBeGreaterThan(1);
  });
});
