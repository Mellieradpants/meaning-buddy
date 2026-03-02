/**
 * Page-marker parser.
 * Detects "Page X", "--- Page X ---", "=== Page X ===" markers in text
 * and assigns each line to its most recent page marker.
 */

const PAGE_MARKER_RE = /^(?:[-=]{2,}\s*)?Page\s+(\d+)(?:\s*[-=]{2,})?$/i;

export interface PageMapping {
  /** Map from 1-based line number to page label (e.g. "Page 3") or null */
  lineToPage: Map<number, string | null>;
  /** Whether any page markers were found */
  hasPageMarkers: boolean;
}

export function parsePageMarkers(text: string): PageMapping {
  const lines = text.split("\n");
  const lineToPage = new Map<number, string | null>();
  let currentPage: string | null = null;
  let hasPageMarkers = false;

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const match = lines[i].trim().match(PAGE_MARKER_RE);
    if (match) {
      currentPage = `Page ${match[1]}`;
      hasPageMarkers = true;
    }
    lineToPage.set(lineNum, currentPage);
  }

  return { lineToPage, hasPageMarkers };
}

/**
 * Given an evidence snippet and the full source text, find the page reference.
 * Returns "Page X" if page markers exist, or "N/A (Lines X–Y)" as fallback.
 */
export function findPageForSnippet(
  snippet: string,
  sourceText: string,
  pageMapping: PageMapping
): string {
  if (!snippet || !sourceText) return "N/A";

  const normalizedSnippet = snippet.replace(/\s+/g, " ").trim().toLowerCase();
  const lines = sourceText.split("\n");

  // Try to find the snippet in the source text
  let bestStartLine = -1;
  let bestEndLine = -1;

  // Search line by line for a substring match
  const fullNormalized = sourceText.replace(/\s+/g, " ").trim().toLowerCase();
  const idx = fullNormalized.indexOf(normalizedSnippet.slice(0, Math.min(60, normalizedSnippet.length)));

  if (idx !== -1) {
    // Map character position back to line number
    let charCount = 0;
    for (let i = 0; i < lines.length; i++) {
      const lineLen = lines[i].length + 1; // +1 for newline
      if (charCount + lineLen > idx && bestStartLine === -1) {
        bestStartLine = i + 1;
      }
      const snippetEnd = idx + normalizedSnippet.length;
      if (charCount + lineLen >= snippetEnd && bestEndLine === -1) {
        bestEndLine = i + 1;
      }
      charCount += lineLen;
    }
  }

  // Fallback: search each line for partial match
  if (bestStartLine === -1) {
    const words = normalizedSnippet.split(" ").slice(0, 5).join(" ");
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(words)) {
        bestStartLine = i + 1;
        bestEndLine = Math.min(i + 3, lines.length);
        break;
      }
    }
  }

  if (bestStartLine === -1) return "N/A";

  const page = pageMapping.lineToPage.get(bestStartLine);
  if (page) return page;

  // No page marker — use line range fallback
  if (bestEndLine === -1) bestEndLine = bestStartLine;
  if (bestStartLine === bestEndLine) {
    return `N/A (Line ${bestStartLine})`;
  }
  return `N/A (Lines ${bestStartLine}–${bestEndLine})`;
}
