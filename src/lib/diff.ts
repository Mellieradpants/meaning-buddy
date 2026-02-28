// Tokenize text into words
export function tokenize(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

// Split text into sentences
function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter(Boolean);
}

// Levenshtein edit distance
export function editDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]);
  return dp[m][n];
}

export interface DiffResult {
  added: string[];
  removed: string[];
  substitutions: { original: string; revised: string }[];
}

// Semantic relationship groups for substitution detection
const SEMANTIC_GROUPS: string[][] = [
  // Obligation
  ['must', 'required', 'shall', 'mandatory', 'should', 'can', 'may', 'optional', 'recommended'],
  // Certainty
  ['is', 'are', 'will', 'shall', 'must', 'may', 'might', 'could', 'likely', 'possibly', 'perhaps', 'probably'],
  // Quantifiers / scope
  ['all', 'every', 'each', 'always', 'none', 'never', 'some', 'many', 'few', 'most', 'several', 'any'],
  // Negation
  ['no', 'not', 'never', "can't", "don't", "won't", 'cannot', "doesn't", "isn't", "aren't", "wasn't", "weren't"],
  // Temporal
  ['before', 'after', 'during', 'until', 'since', 'while'],
  // Inclusion/exclusion
  ['include', 'exclude', 'except', 'only', 'also', 'additionally'],
];

function areSemanticRelated(a: string, b: string): boolean {
  const al = a.toLowerCase(), bl = b.toLowerCase();
  if (editDistance(al, bl) <= 2) return true;
  for (const group of SEMANTIC_GROUPS) {
    if (group.includes(al) && group.includes(bl)) return true;
  }
  return false;
}

export function computeDiff(original: string, revised: string): DiffResult {
  const origSentences = splitSentences(original);
  const revSentences = splitSentences(revised);

  const added: string[] = [];
  const removed: string[] = [];
  const substitutions: { original: string; revised: string }[] = [];

  const maxLen = Math.max(origSentences.length, revSentences.length);

  for (let i = 0; i < maxLen; i++) {
    const origTokens = i < origSentences.length ? tokenize(origSentences[i]) : [];
    const revTokens = i < revSentences.length ? tokenize(revSentences[i]) : [];

    const origSet = new Set(origTokens.map(t => t.toLowerCase()));
    const revSet = new Set(revTokens.map(t => t.toLowerCase()));

    // Collect raw added/removed for this sentence
    const sentAdded: { word: string; pos: number }[] = [];
    const sentRemoved: { word: string; pos: number }[] = [];

    for (let j = 0; j < revTokens.length; j++) {
      if (!origSet.has(revTokens[j].toLowerCase())) sentAdded.push({ word: revTokens[j], pos: j });
    }
    for (let j = 0; j < origTokens.length; j++) {
      if (!revSet.has(origTokens[j].toLowerCase())) sentRemoved.push({ word: origTokens[j], pos: j });
    }

    // Also detect positional substitutions (same position, different word, close edit distance)
    const minLen = Math.min(origTokens.length, revTokens.length);
    for (let j = 0; j < minLen; j++) {
      const o = origTokens[j], r = revTokens[j];
      if (o.toLowerCase() !== r.toLowerCase() && editDistance(o.toLowerCase(), r.toLowerCase()) <= 3) {
        // Only add if not already captured as added/removed pair
        const alreadyCaptured = sentRemoved.some(x => x.word === o) && sentAdded.some(x => x.word === r);
        if (!alreadyCaptured) {
          substitutions.push({ original: o, revised: r });
        }
      }
    }

    // Match removed→added as substitutions when semantically related and near same position
    const matchedAdded = new Set<number>();
    const matchedRemoved = new Set<number>();

    for (let ri = 0; ri < sentRemoved.length; ri++) {
      let bestIdx = -1;
      let bestDist = Infinity;
      for (let ai = 0; ai < sentAdded.length; ai++) {
        if (matchedAdded.has(ai)) continue;
        const rw = sentRemoved[ri].word, aw = sentAdded[ai].word;
        if (areSemanticRelated(rw, aw)) {
          const posDist = Math.abs(sentRemoved[ri].pos - sentAdded[ai].pos);
          if (posDist < bestDist) {
            bestDist = posDist;
            bestIdx = ai;
          }
        }
      }
      if (bestIdx !== -1) {
        substitutions.push({ original: sentRemoved[ri].word, revised: sentAdded[bestIdx].word });
        matchedRemoved.add(ri);
        matchedAdded.add(bestIdx);
      }
    }

    // Remaining unmatched go to added/removed
    for (let ri = 0; ri < sentRemoved.length; ri++) {
      if (!matchedRemoved.has(ri)) removed.push(sentRemoved[ri].word);
    }
    for (let ai = 0; ai < sentAdded.length; ai++) {
      if (!matchedAdded.has(ai)) added.push(sentAdded[ai].word);
    }
  }

  return { added, removed, substitutions };
}

