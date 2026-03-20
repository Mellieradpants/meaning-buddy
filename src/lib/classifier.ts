import { DiffResult, detectRisks } from "./diff";
import { CategoryKey } from "./taxonomy";

export interface ClassifiedResult {
  category: CategoryKey;
  matches: string[];
}

export function classifyDiff(original: string, revised: string, diff: DiffResult): ClassifiedResult[] {
  const risks = detectRisks(original, revised, diff);

  const buckets: Record<CategoryKey, string[]> = {
    modality_shift: [],
    actor_power_shift: [],
    scope_change: [],
    threshold_shift: [],
    action_domain_shift: [],
    obligation_removal: [],
  };

  for (const r of risks) {
    const text = r.reason.toLowerCase();

    if (text.includes("obligation")) {
      buckets.modality_shift.push(r.snippet);
    }

    if (text.includes("certainty")) {
      buckets.modality_shift.push(r.snippet);
    }

    if (text.includes("scope")) {
      buckets.scope_change.push(r.snippet);
    }

    if (text.includes("condition")) {
      buckets.scope_change.push(r.snippet);
    }

    if (text.includes("quantifier")) {
      buckets.scope_change.push(r.snippet);
    }

    if (text.includes("removed") && text.includes("obligation")) {
      buckets.obligation_removal.push(r.snippet);
    }
  }

  return Object.entries(buckets)
    .filter(([_, v]) => v.length > 0)
    .map(([k, v]) => ({
      category: k as CategoryKey,
      matches: v,
    }));
}
