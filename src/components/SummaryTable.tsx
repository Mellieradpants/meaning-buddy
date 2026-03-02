import { useState, useMemo } from "react";
import { CATEGORIES, type CategoryKey } from "@/lib/taxonomy";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";

interface CategoryResult {
  category: CategoryKey;
  status: "changed" | "unchanged";
  label: string;
  originalEvidence: string;
  revisedEvidence: string;
  pageReference?: string;
}

interface SummaryTableProps {
  categories: CategoryResult[];
}

type SortKey = "category" | "page";
type SortDir = "asc" | "desc";

function truncate(text: string, max = 80): string {
  if (!text) return "—";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

function toMarkdownTable(categories: CategoryResult[]): string {
  const header = "| Page / Section | Category | Status | Original | Revised |";
  const divider = "| --- | --- | --- | --- | --- |";
  const rows = categories.map((cat) => {
    const page = cat.pageReference ? `Page ${cat.pageReference}` : "—";
    const category = CATEGORIES[cat.category] || cat.category;
    const status = cat.status === "changed" ? "Changed" : "Unchanged";
    const orig = truncate(cat.originalEvidence, 120).replace(/\|/g, "\\|");
    const rev = truncate(cat.revisedEvidence, 120).replace(/\|/g, "\\|");
    return `| ${page} | ${category} | ${status} | ${orig} | ${rev} |`;
  });
  return [header, divider, ...rows].join("\n");
}

export default function SummaryTable({ categories }: SummaryTableProps) {
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
    const arr = [...categories];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "category") {
        const la = CATEGORIES[a.category] || a.category;
        const lb = CATEGORIES[b.category] || b.category;
        cmp = la.localeCompare(lb);
      }
      // page is always "—", so no-op for page sort
      return sortDir === "desc" ? -cmp : cmp;
    });
    return arr;
  }, [categories, sortKey, sortDir]);

  const markdown = useMemo(() => toMarkdownTable(categories), [categories]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    toast.success("Copied as Markdown");
  };

  const handleExport = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "summary-table.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Summary Table of Changes
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-md text-xs font-medium border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Copy as Markdown
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-1.5 rounded-md text-xs font-medium border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Export .md
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none whitespace-nowrap"
                onClick={() => toggleSort("page")}
              >
                Page / Section{sortIndicator("page")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none whitespace-nowrap"
                onClick={() => toggleSort("category")}
              >
                Category{sortIndicator("category")}
              </TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Original Snippet</TableHead>
              <TableHead className="whitespace-nowrap">Revised Snippet</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((cat, i) => (
              <TableRow key={i}>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {cat.pageReference ? `Page ${cat.pageReference}` : "—"}
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs font-medium text-foreground">
                  {CATEGORIES[cat.category] || cat.category}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      cat.status === "changed"
                        ? "bg-[hsl(var(--changed-bg))] text-[hsl(var(--changed))] border-[hsl(38,50%,80%)]"
                        : "bg-[hsl(var(--unchanged-bg))] text-[hsl(var(--unchanged))] border-border"
                    }`}
                  >
                    {cat.status === "changed" ? "Changed" : "Unchanged"}
                  </span>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-xs font-mono text-foreground">
                  {truncate(cat.originalEvidence)}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-xs font-mono text-foreground">
                  {truncate(cat.revisedEvidence)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
