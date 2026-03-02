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

const SAMPLE_SCENARIOS: Record<string, { original: string; revised: string }> = {
  mandatory_to_discretionary: {
    original: `The Organization shall conduct a comprehensive internal audit of all operational divisions no less than once per calendar quarter. Each audit shall include a full review of financial records, personnel conduct reports, and regulatory compliance documentation.

The Chief Compliance Officer shall submit a written report to the Board of Directors within thirty days of each audit's completion. This report shall detail all findings, corrective actions taken, and a timeline for resolution of outstanding issues.

All employees shall complete mandatory compliance training within sixty days of onboarding and shall recertify annually. Failure to complete training within the required timeframe shall result in suspension of access privileges.

The Organization shall maintain a centralized compliance register accessible to all department heads, updated in real time as new obligations are identified or existing obligations change.`,
    revised: `The Organization may conduct an internal review of selected operational divisions on a periodic basis as determined by management. Each review may include an examination of financial records, personnel conduct reports, and regulatory compliance documentation.

The Chief Compliance Officer may submit a summary to the Board of Directors at the next scheduled board meeting following any review. This summary may outline key findings and any recommended actions.

All employees are encouraged to complete compliance training within a reasonable timeframe following onboarding and are encouraged to participate in periodic refresher sessions. Access privileges will be managed according to departmental policy.

The Organization may maintain a compliance register accessible to relevant personnel, updated periodically as resources allow.`,
  },
  scope_narrowed: {
    original: `This policy applies to all employees, contractors, temporary staff, and third-party vendors who access, process, or store any organizational data, regardless of location, employment status, or department.

All covered individuals shall adhere to the data handling procedures outlined in this policy when working with personally identifiable information, financial records, health data, intellectual property, or any other category of sensitive information maintained by the Organization.

The Organization shall monitor compliance across all divisions, subsidiaries, and partner entities operating under the Organization's brand or contractual agreements. Monitoring shall include both scheduled reviews and unannounced spot checks.

Violations of this policy by any covered individual shall be subject to disciplinary action, up to and including termination of employment or contract, and may be reported to the relevant regulatory authority.`,
    revised: `This policy applies to full-time employees who access or process customer data within the Organization's primary business unit.

Covered employees shall adhere to the data handling procedures outlined in this policy when working with personally identifiable information maintained in the Organization's primary customer database.

The Organization shall monitor compliance within the primary business unit through scheduled quarterly reviews. Monitoring of subsidiary operations is addressed under separate policies maintained by each subsidiary.

Violations of this policy by covered employees shall be subject to disciplinary action as determined by the employee's direct supervisor and the Human Resources department.`,
  },
  scope_expanded: {
    original: `The annual performance review process applies to all full-time employees who have completed at least twelve months of continuous service within the Organization's domestic operations.

Reviews shall be conducted by the employee's direct supervisor using the standardized evaluation form approved by the Human Resources department. Each review shall assess performance against the objectives established at the beginning of the review period.

Employees who receive an overall rating of "meets expectations" or higher shall be eligible for the standard annual compensation adjustment. Employees rated below "meets expectations" shall be placed on a performance improvement plan.

The results of all performance reviews shall be maintained in the employee's personnel file and shall be accessible to the employee, their direct supervisor, and the Human Resources department.`,
    revised: `The performance review process applies to all employees, contractors, temporary staff, and interns engaged by the Organization across all domestic and international operations, regardless of tenure or employment classification.

Reviews shall be conducted by a cross-functional review panel consisting of the individual's direct supervisor, a peer reviewer, a representative from Human Resources, and where applicable a client-facing stakeholder. Each review shall assess performance against objectives, cultural contribution, cross-team collaboration, and adherence to organizational values.

All reviewed individuals who receive an overall rating of "meets expectations" or higher shall be eligible for compensation adjustments, equity grants, professional development funding, and priority consideration for internal transfers. Individuals rated below "meets expectations" shall be placed on a structured development plan with monthly check-ins.

The results of all reviews shall be maintained in a centralized talent management system accessible to the individual, their review panel, divisional leadership, and the executive team for workforce planning purposes.`,
  },
  responsibility_shift: {
    original: `The Information Security team shall be responsible for defining, implementing, and enforcing all cybersecurity policies across the Organization. This includes establishing access controls, monitoring network activity, and responding to security incidents.

The Information Security team shall conduct vulnerability assessments of all production systems on a monthly basis and shall remediate critical vulnerabilities within seventy-two hours of discovery. All remediation activities shall be documented and reported to the Chief Information Officer.

Department heads shall ensure that their staff complete the cybersecurity awareness training assigned by the Information Security team. The Information Security team shall track completion rates and follow up with non-compliant departments.

Budget allocation for cybersecurity tools, personnel, and training shall be determined by the Information Security team in coordination with the Chief Financial Officer, subject to approval by the executive leadership team.`,
    revised: `Each department head shall be responsible for defining, implementing, and enforcing cybersecurity practices within their respective departments, in alignment with general guidelines issued by the Information Security team. This includes managing access controls for departmental systems, monitoring department-level activity, and coordinating with the Information Security team during security incidents.

Each department shall conduct its own vulnerability assessments of departmental systems on a quarterly basis and shall remediate critical vulnerabilities within a timeframe determined by the department head. Remediation activities shall be documented internally within each department.

Department heads shall independently source and assign cybersecurity awareness training appropriate to their operational context. Completion tracking and follow-up shall be managed within each department.

Budget allocation for departmental cybersecurity tools, personnel, and training shall be determined by each department head within their existing operational budget, without requiring separate approval from the Information Security team or executive leadership.`,
  },
  threshold_change: {
    original: `A supplier shall be considered approved for inclusion on the Organization's vendor list upon achieving a quality audit score of ninety percent or higher, as assessed using the Organization's standardized supplier evaluation framework.

All incoming raw materials shall be inspected upon receipt. A shipment shall be accepted only if the defect rate is below one percent of the total units received. Shipments exceeding this threshold shall be returned to the supplier at the supplier's expense.

The Organization shall review supplier performance on a quarterly basis. Any supplier whose average quality score falls below eighty-five percent over two consecutive quarters shall be placed on probationary status and subject to increased inspection frequency.

Products shall undergo final quality inspection before release. A production lot shall be approved for shipment only when the measured failure rate is at or below zero point five percent, verified through statistical sampling of no fewer than two hundred units per lot.`,
    revised: `A supplier shall be considered approved for inclusion on the Organization's vendor list upon achieving a quality audit score of seventy-five percent or higher, as assessed using a streamlined supplier questionnaire.

All incoming raw materials shall be inspected on a sampling basis. A shipment shall be accepted if the defect rate is below five percent of the sampled units. Shipments exceeding this threshold shall be flagged for review by the receiving department.

The Organization shall review supplier performance on an annual basis. Any supplier whose average quality score falls below sixty percent over the trailing twelve-month period may be placed on a watch list for further evaluation.

Products shall undergo final quality inspection before release. A production lot shall be approved for shipment when the measured failure rate is at or below three percent, verified through sampling of no fewer than fifty units per lot.`,
  },
};

