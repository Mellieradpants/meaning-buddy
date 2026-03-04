import { useMemo } from "react";
import { CATEGORIES, type CategoryKey } from "@/lib/taxonomy";
import { extractPageFromEvidence } from "@/lib/pageParser";
import { sanitizeEvidence } from "@/lib/sanitize";
import { toast } from "sonner";

interface CategoryResult {
  category: CategoryKey;
  status: "changed" | "unchanged";
  label: string;
  originalEvidence: string;
  revisedEvidence: string;
  operationalEffect?: string;
}

interface ChangeSummaryProps {
  categories: CategoryResult[];
  originalText: string;
  revisedText: string;
  getDisplayEffect?: (index: number, original: string) => string;
  isRtl?: boolean;
}

function truncateSnippet(text: string, max = 80): string {
  if (!text) return "";
  const oneLine = text.replace(/\n/g, " ").trim();
  return oneLine.length > max ? oneLine.slice(0, max) + "…" : oneLine;
}

interface ParsedEntry {
  pageRef: string;
  categoryLabel: string;
  shortLabel: string;
  origSnippet: string;
  revSnippet: string;
  effect: string | null;
  globalIndex: number;
}

function parseEntries(categories: CategoryResult[]): ParsedEntry[] {
  const changed = categories.filter((c) => c.status === "changed");
  return changed.map((cat) => {
    const globalIndex = categories.indexOf(cat);
    const orig = extractPageFromEvidence(cat.originalEvidence);
    const rev = extractPageFromEvidence(cat.revisedEvidence);

    const pageRef =
      orig.page && orig.page !== "not provided"
        ? orig.page
        : rev.page && rev.page !== "not provided"
          ? rev.page
          : "Page: not provided";

    return {
      pageRef,
      categoryLabel: CATEGORIES[cat.category] || cat.category,
      shortLabel: cat.label.replace(/_/g, " "),
      origSnippet: truncateSnippet(sanitizeEvidence(orig.text)),
      revSnippet: truncateSnippet(sanitizeEvidence(rev.text)),
      effect:
        cat.operationalEffect && cat.operationalEffect !== "No change detected."
          ? cat.operationalEffect
          : null,
      globalIndex,
    };
  });
}

function buildMarkdownSummary(
  entries: ParsedEntry[],
  getDisplayEffect?: (index: number, original: string) => string
): string {
  if (entries.length === 0) return "No structural changes detected.";

  const lines = entries.map((e) => {
    let entry = `- ${e.pageRef} — ${e.categoryLabel} — ${e.shortLabel}`;
    if (e.origSnippet) entry += `\n  - Original: "${e.origSnippet}"`;
    if (e.revSnippet) entry += `\n  - Revised: "${e.revSnippet}"`;
    if (e.effect) {
      const displayEffect = getDisplayEffect
        ? getDisplayEffect(e.globalIndex, e.effect)
        : e.effect;
      entry += `\n  - Effect: ${displayEffect}`;
    }
    return entry;
  });

  return lines.join("\n");
}

export default function ChangeSummary({
  categories,
  getDisplayEffect,
  isRtl,
}: ChangeSummaryProps) {
  const entries = useMemo(() => parseEntries(categories), [categories]);
  const markdown = useMemo(
    () => buildMarkdownSummary(entries, getDisplayEffect),
    [entries, getDisplayEffect]
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    toast.success("Summary copied to clipboard");
  };

  if (entries.length === 0) return null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground-strong">
          Change Summary (Markdown)
        </h2>
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 rounded-md text-xs font-medium border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Copy Summary
        </button>
      </div>
      <div className="rounded-lg border border-border bg-card p-4 overflow-x-auto">
        <div className="space-y-4">
          {entries.map((e, i) => {
            const displayEffect = e.effect && getDisplayEffect
              ? getDisplayEffect(e.globalIndex, e.effect)
              : e.effect;

            return (
              <div key={i} className="text-xs text-foreground" style={{ lineHeight: 1.6 }}>
                <div className="font-medium">
                  {e.pageRef} — {e.categoryLabel} — {e.shortLabel}
                </div>
                {e.origSnippet && (
                  <div className="ml-4 mt-0.5 font-mono">
                    <span className="font-semibold text-foreground-strong">Original:</span>{" "}
                    &ldquo;{e.origSnippet}&rdquo;
                  </div>
                )}
                {e.revSnippet && (
                  <div className="ml-4 mt-0.5 font-mono">
                    <span className="font-semibold text-foreground-strong">Revised:</span>{" "}
                    &ldquo;{e.revSnippet}&rdquo;
                  </div>
                )}
                {displayEffect && (
                  <div
                    className="ml-4 mt-0.5"
                    dir={isRtl ? "rtl" : undefined}
                    style={isRtl ? { textAlign: "right" } : undefined}
                  >
                    <span className="font-semibold text-foreground-strong">Effect:</span>{" "}
                    {displayEffect}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
