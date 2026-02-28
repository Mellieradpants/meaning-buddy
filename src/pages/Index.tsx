import { useState } from "react";
import { computeDiff, detectRisks, DiffResult, RiskFlag } from "@/lib/diff";
import { toast } from "sonner";

const Index = () => {
  const [original, setOriginal] = useState("");
  const [revised, setRevised] = useState("");
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [risks, setRisks] = useState<RiskFlag[]>([]);
  const [hasCompared, setHasCompared] = useState(false);

  const handleCompare = () => {
    if (!original.trim() || !revised.trim()) {
      toast.error("Please enter text in both fields.");
      return;
    }
    const d = computeDiff(original, revised);
    const r = detectRisks(original, revised, d);
    setDiff(d);
    setRisks(r);
    setHasCompared(true);
  };

  const handleCopy = () => {
    if (!diff) return;
    let text = "=== CHANGES SUMMARY ===\n";
    text += `Added (${diff.added.length}): ${diff.added.join(", ") || "None"}\n`;
    text += `Removed (${diff.removed.length}): ${diff.removed.join(", ") || "None"}\n`;
    text += `Substitutions (${diff.substitutions.length}):\n`;
    diff.substitutions.forEach(s => { text += `  "${s.original}" → "${s.revised}"\n`; });
    text += "\n=== PROPAGATION RISK FLAGS ===\n";
    if (risks.length === 0) text += "No risks detected.\n";
    risks.forEach(r => { text += `⚠ ${r.snippet} — ${r.reason}\n`; });
    navigator.clipboard.writeText(text);
    toast.success("Results copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-mono">
          Meaning Diff
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Compare text revisions and detect meaning-altering changes.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Original
          </label>
          <textarea
            value={original}
            onChange={e => setOriginal(e.target.value)}
            className="w-full h-56 md:h-72 p-4 rounded-lg border bg-card text-card-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Paste original text here…"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Revised
          </label>
          <textarea
            value={revised}
            onChange={e => setRevised(e.target.value)}
            className="w-full h-56 md:h-72 p-4 rounded-lg border bg-card text-card-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Paste revised text here…"
          />
        </div>
      </div>

      <div className="flex gap-3 mb-8">
        <button
          onClick={handleCompare}
          className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Compare
        </button>
        {hasCompared && (
          <button
            onClick={handleCopy}
            className="px-6 py-2.5 rounded-lg border bg-card text-card-foreground font-semibold text-sm hover:bg-secondary transition-colors"
          >
            Copy Results
          </button>
        )}
      </div>

      {hasCompared && diff && (
        <div className="space-y-6">
          {/* Changes Summary */}
          <section className="rounded-lg border bg-card p-5">
            <h2 className="text-lg font-bold mb-4 font-mono">Changes Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-md p-4" style={{ background: "hsl(var(--added-bg))" }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "hsl(var(--added))" }}>
                  Added ({diff.added.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {diff.added.length === 0 && <span className="text-sm text-muted-foreground">None</span>}
                  {diff.added.map((w, i) => (
                    <span key={i} className="inline-block px-2 py-0.5 rounded text-xs font-mono font-medium" style={{ background: "hsl(var(--added) / 0.15)", color: "hsl(var(--added))" }}>
                      {w}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-md p-4" style={{ background: "hsl(var(--removed-bg))" }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "hsl(var(--removed))" }}>
                  Removed ({diff.removed.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {diff.removed.length === 0 && <span className="text-sm text-muted-foreground">None</span>}
                  {diff.removed.map((w, i) => (
                    <span key={i} className="inline-block px-2 py-0.5 rounded text-xs font-mono font-medium" style={{ background: "hsl(var(--removed) / 0.15)", color: "hsl(var(--removed))" }}>
                      {w}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-md p-4" style={{ background: "hsl(var(--substituted-bg))" }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "hsl(var(--substituted))" }}>
                  Substitutions ({diff.substitutions.length})
                </div>
                <div className="space-y-1">
                  {diff.substitutions.length === 0 && <span className="text-sm text-muted-foreground">None</span>}
                  {diff.substitutions.map((s, i) => (
                    <div key={i} className="text-xs font-mono">
                      <span style={{ color: "hsl(var(--removed))" }}>{s.original}</span>
                      <span className="text-muted-foreground mx-1">→</span>
                      <span style={{ color: "hsl(var(--added))" }}>{s.revised}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Propagation Risk Flags */}
          <section className="rounded-lg border bg-card p-5">
            <h2 className="text-lg font-bold mb-4 font-mono">Propagation Risk Flags</h2>
            {risks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No propagation risks detected.</p>
            ) : (
              <div className="space-y-2">
                {risks.map((r, i) => (
                  <div key={i} className="rounded-md p-3 flex gap-3 items-start" style={{ background: "hsl(var(--risk-bg))" }}>
                    <span className="text-base mt-0.5" style={{ color: "hsl(var(--risk))" }}>⚠</span>
                    <div>
                      <div className="text-sm font-mono font-medium">{r.snippet}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{r.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default Index;
