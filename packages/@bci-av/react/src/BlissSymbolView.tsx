import { getName } from '@bci-av/core';
import type { BlissSymbol } from '@bci-av/core';
import React from 'react';

const esc = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');

export interface BlissSymbolViewProps {
  /** The symbol to render, from `@bci-av/core`. */
  symbol: BlissSymbol;
  /** Width and height. Defaults to 64. */
  size?: number | string;
  width?: number | string;
  height?: number | string;
  /**
   * ISO 639-1 code used for the accessible name, e.g. `"de"`. Falls back to
   * English, then to the symbol's gloss.
   */
  language?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Overrides the accessible name, which otherwise comes from `language`. */
  title?: string;
  /**
   * Overrides the accessible description, which otherwise uses BCI's derivation
   * note — for a compound symbol that is genuinely useful, e.g.
   * "(work + house: work to maintain a house)".
   */
  description?: string;
  'aria-label'?: string;
}

/**
 * Renders a Blissymbol as inline, accessible SVG.
 *
 * There is deliberately no component per symbol. The vocabulary has 6,551
 * entries, so generating one component each would mean thousands of modules for
 * no benefit; pass a symbol from the registry instead.
 */
export const BlissSymbolView = React.memo(function BlissSymbolView({
  symbol,
  size = 64,
  width,
  height,
  language = 'en',
  className,
  style,
  title,
  description,
  'aria-label': ariaLabel,
}: BlissSymbolViewProps) {
  const resolvedWidth = width ?? size;
  const resolvedHeight = height ?? size;
  const name = title ?? getName(symbol, language);
  const desc = description ?? symbol.derivation;

  const titleId = `bci-${symbol.bciAv}-title`;
  const descId = `bci-${symbol.bciAv}-desc`;

  // The accessible name and description are injected into the SVG rather than
  // set on the wrapper, so assistive technology reads the graphic itself.
  const labelled = desc ? `${titleId} ${descId}` : titleId;
  const markup = symbol.svg
    .replace(
      /<svg\b/,
      `<svg role="img" aria-labelledby="${esc(labelled)}"` +
        ` width="${esc(String(resolvedWidth))}" height="${esc(String(resolvedHeight))}"`,
    )
    .replace(
      /(<svg[^>]*>)/,
      `$1<title id="${esc(titleId)}">${esc(name)}</title>` +
        (desc ? `<desc id="${esc(descId)}">${esc(desc)}</desc>` : ''),
    );

  return (
    <span
      className={className}
      style={style}
      aria-label={ariaLabel}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
});
