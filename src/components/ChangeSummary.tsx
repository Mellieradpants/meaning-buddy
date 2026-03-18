import { useMemo } from "react";
import { CATEGORIES, type CategoryKey } from "@/lib/taxonomy";
import { extractPageFromEvidence } from "@/lib/pageParser";
import { sanitizeEvidence } from "@/lib/sanitize";
import { t, type UILanguage } from "@/lib/uiTranslations";


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
  uiLanguage?: UILanguage;
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


export default function ChangeSummary({
  categories,
  getDisplayEffect,
  isRtl,
  uiLanguage = "English",
}: ChangeSummaryProps) {
  const entries = useMemo(() => parseEntries(categories), [categories]);


  if (entries.length === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground-strong mb-3">
          {t(uiLanguage, "changeSummary")}
      </h2>
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
                    <span className="font-semibold text-foreground-strong">{t(uiLanguage, "original")}:</span>{" "}
                    &ldquo;{e.origSnippet}&rdquo;
                  </div>
                )}
                {e.revSnippet && (
                  <div className="ml-4 mt-0.5 font-mono">
                    <span className="font-semibold text-foreground-strong">{t(uiLanguage, "revised")}:</span>{" "}
                    &ldquo;{e.revSnippet}&rdquo;
                  </div>
                )}
                {displayEffect && (
                  <div
                    className="ml-4 mt-0.5"
                    dir={isRtl ? "rtl" : undefined}
                    style={isRtl ? { textAlign: "right" } : undefined}
                  >
                    <span className="font-semibold text-foreground-strong">{t(uiLanguage, "effect")}:</span>{" "}
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
