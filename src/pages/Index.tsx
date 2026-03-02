import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CategoryResult {
  category: "modality_shift" | "actor_power_shift" | "scope_change" | "threshold_shift" | "action_domain_shift" | "obligation_removal";
  status: "changed" | "unchanged";
  label: string;
  originalEvidence: string;
  revisedEvidence: string;
}

interface DiffResult {
  overallVerdict: "meaningful_change" | "no_meaningful_change";
  categories: CategoryResult[];
}

const categoryLabels: Record<string, string> = {
  modality_shift: "Modality Shift",
  actor_power_shift: "Actor Power Shift",
  scope_change: "Scope Change",
  threshold_shift: "Threshold / Standard Shift",
  action_domain_shift: "Action Domain Shift",
  obligation_removal: "Obligation Removal",
};

const SAMPLE_ORIGINAL = "The Organization shall conduct periodic audits and maintain internal compliance controls designed to ensure adherence to policy.";
const SAMPLE_REVISED = "The Organization may conduct periodic audits and implement internal compliance controls designed to promote adherence to policy.";

const Index = () => {
  const [original, setOriginal] = useState("");
  const [revised, setRevised] = useState("");
  const [result, setResult] = useState<DiffResult | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  const handleCompare = async () => {
    if (!original.trim() || !revised.trim()) {
      toast.error("Please enter text in both fields.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("meaning-diff", {
        body: { original, revised },
      });

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
      setLoading(false);
    }
  };

  const handleLoadSample = () => {
    setOriginal(SAMPLE_ORIGINAL);
    setRevised(SAMPLE_REVISED);
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
        <button
          onClick={handleLoadSample}
          className="mt-3 px-4 py-1.5 rounded-md border border-border bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
        >
          Load Sample Text
        </button>
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

      {/* Compare Button */}
      <div className="flex justify-center mb-10">
        <button
          onClick={handleCompare}
          disabled={loading}
          className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-[hsl(209,38%,23%)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Comparing…" : "Compare"}
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6 animate-pulse">
          {/* Verdict skeleton */}
          <div className="h-10 w-64 rounded-lg bg-muted" />

          {/* Category chips skeleton */}
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-7 rounded-full bg-muted" style={{ width: `${80 + i * 20}px` }} />
            ))}
          </div>

          {/* Detail cards skeleton */}
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
                  {categoryLabels[cat.category] || cat.category}
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
                        {categoryLabels[cat.category] || cat.category}
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
                    {categoryLabels[cat.category] || cat.category}
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
