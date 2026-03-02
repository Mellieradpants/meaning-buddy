import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORIES,
  SAMPLE_SCENARIOS,
  SCENARIO_LABELS,
  SUMMARY_PHRASES,
  type CategoryKey,
} from "@/lib/taxonomy";

interface CategoryResult {
  category: CategoryKey;
  status: "changed" | "unchanged";
  label: string;
  originalEvidence: string;
  revisedEvidence: string;
}

interface DiffResult {
  overallVerdict: "meaningful_change" | "no_meaningful_change";
  categories: CategoryResult[];
}

function generateSummary(categories: CategoryResult[]): string {
  const changed = categories.filter(c => c.status === "changed");
  if (changed.length === 0) return "No structural changes were detected between the two versions.";

  const uniqueCategories = [...new Set(changed.map(c => c.category))];
  const phrases = uniqueCategories.map(c => SUMMARY_PHRASES[c] || "includes a structural change");

  if (phrases.length === 1) {
    return `This revision ${phrases[0]}.`;
  }
  const last = phrases.pop();
  return `This revision ${phrases.join(", ")} and ${last}.`;
}

const Index = () => {
  const [original, setOriginal] = useState("");
  const [revised, setRevised] = useState("");
  const [result, setResult] = useState<DiffResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string>("");
  const inputRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const handleCompare = async () => {
    if (!original.trim() || !revised.trim()) {
      toast.error("Please enter text in both fields.");
      return;
    }

    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const currentRequestId = ++requestIdRef.current;

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("meaning-diff", {
        body: { original, revised },
      });

      // If this request was superseded by a reset/new request, discard
      if (currentRequestId !== requestIdRef.current) return;

      if (error) {
        console.error("Edge function error:", error);
        toast.error("Comparison failed. Please try again.");
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      const raw = data as any;
      if (raw.categories) {
        setResult(raw as DiffResult);
      } else if (raw.findings) {
        const mapped: DiffResult = {
          overallVerdict: raw.overallVerdict,
          categories: raw.findings.map((f: any) => ({
            category: f.type || "scope_change",
            status: f.type === "no_change" ? "unchanged" : "changed",
            label: f.summary || f.type,
            originalEvidence: f.originalSnippet || "",
            revisedEvidence: f.revisedSnippet || "",
          })),
        };
        setResult(mapped);
      } else {
        setResult(raw as DiffResult);
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleClear = () => {
    // Invalidate any in-flight request
    requestIdRef.current++;
    abortRef.current?.abort();
    abortRef.current = null;

    setOriginal("");
    setRevised("");
    setResult(null);
    setLoading(false);
    setSelectedScenario("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoadScenario = (key: CategoryKey) => {
    setSelectedScenario(key);
    const scenario = SAMPLE_SCENARIOS[key];
    setOriginal(scenario.original);
    setRevised(scenario.revised);
    setResult(null);
    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const changedCategories = result?.categories.filter(c => c.status === "changed") || [];
  const unchangedCategories = result?.categories.filter(c => c.status === "unchanged") || [];

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    }
  }, []);

  return (
    <div className="min-h-dvh bg-background p-6 md:p-10 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="font-semibold tracking-tight font-mono text-[1.75rem] md:text-[2.25rem]" style={{ lineHeight: 1.2 }}>
          Compare Two Versions of a Section
        </h1>
        <p className="text-muted-foreground text-sm mt-2">
          Paste the earlier version on the left and the revised version on the right.
        </p>
        <p className="text-muted-foreground text-xs mt-1">
          This tool highlights structural wording changes only. It does not interpret intent or provide legal advice.
        </p>
        <div className="mt-3 w-64">
          <Select value={selectedScenario} onValueChange={(v) => handleLoadScenario(v as CategoryKey)}>
            <SelectTrigger className="h-9 text-xs font-medium bg-secondary text-secondary-foreground border-border">
              <SelectValue placeholder="Load Sample (by category)" />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(CATEGORIES) as [CategoryKey, string][]).map(([key, label]) => (
                <SelectItem key={key} value={key} className="text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Input Section */}
      <div ref={inputRef} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Original (earlier version)
          </label>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            className="w-full h-64 md:h-80 p-4 rounded-lg border border-border bg-card text-card-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Paste the earlier version here…"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Revised (updated version)
          </label>
          <textarea
            value={revised}
            onChange={(e) => setRevised(e.target.value)}
            className="w-full h-64 md:h-80 p-4 rounded-lg border border-border bg-card text-card-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Paste the updated version here…"
          />
        </div>
      </div>

      {/* Instruction */}
      <div className="text-sm text-muted-foreground mb-4 text-center space-y-1">
        <p>After pasting both versions, click Compare.</p>
        <p>Results will appear below showing detected structural change types and a side-by-side comparison of modified lines.</p>
      </div>

      {/* Compare & Clear Buttons */}
      <div className="flex justify-center gap-3 mb-10">
        <button
          onClick={handleCompare}
          disabled={loading}
          className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-[hsl(209,38%,23%)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Comparing…" : "Compare"}
        </button>
        <button
          onClick={handleClear}
          className="px-8 py-3 rounded-lg border border-input bg-background text-foreground font-medium text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6 animate-pulse">
          <div className="h-10 w-64 rounded-lg bg-muted" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-7 rounded-full bg-muted" style={{ width: `${80 + i * 20}px` }} />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-20 rounded-full bg-muted" />
                  <div className="h-5 w-28 rounded-full bg-muted" />
                </div>
                <div className="h-4 w-48 rounded bg-muted" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-md border border-border bg-background p-3 space-y-2">
                    <div className="h-3 w-16 rounded bg-muted" />
                    <div className="h-3 w-full rounded bg-muted" />
                  </div>
                  <div className="rounded-md border border-border bg-background p-3 space-y-2">
                    <div className="h-3 w-16 rounded bg-muted" />
                    <div className="h-3 w-full rounded bg-muted" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && result && (
        <div className="space-y-6">
          {/* Verdict Badge */}
          <div className="flex items-center gap-3">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${
                result.overallVerdict === "meaningful_change"
                  ? "bg-[hsl(38,50%,94%)] text-[hsl(38,72%,42%)] border-[hsl(38,50%,80%)]"
                  : "bg-[hsl(210,25%,94%)] text-[hsl(211,13%,52%)] border-border"
              }`}
            >
              <span className="text-lg">
                {result.overallVerdict === "meaningful_change" ? "⚠" : "✓"}
              </span>
              {result.overallVerdict === "meaningful_change"
                ? "Structural Change Detected"
                : "No Meaningful Change"}
            </div>
          </div>

          {/* Plain-Language Summary */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {generateSummary(result.categories)}
          </p>

          {/* Category Chips */}
          {result.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {result.categories.map((cat, i) => (
                <span
                  key={i}
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    cat.status === "changed"
                      ? "bg-[hsl(38,50%,94%)] text-[hsl(38,72%,42%)] border-[hsl(38,50%,80%)]"
                      : "bg-[hsl(210,25%,94%)] text-[hsl(211,13%,52%)] border-border"
                  }`}
                >
                  {CATEGORIES[cat.category] || cat.category}
                </span>
              ))}
            </div>
          )}

          {/* Changed Categories Detail */}
          {changedCategories.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Changes Detected ({changedCategories.length})
              </h2>
              <div className="space-y-4">
                {changedCategories.map((cat, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border bg-card p-5"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[hsl(38,50%,94%)] text-[hsl(38,72%,42%)] border border-[hsl(38,50%,80%)]">
                        CHANGED
                      </span>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                        {CATEGORIES[cat.category] || cat.category}
                      </span>
                    </div>

                    <p className="text-sm font-mono font-medium text-foreground mb-3">
                      {cat.label.replace(/_/g, " ")}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div className="rounded-md border border-border bg-background p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                          Original
                        </div>
                        <p className="text-xs font-mono text-foreground leading-relaxed">
                          {cat.originalEvidence}
                        </p>
                      </div>
                      <div className="rounded-md border border-border bg-background p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                          Revised
                        </div>
                        <p className="text-xs font-mono text-foreground leading-relaxed">
                          {cat.revisedEvidence}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unchanged Categories */}
          {unchangedCategories.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Unchanged ({unchangedCategories.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {unchangedCategories.map((cat, i) => (
                  <span
                    key={i}
                    className="inline-block px-3 py-1.5 rounded-full text-xs font-medium bg-[hsl(210,25%,94%)] text-[hsl(211,13%,52%)] border border-border"
                  >
                    {CATEGORIES[cat.category] || cat.category}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Index;
