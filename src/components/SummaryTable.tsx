import { useState, useMemo } from "react";
import { CATEGORIES, type CategoryKey } from "@/lib/taxonomy";
import { extractPageFromEvidence } from "@/lib/pageParser";
import { sanitizeEvidence } from "@/lib/sanitize";
import { t, type UILanguage } from "@/lib/uiTranslations";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";


interface CategoryResult {
  category: CategoryKey;
  status: "changed" | "unchanged";
  label: string;
  originalEvidence: string;
  revisedEvidence: string;
  operationalEffect?: string;
}

interface SummaryTableProps {
  categories: CategoryResult[];
  getDisplayEffect?: (index: number, original: string) => string;
  isRtl?: boolean;
  uiLanguage?: UILanguage;
}

type SortKey = "category" | "page";
type SortDir = "asc" | "desc";

function truncate(text: string, max = 80): string {
  if (!text) return "—";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

function getPageDisplay(cat: CategoryResult): string {
  const orig = extractPageFromEvidence(cat.originalEvidence);
  const rev = extractPageFromEvidence(cat.revisedEvidence);
  if (orig.page && orig.page !== "not provided") return orig.page;
  if (rev.page && rev.page !== "not provided") return rev.page;
  return "—";
}

export function toMarkdownTable(
  categories: CategoryResult[],
  getDisplayEffect?: (index: number, original: string) => string,
  uiLanguage: UILanguage = "English"
): string {
  const header = `| ${t(uiLanguage, "pageSection")} | ${t(uiLanguage, "category")} | ${t(uiLanguage, "status")} | ${t(uiLanguage, "original")} | ${t(uiLanguage, "revised")} | ${t(uiLanguage, "operationalEffect")} |`;
  const divider = "| --- | --- | --- | --- | --- | --- |";
  const rows = categories.map((cat, idx) => {
    const page = getPageDisplay(cat);
    const category = CATEGORIES[cat.category] || cat.category;
    const status = cat.status === "changed" ? t(uiLanguage, "changed") : t(uiLanguage, "unchanged");
    const orig = truncate(sanitizeEvidence(extractPageFromEvidence(cat.originalEvidence).text), 120).replace(/\|/g, "\\|");
    const rev = truncate(sanitizeEvidence(extractPageFromEvidence(cat.revisedEvidence).text), 120).replace(/\|/g, "\\|");
    const rawEffect = cat.operationalEffect || "—";
    const effect = getDisplayEffect && rawEffect !== "—"
      ? getDisplayEffect(idx, rawEffect).replace(/\|/g, "\\|")
      : rawEffect.replace(/\|/g, "\\|");
    return `| ${page} | ${category} | ${status} | ${orig} | ${rev} | ${effect} |`;
  });
  return [header, divider, ...rows].join("\n");
}

export default function SummaryTable({ categories, getDisplayEffect, isRtl, uiLanguage = "English" }: SummaryTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("category");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    const arr = categories.map((cat, idx) => ({ cat, originalIndex: idx }));
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "category") {
        const la = CATEGORIES[a.cat.category] || a.cat.category;
        const lb = CATEGORIES[b.cat.category] || b.cat.category;
        cmp = la.localeCompare(lb);
      } else if (sortKey === "page") {
        const pa = getPageDisplay(a.cat);
        const pb = getPageDisplay(b.cat);
        cmp = pa.localeCompare(pb, undefined, { numeric: true });
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
    return arr;
  }, [categories, sortKey, sortDir]);



  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground-strong mb-3">
          {t(uiLanguage, "summaryTable")}
      </h2>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none whitespace-nowrap"
                onClick={() => toggleSort("page")}
              >
                {t(uiLanguage, "pageSection")}{sortIndicator("page")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none whitespace-nowrap"
                onClick={() => toggleSort("category")}
              >
                {t(uiLanguage, "category")}{sortIndicator("category")}
              </TableHead>
              <TableHead className="whitespace-nowrap">{t(uiLanguage, "status")}</TableHead>
              <TableHead className="whitespace-nowrap">{t(uiLanguage, "originalSnippet")}</TableHead>
              <TableHead className="whitespace-nowrap">{t(uiLanguage, "revisedSnippet")}</TableHead>
              <TableHead className="whitespace-nowrap">{t(uiLanguage, "operationalEffect")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map(({ cat, originalIndex }, i) => {
              const origParsed = extractPageFromEvidence(cat.originalEvidence);
              const revParsed = extractPageFromEvidence(cat.revisedEvidence);
              const rawEffect = cat.operationalEffect && cat.operationalEffect !== "No change detected."
                ? cat.operationalEffect
                : null;
              const displayEffect = rawEffect && getDisplayEffect
                ? getDisplayEffect(originalIndex, rawEffect)
                : rawEffect;

              return (
                <TableRow key={i}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {getPageDisplay(cat)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs font-medium text-foreground">
                    {CATEGORIES[cat.category] || cat.category}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        cat.status === "changed"
                          ? "bg-changed-bg text-changed border-changed-border"
                          : "bg-unchanged-bg text-unchanged border-border"
                      }`}
                    >
                      {cat.status === "changed" ? t(uiLanguage, "changed") : t(uiLanguage, "unchanged")}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs font-mono text-foreground">
                    {truncate(sanitizeEvidence(origParsed.text))}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs font-mono text-foreground">
                    {truncate(sanitizeEvidence(revParsed.text))}
                  </TableCell>
                  <TableCell
                    className="min-w-[220px] max-w-[320px] text-xs text-foreground leading-relaxed whitespace-normal break-words"
                    dir={isRtl && displayEffect ? "rtl" : undefined}
                    style={isRtl && displayEffect ? { textAlign: "right" } : undefined}
                  >
                    {displayEffect || "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
