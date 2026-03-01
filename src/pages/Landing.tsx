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
          Meaning Diff compares two versions of a document and flags when wording changes actually change what it means, including shifts in scope, obligation, conditions, or definitions.
        </p>
        <p className="text-muted-foreground text-sm mt-3 max-w-2xl leading-relaxed">
          Paste the original version on the left and the revised version on the right, then click Compare.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="text-lg font-semibold font-mono mb-3">What it does</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          It highlights when edits change who is affected, what is required, or under what conditions something applies. Instead of just showing word-level differences, it tells you whether the meaning actually shifted — and in what direction.
        </p>
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

      <section className="mb-10">
        <h2 className="text-lg font-semibold font-mono mb-3">Example</h2>
        <div className="rounded-lg border bg-card p-4 font-mono text-sm space-y-2 mb-3">
          <div>
            <span className="text-muted-foreground">Original:</span>{" "}
            <span className="text-foreground">Users must register.</span>
          </div>
          <div>
            <span className="text-muted-foreground">Revised:</span>{" "}
            <span className="text-foreground">
              Users must register if they access premium features.
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A condition was added. The requirement to register no longer applies universally — it only applies when users access premium features. That narrows when the rule kicks in.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold font-mono mb-3">How it decides something changed</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The tool looks for edits that shift who is affected, what is required, when it applies, or how strong the obligation is. It focuses on changes in scope, conditions, definitions, and force — not just wording differences.
        </p>
      </section>

      <button
        onClick={() => navigate("/tool")}
        className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Open the tool
      </button>
    </div>
  );
};

export default Landing;
