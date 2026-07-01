// SEO meta helpers shared by the marketing route handlers.

/**
 * Clamp a string to a SERP-safe meta-description length.
 *
 * Google truncates the `<meta name="description">` snippet around
 * 155–160 characters, so longer copy loses its tail mid-sentence. This
 * trims to a sentence boundary when one sits reasonably close to the
 * limit, otherwise to a word boundary with an ellipsis — never a hard
 * cut mid-word. Use it for the SERP `description` field; the richer
 * `openGraph.description` can stay full-length for social previews.
 */
export function clampDescription(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  const slice = clean.slice(0, max);
  const lastSentence = slice.lastIndexOf(". ");
  if (lastSentence >= max * 0.6) {
    return slice.slice(0, lastSentence + 1);
  }
  const lastSpace = slice.lastIndexOf(" ");
  const cut = slice.slice(0, lastSpace > 0 ? lastSpace : max);
  // Drop any trailing punctuation/whitespace so the ellipsis reads
  // cleanly ("owned fan data…" not "owned fan data,…").
  return `${cut.replace(/[\s,;:.!?–—-]+$/u, "")}…`;
}