const scenarioLabels: Record<string, string> = {
  mandatory_to_discretionary: "Mandatory → Discretionary",
  scope_narrowed: "Scope Narrowed",
  scope_expanded: "Scope Expanded",
  responsibility_shift: "Responsibility Shift",
  threshold_change: "Threshold Change",
};

function generateSummary(categories: CategoryResult[]): string {
  const changed = categories.filter(c => c.status === "changed");
  if (changed.length === 0) return "No structural changes were detected between the two versions.";

  // Deduplicate by category
  const uniqueCategories = [...new Set(changed.map(c => c.category))];

  const phraseMap: Record<string, string> = {
    modality_shift: "changes mandatory language to discretionary language",
    actor_power_shift: "shifts decision-making authority between parties",
    scope_change: "modifies the scope of what is covered",
    threshold_shift: "adjusts the standards or thresholds required",
    action_domain_shift: "changes the type of actions required",
    obligation_removal: "removes or weakens a previously stated obligation",
  };

  const phrases = uniqueCategories.map(c => phraseMap[c] || "includes a structural change");

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

  const handleLoadScenario = (key: string) => {
    setSelectedScenario(key);
    const scenario = SAMPLE_SCENARIOS[key];
    if (scenario) {
      setOriginal(scenario.original);
      setRevised(scenario.revised);
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
          <Select value={selectedScenario} onValueChange={handleLoadScenario}>
            <SelectTrigger className="h-9 text-xs font-medium bg-secondary text-secondary-foreground border-border">
              <SelectValue placeholder="Load Sample Scenario" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(scenarioLabels).map(([key, label]) => (
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
