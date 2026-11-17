import { getName } from '@bci-av/core';
import type { BlissSymbol } from '@bci-av/core';

const esc = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');

/**
 * A framework-free custom element rendering one Blissymbol.
 *
 * Usage:
 *
 *     import { BlissSymbolElement, defineBlissSymbol } from '@bci-av/elements';
 *     import { getSymbol } from '@bci-av/core';
 *
 *     defineBlissSymbol();
 *
 *     const el = document.createElement('bliss-symbol') as BlissSymbolElement;
 *     el.symbol = getSymbol('house-work')!;
 *     document.body.append(el);
 *
 * The symbol is set as a property rather than an attribute, because an
 * attribute would mean shipping all 6,551 symbols to the page just so the
 * element could look one up by id.
 */
export class BlissSymbolElement extends HTMLElement {
  static readonly observedAttributes = [
    'size',
    'width',
    'height',
    'language',
    'title',
    'description',
  ];

  #symbol: BlissSymbol | undefined;

  /** The symbol to render. Setting it re-renders. */
  set symbol(value: BlissSymbol) {
    this.#symbol = value;
    this.#render();
  }

  get symbol(): BlissSymbol | undefined {
    return this.#symbol;
  }

  connectedCallback(): void {
    this.#render();
  }

  attributeChangedCallback(): void {
    this.#render();
  }

  #render(): void {
    const symbol = this.#symbol;
    if (!symbol) return;

    const size = this.getAttribute('size') ?? '64';
    const width = this.getAttribute('width') ?? size;
    const height = this.getAttribute('height') ?? size;
    const language = this.getAttribute('language') ?? 'en';
    const name = this.getAttribute('title') ?? getName(symbol, language);
    const desc = this.getAttribute('description') ?? symbol.derivation;

    const titleId = `bci-${symbol.bciAv}-title`;
    const descId = `bci-${symbol.bciAv}-desc`;
    const labelled = desc ? `${titleId} ${descId}` : titleId;

    this.style.display = 'contents';
    this.innerHTML = symbol.svg
      .replace(
        /<svg\b/,
        `<svg role="img" aria-labelledby="${esc(labelled)}"` +
          ` width="${esc(width)}" height="${esc(height)}"`,
      )
      .replace(
        /(<svg[^>]*>)/,
        `$1<title id="${esc(titleId)}">${esc(name)}</title>` +
          (desc ? `<desc id="${esc(descId)}">${esc(desc)}</desc>` : ''),
      );
  }
}

/**
 * Registers the element, by default as `<bliss-symbol>`.
 *
 * Safe to call more than once: a name already in the registry is left alone,
 * which matters because `customElements.define` throws on a duplicate.
 */
export const defineBlissSymbol = (tagName = 'bliss-symbol'): void => {
  if (typeof customElements === 'undefined') return;
  if (customElements.get(tagName)) return;
  customElements.define(tagName, BlissSymbolElement);
};
