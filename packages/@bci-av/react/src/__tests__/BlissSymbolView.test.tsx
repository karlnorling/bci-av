/**
 * @jest-environment jsdom
 *
 * Mirrors packages/@bci-av/elements/src/__tests__/BlissSymbolElement.test.ts.
 * The three renderers are separate implementations of the same contract, so
 * they are held to the same assertions — an accessibility regression in one
 * should not be able to hide behind the others being tested.
 */
import { getSymbol } from '@bci-av/core';
import * as React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { BlissSymbolView } from '../index.js';

const symbol = getSymbol('house-work')!;

const render = (element: React.ReactElement): HTMLElement => {
  const container = document.createElement('div');
  document.body.append(container);
  act(() => {
    createRoot(container).render(element);
  });
  return container;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('rendering', () => {
  it('renders the symbol as inline SVG', () => {
    const el = render(<BlissSymbolView symbol={symbol} />);
    expect(el.querySelector('svg')).not.toBeNull();
  });

  it('labels the graphic itself, not the wrapper', () => {
    const el = render(<BlissSymbolView symbol={symbol} />);
    const svg = el.querySelector('svg')!;
    expect(svg.getAttribute('role')).toBe('img');
    for (const id of svg.getAttribute('aria-labelledby')!.split(' ')) {
      expect(el.querySelector(`#${id}`)).not.toBeNull();
    }
  });

  it('describes the symbol with BCI’s derivation by default', () => {
    const el = render(<BlissSymbolView symbol={symbol} />);
    expect(el.querySelector('desc')?.textContent).toBe(symbol.derivation);
    expect(el.querySelector('title')?.textContent).toBe('house_work');
  });

  it('uses the requested language for the accessible name', () => {
    const el = render(<BlissSymbolView symbol={symbol} language="de" />);
    expect(el.querySelector('title')?.textContent).toBe('Haushaltsführung');
  });

  it('size sets both dimensions, width/height override individually', () => {
    const both = render(<BlissSymbolView symbol={symbol} size={128} />);
    expect(both.querySelector('svg')?.getAttribute('width')).toBe('128');
    expect(both.querySelector('svg')?.getAttribute('height')).toBe('128');

    const wide = render(<BlissSymbolView symbol={symbol} size={32} width={200} />);
    expect(wide.querySelector('svg')?.getAttribute('width')).toBe('200');
    expect(wide.querySelector('svg')?.getAttribute('height')).toBe('32');
  });

  it('defaults to 64 when no size is given', () => {
    const el = render(<BlissSymbolView symbol={symbol} />);
    expect(el.querySelector('svg')?.getAttribute('width')).toBe('64');
  });

  // The markup is injected with dangerouslySetInnerHTML, so anything
  // interpolated into it has to be escaped.
  it('escapes attacker-controlled title and description', () => {
    const el = render(
      <BlissSymbolView symbol={symbol} title="<script>x</script>" description={'"><img>'} />,
    );
    expect(el.querySelector('script')).toBeNull();
    expect(el.querySelector('img')).toBeNull();
    expect(el.querySelector('title')?.textContent).toBe('<script>x</script>');
  });

  it('passes className and style through to the wrapper', () => {
    const el = render(
      <BlissSymbolView symbol={symbol} className="bliss" style={{ opacity: 0.5 }} />,
    );
    const span = el.querySelector('span')!;
    expect(span.className).toBe('bliss');
    expect(span.style.opacity).toBe('0.5');
  });
});
