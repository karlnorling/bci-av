/**
 * @jest-environment jsdom
 *
 * Mirrors the elements and react suites. No sibling repo tests its Vue
 * component at all, so this establishes the pattern: mount with Vue's own
 * createApp rather than pulling in @vue/test-utils for assertions this simple.
 */
import { getSymbol } from '@bci-av/core';
import { createApp, h } from 'vue';
import type { Component } from 'vue';
import { BlissSymbolView } from '../index';

const symbol = getSymbol('house-work')!;

const render = (props: Record<string, unknown> = {}): HTMLElement => {
  const container = document.createElement('div');
  document.body.append(container);
  createApp({
    render: () => h(BlissSymbolView as Component, { symbol, ...props }),
  }).mount(container);
  return container;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('rendering', () => {
  it('renders the symbol as inline SVG', () => {
    const el = render();
    expect(el.querySelector('svg')).not.toBeNull();
  });

  it('labels the graphic itself, not the wrapper', () => {
    const el = render();
    const svg = el.querySelector('svg')!;
    expect(svg.getAttribute('role')).toBe('img');
    for (const id of svg.getAttribute('aria-labelledby')!.split(' ')) {
      expect(el.querySelector(`#${id}`)).not.toBeNull();
    }
  });

  it('describes the symbol with BCI’s derivation by default', () => {
    const el = render();
    expect(el.querySelector('desc')?.textContent).toBe(symbol.derivation);
    expect(el.querySelector('title')?.textContent).toBe('house_work');
  });

  it('uses the requested language for the accessible name', () => {
    const el = render({ language: 'de' });
    expect(el.querySelector('title')?.textContent).toBe('Haushaltsführung');
  });

  it('size sets both dimensions, width/height override individually', () => {
    const both = render({ size: 128 });
    expect(both.querySelector('svg')?.getAttribute('width')).toBe('128');
    expect(both.querySelector('svg')?.getAttribute('height')).toBe('128');

    const wide = render({ size: 32, width: 200 });
    expect(wide.querySelector('svg')?.getAttribute('width')).toBe('200');
    expect(wide.querySelector('svg')?.getAttribute('height')).toBe('32');
  });

  it('defaults to 64 when no size is given', () => {
    const el = render();
    expect(el.querySelector('svg')?.getAttribute('width')).toBe('64');
  });

  it('escapes attacker-controlled title and description', () => {
    const el = render({ title: '<script>x</script>', description: '"><img>' });
    expect(el.querySelector('script')).toBeNull();
    expect(el.querySelector('img')).toBeNull();
    expect(el.querySelector('title')?.textContent).toBe('<script>x</script>');
  });

  // inheritAttrs is false and attrs are spread onto the wrapper by hand, so
  // this would silently stop working if that spread were dropped.
  it('passes attributes through to the wrapper', () => {
    const el = render({ class: 'bliss' });
    expect(el.querySelector('span')?.getAttribute('class')).toBe('bliss');
  });
});
