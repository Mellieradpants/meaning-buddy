import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 max-w-3xl mx-auto">
      <header className="mb-14">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-mono">
          Language Structure Comparison
        </h1>
        <p className="text-muted-foreground text-sm mt-3 max-w-2xl leading-relaxed">
          Structural change detection for revised documents.
        </p>

        <div className="mt-8">
          <button
            onClick={() => navigate("/tool")}
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Open the tool
          </button>
        </div>
      </header>

      <section className="mb-12">
        <h2 className="text-lg font-semibold font-mono mb-3">What it does</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          Language Structure Comparison compares two versions of text and flags structural changes that alter obligation strength, scope, authority, thresholds, action type, or removed duties.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          It does not evaluate intent or provide legal advice. It identifies structural differences.
        </p>
      </section>

      <section id="how-it-works" className="mb-12 scroll-mt-8">
        <h2 className="text-lg font-semibold font-mono mb-3">How it works</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          The tool evaluates six categories of structural change:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1.5">
          <li>• Modality shift — changes in obligation strength (e.g., "shall" → "may")</li>
          <li>• Actor power shift — changes in who holds authority</li>
          <li>• Scope change — changes in who or what is covered</li>
          <li>• Threshold / standard shift — numeric or qualitative standard changes</li>
          <li>• Action domain shift — changes in the type of required action</li>
          <li>• Obligation removal — deleted or weakened duties</li>
        </ul>
      </section>

      <section className="mb-12">
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
              <span><span className="font-medium">Modality shift</span> — "shall provide" → "may provide"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-0.5">•</span>
              <span><span className="font-medium">Scope change</span> — "all full-time employees" → "eligible employees"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-0.5">•</span>
              <span><span className="font-medium">Threshold shift</span> — "within 30 days" → "within a reasonable timeframe"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-0.5">•</span>
              <span><span className="font-medium">Obligation removal</span> — mandatory duty weakened</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-10 rounded-lg border border-border bg-muted/50 p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          API keys are stored server-side. Do not paste sensitive personal data.
        </p>
      </section>
    </div>
  );
};

export default Landing;