export interface RiskFlag {
  snippet: string;
  reason: string;
}

const NEGATION = /\b(no|not|never|can'?t|don'?t|won'?t|cannot|doesn'?t|isn'?t|aren'?t|wasn'?t|weren'?t)\b/i;
const QUANTIFIERS = /\b(all|none|always|never|some|many|few|every|each)\b/i;
const CERTAINTY_STRONG = /\b(is|are|will|shall|must)\b/i;
const CERTAINTY_WEAK = /\b(may|might|could|likely|possibly|perhaps|probably)\b/i;
const OBLIGATION_STRONG = /\b(must|required|shall|mandatory)\b/i;
const OBLIGATION_WEAK = /\b(should|can|may|optional|recommended)\b/i;

function isProperNoun(word: string): boolean {
  return /^[A-Z][a-z]/.test(word) && word.length > 1;
}

export function detectRisks(original: string, revised: string, diff: DiffResult): RiskFlag[] {
  const flags: RiskFlag[] = [];

  // Check added/removed for risky patterns
  for (const w of diff.added) {
    if (NEGATION.test(w)) flags.push({ snippet: `Added: "${w}"`, reason: "Negation word added — may reverse meaning" });
    if (QUANTIFIERS.test(w)) flags.push({ snippet: `Added: "${w}"`, reason: "Quantifier added — changes scope" });
  }
  for (const w of diff.removed) {
    if (NEGATION.test(w)) flags.push({ snippet: `Removed: "${w}"`, reason: "Negation word removed — may reverse meaning" });
    if (QUANTIFIERS.test(w)) flags.push({ snippet: `Removed: "${w}"`, reason: "Quantifier removed — changes scope" });
  }

  // Check substitutions
  for (const { original: o, revised: r } of diff.substitutions) {
    if (CERTAINTY_STRONG.test(o) && CERTAINTY_WEAK.test(r))
      flags.push({ snippet: `"${o}" → "${r}"`, reason: "Certainty downgraded — weakens assertion" });
    if (CERTAINTY_WEAK.test(o) && CERTAINTY_STRONG.test(r))
      flags.push({ snippet: `"${o}" → "${r}"`, reason: "Certainty upgraded — strengthens assertion" });
    if (OBLIGATION_STRONG.test(o) && OBLIGATION_WEAK.test(r))
      flags.push({ snippet: `"${o}" → "${r}"`, reason: "Obligation weakened" });
    if (OBLIGATION_WEAK.test(o) && OBLIGATION_STRONG.test(r))
      flags.push({ snippet: `"${o}" → "${r}"`, reason: "Obligation strengthened" });
    if (isProperNoun(o) || isProperNoun(r)) {
      if (editDistance(o, r) <= 2 && o !== r)
        flags.push({ snippet: `"${o}" → "${r}"`, reason: "Proper noun near-match — possible misspelling" });
    }
  }

  // Sentence-level negation/quantifier changes
  const origSentences = original.split(/(?<=[.!?])\s+/);
  const revSentences = revised.split(/(?<=[.!?])\s+/);
  const minS = Math.min(origSentences.length, revSentences.length);
  for (let i = 0; i < minS; i++) {
    const oNeg = NEGATION.test(origSentences[i]);
    const rNeg = NEGATION.test(revSentences[i]);
    if (oNeg !== rNeg) {
      flags.push({
        snippet: `Sentence ${i + 1}: negation ${oNeg ? 'removed' : 'added'}`,
        reason: "Sentence-level negation change — meaning may be inverted"
      });
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  return flags.filter(f => {
    const key = f.snippet + f.reason;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
