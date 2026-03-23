import { type ClassifiedResult } from "./classifier";
import { type CategoryKey } from "./taxonomy";

// --------------- Types ---------------

export type EvidenceStatus = "found" | "not_found" | "not_required";
export type EvidenceComparison = "match" | "partial" | "unclear";

export type SourceClass =
  | "legal_statute"
  | "regulatory_filing"
  | "corporate_filing"
  | "medical_journal"
  | "government_record"
  | "technical_standard"
  | "general_reference";

export interface EvidenceSource {
  sourceName: string;
  link: string;
  snippet: string;
  section?: string;
  timestamp?: string;
}

export interface EvidenceTrace {
  claimText: string;
  retrievedSnippet: string;
  comparison: EvidenceComparison;
}

export interface ClaimEvidence {
  claim: string;
  category: CategoryKey;
  sourceClass: SourceClass;
  evidenceStatus: EvidenceStatus;
  sources: EvidenceSource[];
  evidenceTrace: EvidenceTrace[];
}

export interface EvidenceResult {
  claims: ClaimEvidence[];
  retrievalTriggered: boolean;
  triggerReason: string;
}

// --------------- Trigger logic ---------------

/**
 * Determines whether evidence retrieval should be triggered.
 * Retrieval is NOT automatic for all inputs.
 */
export function shouldRetrieveEvidence(
  text: string,
  classified: ClassifiedResult[],
  userRequested: boolean
): { shouldRetrieve: boolean; reason: string } {
  // 1. User explicitly requested source validation
  if (userRequested) {
    return { shouldRetrieve: true, reason: "user_requested" };
  }

  // 2. Text contains verifiable legal/regulatory references
  const legalRefs = /\b(section\s+\d+|§\s*\d+|title\s+\d+|cfr|u\.?s\.?c\.?|pub\.?\s*l\.?|executive\s+order|regulation\s+\d+|statute|act\s+of\s+\d{4})\b/gi;
  if (legalRefs.test(text)) {
    return { shouldRetrieve: true, reason: "legal_reference_detected" };
  }

  // 3. Text references specific standards or codes
  const standardRefs = /\b(iso\s*\d+|astm|ansi|osha\s+\d+|hipaa|gdpr|ferpa|ada\s+compliance|irs\s+(?:code|rule)|fda\s+(?:rule|regulation))\b/gi;
  if (standardRefs.test(text)) {
    return { shouldRetrieve: true, reason: "standard_reference_detected" };
  }

  // 4. Low classification confidence — many categories but few matches each
  if (classified.length >= 3) {
    const avgMatches = classified.reduce((s, c) => s + c.matches.length, 0) / classified.length;
    if (avgMatches <= 1.5) {
      return { shouldRetrieve: true, reason: "low_classification_confidence" };
    }
  }

  // 5. Text contains specific numeric claims that could be verified
  const numericClaims = /\b(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:percent|%|dollars?|\$|deaths?|cases?|violations?|incidents?)\b/gi;
  if (numericClaims.test(text)) {
    return { shouldRetrieve: true, reason: "numeric_claim_detected" };
  }

  return { shouldRetrieve: false, reason: "no_retrieval_trigger" };
}

// --------------- Source routing ---------------

/**
 * Maps category + text content to the appropriate source class.
 * Routing is deterministic based on detected patterns.
 */
export function routeToSourceClass(category: CategoryKey, claimText: string): SourceClass {
  const lower = claimText.toLowerCase();

  // Legal / statutory
  if (/\b(section|§|statute|act|code|u\.?s\.?c|cfr|regulation|pub\.?\s*l)\b/i.test(lower)) {
    return "legal_statute";
  }

  // Regulatory
  if (/\b(osha|epa|fda|ftc|sec\b|regulatory|compliance|enforcement)\b/i.test(lower)) {
    return "regulatory_filing";
  }

  // Corporate
  if (/\b(shareholder|board|fiduciary|proxy|10-k|annual report|bylaws|charter|corporate)\b/i.test(lower)) {
    return "corporate_filing";
  }

  // Medical
  if (/\b(patient|clinical|diagnosis|treatment|hipaa|medical|pharmaceutical|dosage|journal)\b/i.test(lower)) {
    return "medical_journal";
  }

  // Government
  if (/\b(executive order|federal register|government|agency|department|public\s+law)\b/i.test(lower)) {
    return "government_record";
  }

  // Technical standards
  if (/\b(iso|astm|ansi|ieee|standard|specification|protocol)\b/i.test(lower)) {
    return "technical_standard";
  }

  // Category-based fallback
  switch (category) {
    case "modality_shift":
    case "obligation_removal":
      return "legal_statute";
    case "actor_power_shift":
      return "government_record";
    case "threshold_shift":
      return "regulatory_filing";
    case "scope_change":
    case "action_domain_shift":
      return "general_reference";
    default:
      return "general_reference";
  }
}

/**
 * Extracts verifiable claims from classified results.
 * Only claims with specific, checkable content are extracted.
 */
export function extractVerifiableClaims(
  text: string,
  classified: ClassifiedResult[]
): Array<{ claim: string; category: CategoryKey; sourceClass: SourceClass }> {
  const claims: Array<{ claim: string; category: CategoryKey; sourceClass: SourceClass }> = [];
  const seen = new Set<string>();

  for (const group of classified) {
    for (const match of group.matches) {
      // Extract the quoted content from match strings like: Obligation language: "shall"
      const quoted = match.match(/"([^"]+)"/)?.[1];
      if (!quoted || seen.has(quoted.toLowerCase())) continue;
      seen.add(quoted.toLowerCase());

      // Find the sentence containing this term for context
      const sentencePattern = new RegExp(
        `[^.!?]*\\b${quoted.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b[^.!?]*[.!?]?`,
        "i"
      );
      const sentenceMatch = text.match(sentencePattern);
      const claimText = sentenceMatch?.[0]?.trim() || quoted;

      claims.push({
        claim: claimText,
        category: group.category,
        sourceClass: routeToSourceClass(group.category, claimText),
      });
    }
  }

  return claims;
}
