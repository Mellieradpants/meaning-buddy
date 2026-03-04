import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// ThemeToggle removed — light-only interface

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    }
  }, []);

  return (
    <div className="min-h-dvh bg-background p-6 md:p-10 max-w-3xl mx-auto">
      <header className="mb-14">
        <h1 className="font-semibold tracking-tight font-mono text-[2rem] md:text-[2.5rem]" style={{ lineHeight: 1.2 }}>
          Structural Language Comparison Tool
        </h1>
        <p className="text-muted-foreground text-sm mt-3 max-w-2xl leading-[1.8]">
          Structural change detection for revised documents.
        </p>

        <div className="mt-8">
          <button
            onClick={() => navigate("/tool")}
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Open the tool
          </button>
        </div>
      </header>

      <section className="mb-14">
        <h2 className="text-xl font-semibold font-mono mb-4">What it does</h2>
        <p className="text-sm text-muted-foreground leading-[1.8] mb-3 max-w-2xl">
          Language Structure Comparison analyzes two versions of text and identifies structural changes that alter obligations, authority, scope, measurable standards, or required actions.
        </p>
        <p className="text-sm text-muted-foreground leading-[1.8] max-w-2xl">
          The tool does not interpret intent or provide legal advice. It highlights structural differences that may change how a rule operates.
        </p>
      </section>

      <section id="how-it-works" className="mb-14 scroll-mt-8">
        <h2 className="text-xl font-semibold font-mono mb-4">How it works</h2>
        <p className="text-sm text-muted-foreground leading-[1.8] mb-4 max-w-2xl">
          The tool evaluates six categories of structural change:
        </p>
        <ul className="text-sm text-muted-foreground space-y-2.5 max-w-2xl leading-[1.8]">
          <li>• Modality Shift — A change in how strong a rule is (for example, "shall" becoming "may").</li>
          <li>• Scope Change — A change in who or what the rule applies to.</li>
          <li>• Actor Power Shift — A change in who has authority or responsibility.</li>
          <li>• Action Domain Shift — A change in the type of action required.</li>
          <li>• Threshold / Standard Shift — A change in a measurable requirement such as time, quantity, or duration.</li>
          <li>• Obligation Removal — A duty or requirement that has been deleted or weakened.</li>
        </ul>
      </section>

      <section className="mb-14">
        <h2 className="text-xl font-semibold font-mono mb-4">Example</h2>
        <div className="rounded-lg border border-border bg-card p-5 font-mono text-sm space-y-4">
          <div>
            <span className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Original</span>
            <span className="text-foreground leading-[1.8]">The employer shall provide health insurance to all full-time employees within 30 days of their start date.</span>
          </div>
          <div className="border-t border-border pt-4">
            <span className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Revised</span>
            <span className="text-foreground leading-[1.8]">The employer may provide health insurance to eligible employees within a reasonable timeframe.</span>
          </div>
          <div className="border-t border-border pt-4">
            <span className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Operational Effect</span>
            <span className="text-foreground leading-[1.8]">Health insurance is no longer guaranteed. The employer can now decide whether to offer it. Coverage no longer extends to all full-time employees — only those deemed eligible. The fixed 30-day deadline no longer applies. The employer can now take as long as it considers reasonable.</span>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-border bg-card p-5">
          <span className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Detected changes</span>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-changed-bg text-changed border border-changed-border">Modality Shift</span>
            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-changed-bg text-changed border border-changed-border">Scope Change</span>
            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-changed-bg text-changed border border-changed-border">Threshold Shift</span>
            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-changed-bg text-changed border border-changed-border">Obligation Removal</span>
          </div>
          <ul className="text-sm text-foreground space-y-2.5">
            <li className="flex items-start gap-2">
              <span className="text-changed mt-0.5">•</span>
              <span><span className="font-medium">Modality Shift</span> — "shall provide" → "may provide"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-changed mt-0.5">•</span>
              <span><span className="font-medium">Scope Change</span> — "all full-time employees" → "eligible employees"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-changed mt-0.5">•</span>
              <span><span className="font-medium">Threshold Shift</span> — "within 30 days" → "within a reasonable timeframe"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-changed mt-0.5">•</span>
              <span><span className="font-medium">Obligation Removal</span> — mandatory duty weakened to discretionary</span>
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
