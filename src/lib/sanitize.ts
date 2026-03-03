/**
 * Strip inline canonical page tags [[PAGE=n]] from evidence text for display.
 * Collapses resulting double-spaces and trims.
 */
export function sanitizeEvidence(text: string): string {
  if (!text) return text;
  return text.replace(/\[\[PAGE=\d+\]\]/g, "").replace(/\s{2,}/g, " ").trim();
}
