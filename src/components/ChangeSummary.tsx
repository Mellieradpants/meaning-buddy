import { useMemo } from "react";
import { CATEGORIES, type CategoryKey } from "@/lib/taxonomy";
import { parsePageMarkers, findPageForSnippet } from "@/lib/pageParser";
import { toast } from "sonner";

interface CategoryResult {
  category: CategoryKey;
  status: "changed" | "unchanged";
  label: string;
  originalEvidence: string;
  revisedEvidence: string;
}

interface ChangeSummaryProps {
  categories: CategoryResult[];
  originalText: string;
  revisedText: string;
}

function truncateSnippet(text: string, max = 80): string {
  if (!text) return "";
  const oneLine = text.replace(/\n/g, " ").trim();
  return oneLine.length > max ? oneLine.slice(0, max) + "…" : oneLine;
}

function buildMarkdownSummary(
  categories: CategoryResult[],
  originalText: string,
  revisedText: string
): string {
  const changed = categories.filter((c) => c.status === "changed");
  if (changed.length === 0) return "No structural changes detected.";

  const origMapping = parsePageMarkers(originalText);
  const revMapping = parsePageMarkers(revisedText);

  const lines = changed.map((cat) => {
    // Try original text first for page reference, fall back to revised
    let pageRef = findPageForSnippet(cat.originalEvidence, originalText, origMapping);
    if (pageRef === "N/A") {
      pageRef = findPageForSnippet(cat.revisedEvidence, revisedText, revMapping);
    }

    const categoryLabel = CATEGORIES[cat.category] || cat.category;
    const shortLabel = cat.label.replace(/_/g, " ");
    const origSnippet = truncateSnippet(cat.originalEvidence);
    const revSnippet = truncateSnippet(cat.revisedEvidence);

    let entry = `- ${pageRef} — ${categoryLabel} — ${shortLabel}`;
    if (origSnippet) entry += `\n  - Original: "${origSnippet}"`;
    if (revSnippet) entry += `\n  - Revised: "${revSnippet}"`;
    return entry;
  });

  return lines.join("\n");
}

export default function ChangeSummary({
  categories,
  originalText,
  revisedText,
}: ChangeSummaryProps) {
  const changed = categories.filter((c) => c.status === "changed");

  const markdown = useMemo(
    () => buildMarkdownSummary(categories, originalText, revisedText),
    [categories, originalText, revisedText]
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    toast.success("Summary copied to clipboard");
  };

  if (changed.length === 0) return null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
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
        <pre className="text-xs font-mono text-foreground whitespace-pre-wrap leading-relaxed">
          {markdown}
        </pre>
      </div>
    </div>
  );
}
