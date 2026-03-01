import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Finding {
  type: "scope" | "obligation" | "condition" | "definition" | "rights" | "liability" | "no_change";
  severity: "high" | "medium" | "low" | "none";
  summary: string;
  detail: string;
  originalSnippet: string;
  revisedSnippet: string;
}

interface DiffResult {
  overallVerdict: "meaningful_change" | "no_meaningful_change";
  overallSummary: string;
  findings: Finding[];
}

const severityColors: Record<string, { border: string; bg: string; badge: string }> = {
  high: { border: "border-red-400", bg: "bg-red-50 dark:bg-red-950/20", badge: "bg-red-100 text-red-800 border-red-200" },
  medium: { border: "border-amber-400", bg: "bg-amber-50 dark:bg-amber-950/20", badge: "bg-amber-100 text-amber-800 border-amber-200" },
  low: { border: "border-blue-400", bg: "bg-blue-50 dark:bg-blue-950/20", badge: "bg-blue-100 text-blue-800 border-blue-200" },
  none: { border: "border-border", bg: "bg-card", badge: "bg-secondary text-secondary-foreground border-border" },
};

const typeLabels: Record<string, string> = {
  scope: "Scope",
  obligation: "Obligation",
  condition: "Condition",
  definition: "Definition",
  rights: "Rights",
  liability: "Liability",
  no_change: "No Change",
};

const Index = () => {
  const [original, setOriginal] = useState("");
  const [revised, setRevised] = useState("");
  const [result, setResult] = useState<DiffResult | null>(null);
  const [loading, setLoading] = useState(false);

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

      setResult(data as DiffResult);
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-mono">
          Meaning Diff
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Compare two versions. See if the meaning changed.
        </p>
      </header>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Original
          </label>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            className="w-full h-64 md:h-80 p-4 rounded-lg border bg-card text-card-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Paste original text here…"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Revised
          </label>
          <textarea
            value={revised}
            onChange={(e) => setRevised(e.target.value)}
            className="w-full h-64 md:h-80 p-4 rounded-lg border bg-card text-card-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Paste revised text here…"
          />
        </div>
      </div>

      {/* Compare Button */}
      <div className="flex justify-center mb-10">
        <button
          onClick={handleCompare}
          disabled={loading}
          className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Comparing…" : "Compare"}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Verdict Badge */}
          <div className="flex items-center gap-3">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${
                result.overallVerdict === "meaningful_change"
                  ? "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800"
                  : "bg-green-50 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800"
              }`}
            >
              <span className="text-lg">
                {result.overallVerdict === "meaningful_change" ? "⚠" : "✓"}
              </span>
              {result.overallVerdict === "meaningful_change"
                ? "Meaning Changed"
                : "No Meaningful Change"}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-lg border bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Summary
            </h2>
            <p className="text-sm leading-relaxed text-card-foreground">
              {result.overallSummary}
            </p>
          </div>

          {/* Findings */}
          {result.findings.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Findings ({result.findings.length})
              </h2>
              <div className="space-y-4">
                {result.findings.map((finding, i) => {
                  const colors = severityColors[finding.severity] || severityColors.none;
                  return (
                    <div
                      key={i}
                      className={`rounded-lg border-l-4 ${colors.border} ${colors.bg} p-5`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors.badge}`}
                        >
                          {finding.severity.toUpperCase()}
                        </span>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                          {typeLabels[finding.type] || finding.type}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-foreground mb-2">
                        {finding.summary}
                      </p>

                      {finding.detail && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {finding.detail}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        <div className="rounded-md border bg-background p-3">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                            Original
                          </div>
                          <p className="text-xs font-mono text-foreground leading-relaxed">
                            {finding.originalSnippet}
                          </p>
                        </div>
                        <div className="rounded-md border bg-background p-3">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                            Revised
                          </div>
                          <p className="text-xs font-mono text-foreground leading-relaxed">
                            {finding.revisedSnippet}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Index;
