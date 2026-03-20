import { CategoryKey } from "./taxonomy";

export interface ClassifiedResult {
  category: CategoryKey;
  matches: string[];
}

// Patterns that indicate each taxonomy category in a single source text
const OBLIGATION_WORDS = /\b(shall|must|required|mandatory|obligat(?:ed|ion)|will comply)\b/gi;
const DISCRETION_WORDS = /\b(may|can|optional|encouraged|at its discretion|recommended)\b/gi;
const ACTOR_PATTERNS = /\b(responsible for|authority|shall be responsible|directed by|approved by|authorized by|delegat(?:ed|e)|reports? to)\b/gi;
const SCOPE_PATTERNS = /\b(all|every|each|none|any|no fewer than|at least|minimum|maximum|entire|across all|throughout)\b/gi;
const THRESHOLD_PATTERNS = /\b(\d+\s*(?:percent|%|days?|hours?|business days?|years?|months?|quarters?)|no less than|no more than|at or (?:above|below)|exceeds?|below|within\s+\w+\s+(?:days?|hours?))\b/gi;
const ACTION_DOMAIN_PATTERNS = /\b(inspect(?:ion)?|audit|review|assess(?:ment)?|monitor(?:ing)?|report(?:ing)?|train(?:ing)?|certif(?:y|ication)|submit|conduct|perform|implement|maintain|document)\b/gi;

function collectMatches(text: string, pattern: RegExp): string[] {
  const matches: string[] = [];
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  // Reset lastIndex
  pattern.lastIndex = 0;
  while ((m = pattern.exec(text)) !== null) {
    const word = m[0].toLowerCase();
    if (!seen.has(word)) {
      seen.add(word);
      matches.push(m[0]);
    }
  }
  return matches;
}

/**
 * Classify a single source text into taxonomy categories
 * by detecting structural language patterns present in the text.
 */
export function classifySourceText(text: string): ClassifiedResult[] {
  const buckets: Record<CategoryKey, string[]> = {
    modality_shift: [],
    actor_power_shift: [],
    scope_change: [],
    threshold_shift: [],
    action_domain_shift: [],
    obligation_removal: [],
  };

  // Modality: obligation + discretionary language
  const obligations = collectMatches(text, OBLIGATION_WORDS);
  const discretionary = collectMatches(text, DISCRETION_WORDS);
  if (obligations.length > 0) {
    buckets.modality_shift.push(...obligations.map((w) => `Obligation language: "${w}"`));
  }
  if (discretionary.length > 0) {
    buckets.modality_shift.push(...discretionary.map((w) => `Discretionary language: "${w}"`));
  }

  // Actor / power
  const actors = collectMatches(text, ACTOR_PATTERNS);
  if (actors.length > 0) {
    buckets.actor_power_shift.push(...actors.map((w) => `Authority indicator: "${w}"`));
  }

  // Scope
  const scope = collectMatches(text, SCOPE_PATTERNS);
  if (scope.length > 0) {
    buckets.scope_change.push(...scope.map((w) => `Scope term: "${w}"`));
  }

  // Thresholds
  const thresholds = collectMatches(text, THRESHOLD_PATTERNS);
  if (thresholds.length > 0) {
    buckets.threshold_shift.push(...thresholds.map((w) => `Threshold: "${w}"`));
  }

  // Action domain
  const actions = collectMatches(text, ACTION_DOMAIN_PATTERNS);
  if (actions.length > 0) {
    buckets.action_domain_shift.push(...actions.map((w) => `Action type: "${w}"`));
  }

  // Obligation removal — detect negative obligation patterns
  const negatedObligations = text.match(/\b(?:no longer|not required|no obligation|removed?|waive[ds]?|exempt)\b/gi);
  if (negatedObligations) {
    const seen = new Set<string>();
    for (const m of negatedObligations) {
      const lower = m.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        buckets.obligation_removal.push(`Removal indicator: "${m}"`);
      }
    }
  }

  return Object.entries(buckets)
    .filter(([_, v]) => v.length > 0)
    .map(([k, v]) => ({
      category: k as CategoryKey,
      matches: v,
    }));
}
