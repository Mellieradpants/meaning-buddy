/**
 * Page-marker parser and normalizer.
 *
 * Detects various page marker formats and normalizes them to [[PAGE=<n>]] tags.
 * Also provides utilities for checking page marker presence and extracting
 * page references from evidence strings.
 */

/**
 * Patterns that match page markers (case-insensitive, allow surrounding whitespace).
 * Each pattern captures the page number in group 1.
 */
const PAGE_PATTERNS: RegExp[] = [
  // "Page 12", "PAGE 12", "page 12"
  /^\s*page\s+(\d+)(?:\s+of\s+\d+)?\s*$/i,
  // "p. 12", "p 12"
  /^\s*p\.?\s+(\d+)\s*$/i,
  // "— 12 —", "– 12 –", "- 12 -"  (various dash styles)
  /^\s*[—–\-]+\s*(\d+)\s*[—–\-]+\s*$/,
  // "(12/143)" -> page 12
  /^\s*\(\s*(\d+)\s*\/\s*\d+\s*\)\s*$/,
];

/**
 * Check if a single line matches any page marker pattern.
 * Returns the page number string if matched, or null.
 */
function matchPageMarker(line: string): string | null {
  for (const pattern of PAGE_PATTERNS) {
    const m = line.match(pattern);
    if (m) return m[1];
  }
  return null;
}

/**
 * Returns true if ANY line in the text matches a page marker pattern.
 */
export function hasPageMarkers(text: string): boolean {
  if (!text) return false;
  const lines = text.split("\n");
  for (const line of lines) {
    if (matchPageMarker(line.trim()) !== null) return true;
  }
  return false;
}

/**
 * Normalizes page markers in text to canonical [[PAGE=<n>]] tags.
 * Lines that match a page marker pattern are replaced entirely;
 * all other lines are left unchanged.
 */
export function normalizePages(text: string): string {
  if (!text) return text;
  const lines = text.split("\n");
  const result: string[] = [];

  for (const line of lines) {
    const pageNum = matchPageMarker(line.trim());
    if (pageNum !== null) {
      result.push(`[[PAGE=${pageNum}]]`);
    } else {
      result.push(line);
    }
  }

  return result.join("\n");
}

/**
 * Extract page reference from an evidence string that starts with
 * "Page <n>:", "Page: not provided:", or "Page: unknown:".
 * Returns the display string (e.g. "Page 3") or "not provided" or "unknown".
 */
export function extractPageFromEvidence(evidence: string): {
  page: string;
  text: string;
} {
  if (!evidence) return { page: "", text: evidence };

  const pageMatch = evidence.match(/^Page\s+(\d+):\s*/i);
  if (pageMatch) {
    return {
      page: `Page ${pageMatch[1]}`,
      text: evidence.slice(pageMatch[0].length),
    };
  }

  const notProvided = evidence.match(/^Page:\s*not provided:\s*/i);
  if (notProvided) {
    return {
      page: "not provided",
      text: evidence.slice(notProvided[0].length),
    };
  }

  const unknown = evidence.match(/^Page:\s*unknown:\s*/i);
  if (unknown) {
    return {
      page: "unknown",
      text: evidence.slice(unknown[0].length),
    };
  }

  return { page: "", text: evidence };
}
