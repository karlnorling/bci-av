import { getName } from '@bci-av/core';
import type { BlissSymbol } from '@bci-av/core';
import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';

const esc = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');

/**
 * Renders a Blissymbol as inline, accessible SVG.
 *
 * There is deliberately no component per symbol: the vocabulary has 6,551
 * entries, so pass one from the registry instead.
 */
export const BlissSymbolView = defineComponent({
  name: 'BlissSymbolView',
  inheritAttrs: false,
  props: {
    symbol: { type: Object as PropType<BlissSymbol>, required: true },
    size: { type: [Number, String] as PropType<number | string>, default: 64 },
    width: { type: [Number, String] as PropType<number | string>, default: undefined },
    height: { type: [Number, String] as PropType<number | string>, default: undefined },
    /** ISO 639-1 code for the accessible name, e.g. `"de"`. */
    language: { type: String, default: 'en' },
    title: { type: String, default: undefined },
    description: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const resolvedWidth = props.width ?? props.size;
      const resolvedHeight = props.height ?? props.size;
      const name = props.title ?? getName(props.symbol, props.language);
      // BCI's derivation is a real description for a compound symbol, e.g.
      // "(work + house: work to maintain a house)".
      const desc = props.description ?? props.symbol.derivation;

      const titleId = `bci-${props.symbol.bciAv}-title`;
      const descId = `bci-${props.symbol.bciAv}-desc`;
      const labelled = desc ? `${titleId} ${descId}` : titleId;

      const markup = props.symbol.svg
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

      return h('span', { ...attrs, innerHTML: markup });
    };
  },
});
