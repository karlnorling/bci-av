/**
 * Shared types for the @bci-av packages.
 * @module @bci-av/core/types
 */

/**
 * A single Blissymbol from the BCI Authorized Vocabulary.
 */
export interface BlissSymbol {
  /**
   * The BCI-AV number, e.g. `"8483"`. This is the stable identity across
   * vocabulary editions — glosses and ids can be revised, numbers are not
   * reused.
   */
  bciAv: string;
  /**
   * BCI's explanation of how the symbol is composed, e.g. which symbols a
   * compound is built from. Bliss is a generative system, so this is the
   * semantic structure rather than prose documentation. Empty for some symbols.
   */
  derivation: string;
  /** The primary English gloss, e.g. `"housework"`. */
  gloss: string;
  /**
   * Slug derived from the primary gloss, e.g. `"house-work"`. Unique within the
   * registry; suffixed with the BCI-AV number where two glosses would collide.
   */
  id: string;
  /**
   * Gloss by ISO 639-1 language code, e.g. `{ en: "housework", de: "Hausarbeit" }`.
   * Languages BCI has not translated a given symbol into are absent rather
   * than empty.
   */
  names: Record<string, string>;
  /**
   * Part of speech, as BCI records it — a colour name such as `"YELLOW"`.
   * Bliss encodes grammatical class by the colour a symbol is drawn on, so this
   * is both the part of speech and the display colour convention.
   */
  pos: string;
  /**
   * Inline SVG markup. The root carries a `viewBox` and no physical width or
   * height, so it scales to whatever the caller sets.
   *
   * Upstream ships a `<style>` block using nine class names shared by every
   * symbol, which would collide when two symbols appear in one document; those
   * rules are flattened into presentation attributes at generate time.
   */
  svg: string;
  /**
   * Every English gloss for this symbol, primary first, e.g.
   * `["house_work", "housekeeping", "housework"]`. BCI lists synonyms in a
   * single comma-separated field; they are split out so all of them are
   * searchable.
   */
  synonyms: string[];
}
