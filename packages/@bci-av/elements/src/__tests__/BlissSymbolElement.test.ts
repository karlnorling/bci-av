/**
 * @jest-environment jsdom
 */
import { getSymbol } from '@bci-av/core';
import { BlissSymbolElement, defineBlissSymbol } from '../index.js';

const symbol = getSymbol('house-work')!;

beforeAll(() => {
  defineBlissSymbol();
});

const mount = (configure?: (el: BlissSymbolElement) => void): BlissSymbolElement => {
  const el = document.createElement('bliss-symbol') as BlissSymbolElement;
  configure?.(el);
  el.symbol = symbol;
  document.body.append(el);
  return el;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('defineBlissSymbol', () => {
  it('registers the element', () => {
    expect(customElements.get('bliss-symbol')).toBe(BlissSymbolElement);
  });

  // customElements.define throws on a duplicate name, so a second call from
  // another module must not blow up.
  it('is safe to call twice', () => {
    expect(() => defineBlissSymbol()).not.toThrow();
  });
});

describe('rendering', () => {
  it('renders the symbol as inline SVG', () => {
    const el = mount();
    expect(el.querySelector('svg')).not.toBeNull();
  });

  it('labels the graphic itself, not the wrapper', () => {
    const el = mount();
    const svg = el.querySelector('svg')!;
    expect(svg.getAttribute('role')).toBe('img');
    const labelled = svg.getAttribute('aria-labelledby')!;
    for (const id of labelled.split(' ')) {
      expect(el.querySelector(`#${id}`)).not.toBeNull();
    }
  });

  // BCI's derivation is a real description for a compound symbol, so it is the
  // default rather than being left empty.
  it('describes the symbol with BCI’s derivation by default', () => {
    const el = mount();
    expect(el.querySelector('desc')?.textContent).toBe(symbol.derivation);
    expect(el.querySelector('title')?.textContent).toBe('house_work');
  });

  it('uses the requested language for the accessible name', () => {
    const el = mount((e) => e.setAttribute('language', 'de'));
    expect(el.querySelector('title')?.textContent).toBe('Haushaltsführung');
  });

  it('size sets both dimensions, width/height override individually', () => {
    const both = mount((e) => e.setAttribute('size', '128'));
    expect(both.querySelector('svg')?.getAttribute('width')).toBe('128');
    expect(both.querySelector('svg')?.getAttribute('height')).toBe('128');

    const wide = mount((e) => {
      e.setAttribute('size', '32');
      e.setAttribute('width', '200');
    });
    expect(wide.querySelector('svg')?.getAttribute('width')).toBe('200');
    expect(wide.querySelector('svg')?.getAttribute('height')).toBe('32');
  });

  it('defaults to 64 when no size is given', () => {
    const el = mount();
    expect(el.querySelector('svg')?.getAttribute('width')).toBe('64');
  });

  it('escapes attacker-controlled title and description', () => {
    const el = mount((e) => {
      e.setAttribute('title', '<script>x</script>');
      e.setAttribute('description', '"><img>');
    });
    expect(el.querySelector('script')).toBeNull();
    expect(el.querySelector('img')).toBeNull();
    expect(el.querySelector('title')?.textContent).toBe('<script>x</script>');
  });

  it('renders nothing until a symbol is set', () => {
    const el = document.createElement('bliss-symbol') as BlissSymbolElement;
    document.body.append(el);
    expect(el.querySelector('svg')).toBeNull();
  });
});
