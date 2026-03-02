import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 max-w-3xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-mono">
          Meaning Diff
        </h1>
        <p className="text-muted-foreground text-sm mt-3 max-w-2xl leading-relaxed">
          Meaning Diff flags wording changes that alter obligations, scope, timeframes, definitions, or authority.
        </p>

        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={() => navigate("/tool")}
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Open the tool
          </button>
          <a
            href="#how-it-works"
            className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            How it works
          </a>
        </div>
      </header>

      <section className="mb-10">
        <h2 className="text-lg font-semibold font-mono mb-3">Example</h2>
        <div className="rounded-lg border bg-card p-4 font-mono text-sm space-y-3">
          <div>
            <span className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Original</span>
            <span className="text-foreground">The employer shall provide health insurance to all full-time employees within 30 days of their start date.</span>
          </div>
          <div className="border-t border-border pt-3">
            <span className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Revised</span>
            <span className="text-foreground">The employer may provide health insurance to eligible employees within a reasonable timeframe.</span>
          </div>
        </div>

        <div className="mt-4 rounded-lg border bg-card p-4">
          <span className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Detected changes</span>
          <ul className="text-sm text-foreground space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-0.5">•</span>
              <span><span className="font-medium">Modality shift</span> — "shall provide" → "may provide" (mandatory to discretionary)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-0.5">•</span>
              <span><span className="font-medium">Scope change</span> — "all full-time employees" → "eligible employees" (scope redefined)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-0.5">•</span>
              <span><span className="font-medium">Threshold shift</span> — "within 30 days" → "within a reasonable timeframe" (ambiguity introduced)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-0.5">•</span>
              <span><span className="font-medium">Obligation removal</span> — duty weakened from mandatory to discretionary</span>
            </li>
          </ul>
        </div>
      </section>

      <section id="how-it-works" className="mb-10 scroll-mt-8">
        <h2 className="text-lg font-semibold font-mono mb-3">How it works</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Paste the original version on the left and the revised version on the right, then click Compare. The tool checks six categories of structural change:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
          <li>Modality shift (obligation strength)</li>
          <li>Actor power shift (who holds authority)</li>
          <li>Scope change (who or what is covered)</li>
          <li>Threshold / standard shift (numeric or qualitative bar)</li>
          <li>Action domain shift (type of required action)</li>
          <li>Obligation removal (deleted or weakened duties)</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold font-mono mb-3">Best used for</h2>
        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
          <li>Draft legislation</li>
          <li>Policy revisions</li>
          <li>Contracts</li>
          <li>Terms of service</li>
          <li>Internal rule changes</li>
        </ul>
      </section>

      <section className="mb-10 rounded-lg border border-border bg-muted/50 p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">Privacy note:</span> API keys are stored as server-side secrets. Do not paste sensitive personal data.
        </p>
      </section>
    </div>
  );
};

export default Landing;
