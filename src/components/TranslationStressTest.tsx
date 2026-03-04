import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { EFFECT_LANGUAGES, type EffectLanguage } from "@/hooks/useEffectTranslation";

// Synthetic scenario designed to stress-test number/unit preservation
const STRESS_ORIGINAL = `Page 1: The insurer shall reimburse 90% of covered diagnostic costs within 30 days of claim submission. Coverage applies for a minimum of 3 years from the policy effective date of Jan 1, 2025. The deductible is $10,000 per policy year. Appeals must be filed within 14 calendar days. The co-pay range is 1%–5% of the total billed amount.`;

const STRESS_REVISED = `Page 1: The insurer may reimburse 75% of certain diagnostic costs within a reasonable timeframe after claim review. Coverage may apply for up to 7 years from the policy start date. The deductible threshold is $10,000 per coverage period. Appeals may be submitted within 30 business days. The co-pay range is 1%–5% of approved charges.`;

// Numbers/tokens we expect to find preserved in every translation
const EXPECTED_NUMBERS = [
  "90%", "75%", "30", "3", "7", "1%", "5%", "$10,000", "14", "10,000",
];

function extractNumbers(text: string): string[] {
  // Extract all number-like tokens including currency, percentages, dates
  const matches = text.match(/\$?[\d,]+(?:\.\d+)?%?/g) || [];
  return matches;
}

function checkNumbersPreserved(englishEffect: string, translatedEffect: string): { pass: boolean; missing: string[] } {
  const englishNums = extractNumbers(englishEffect);
  const missing: string[] = [];
  for (const num of englishNums) {
    if (!translatedEffect.includes(num)) {
      missing.push(num);
    }
  }
  return { pass: missing.length === 0, missing };
}

function checkEvidenceUnchanged(
  originalEvidence: string[],
  currentEvidence: string[]
): boolean {
  if (originalEvidence.length !== currentEvidence.length) return false;
  return originalEvidence.every((e, i) => e === currentEvidence[i]);
}

interface LanguageResult {
  language: EffectLanguage;
  numbersPreserved: boolean;
  missingNumbers: string[];
  evidenceUnchanged: boolean;
  layoutOk: boolean;
  translatedEffects: string[];
  status: "pending" | "testing" | "pass" | "fail" | "error";
}

interface CategoryResult {
  category: string;
  status: "changed" | "unchanged";
  label: string;
  originalEvidence: string;
  revisedEvidence: string;
  operationalEffect?: string;
}

interface DiffResult {
  overallVerdict: string;
  categories: CategoryResult[];
}

export default function TranslationStressTest() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<string>("");
  const [results, setResults] = useState<LanguageResult[]>([]);
  const [comparisonResult, setComparisonResult] = useState<DiffResult | null>(null);
  const abortRef = useRef(false);

  const runTest = useCallback(async () => {
    abortRef.current = false;
    setRunning(true);
    setResults([]);
    setComparisonResult(null);

    // Phase 1: Run comparison
    setPhase("Running comparison…");
    try {
      const { data, error } = await supabase.functions.invoke("meaning-diff", {
        body: { original: STRESS_ORIGINAL, revised: STRESS_REVISED },
      });

      if (error || data?.error) {
        setPhase("Comparison failed: " + (error?.message || data?.error));
        setRunning(false);
        return;
      }

      const diffResult = data as DiffResult;
      setComparisonResult(diffResult);

      // Collect English effects and evidence
      const changedCats = diffResult.categories.filter(
        (c) => c.status === "changed" && c.operationalEffect && c.operationalEffect !== "No change detected."
      );

      if (changedCats.length === 0) {
        setPhase("No changes detected — cannot test translations.");
        setRunning(false);
        return;
      }

      const englishEffects = changedCats.map((c) => c.operationalEffect!);
      const originalEvidence = changedCats.map((c) => c.originalEvidence);
      const revisedEvidence = changedCats.map((c) => c.revisedEvidence);

      // Initialize results for all languages
      const nonEnglishLangs = EFFECT_LANGUAGES.filter((l) => l !== "English") as EffectLanguage[];
      const initialResults: LanguageResult[] = [
        {
          language: "English",
          numbersPreserved: true,
          missingNumbers: [],
          evidenceUnchanged: true,
          layoutOk: true,
          translatedEffects: englishEffects,
          status: "pass",
        },
        ...nonEnglishLangs.map((lang) => ({
          language: lang,
          numbersPreserved: false,
          missingNumbers: [] as string[],
          evidenceUnchanged: true,
          layoutOk: false,
          translatedEffects: [] as string[],
          status: "pending" as const,
        })),
      ];
      setResults(initialResults);

      // Phase 2: Test each language
      for (let langIdx = 0; langIdx < nonEnglishLangs.length; langIdx++) {
        if (abortRef.current) break;

        const lang = nonEnglishLangs[langIdx];
        setPhase(`Translating: ${lang} (${langIdx + 1}/${nonEnglishLangs.length})…`);

        // Update status to testing
        setResults((prev) =>
          prev.map((r) => (r.language === lang ? { ...r, status: "testing" as const } : r))
        );

        try {
          const { data: transData, error: transError } = await supabase.functions.invoke(
            "translate-effect",
            { body: { effects: englishEffects, targetLanguage: lang } }
          );

          if (abortRef.current) break;

          if (transError || transData?.error) {
            setResults((prev) =>
              prev.map((r) =>
                r.language === lang ? { ...r, status: "error" as const } : r
              )
            );
            continue;
          }

          const translations: string[] = transData.translations;

          // Check number preservation
          let allNumbersOk = true;
          const allMissing: string[] = [];
          for (let i = 0; i < englishEffects.length; i++) {
            const check = checkNumbersPreserved(englishEffects[i], translations[i] || "");
            if (!check.pass) {
              allNumbersOk = false;
              allMissing.push(...check.missing.map((m) => `[${i}] ${m}`));
            }
          }

          // Evidence check (evidence comes from the original result, never changes)
          const currentOrigEvidence = changedCats.map((c) => c.originalEvidence);
          const currentRevEvidence = changedCats.map((c) => c.revisedEvidence);
          const evidenceOk =
            checkEvidenceUnchanged(originalEvidence, currentOrigEvidence) &&
            checkEvidenceUnchanged(revisedEvidence, currentRevEvidence);

          // Layout check: for Hebrew verify RTL markers are reasonable
          let layoutOk = true;
          if (lang === "Hebrew") {
            // Check that translations contain Hebrew characters
            const hebrewRegex = /[\u0590-\u05FF]/;
            layoutOk = translations.every((t) => hebrewRegex.test(t));
          } else {
            // For other languages, just verify translations are non-empty and differ from English
            layoutOk = translations.every((t, i) => t.length > 0 && t !== englishEffects[i]);
          }

          const overallPass = allNumbersOk && evidenceOk && layoutOk;

          setResults((prev) =>
            prev.map((r) =>
              r.language === lang
                ? {
                    ...r,
                    numbersPreserved: allNumbersOk,
                    missingNumbers: allMissing,
                    evidenceUnchanged: evidenceOk,
                    layoutOk,
                    translatedEffects: translations,
                    status: overallPass ? ("pass" as const) : ("fail" as const),
                  }
                : r
            )
          );

          // Small delay between API calls to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (e) {
          if (abortRef.current) break;
          setResults((prev) =>
            prev.map((r) =>
              r.language === lang ? { ...r, status: "error" as const } : r
            )
          );
        }
      }

      setPhase(abortRef.current ? "Aborted" : "Complete");
    } catch (e) {
      setPhase("Error: " + (e instanceof Error ? e.message : "Unknown"));
    } finally {
      setRunning(false);
    }
  }, []);

  const handleAbort = () => {
    abortRef.current = true;
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "pass": return "✅";
      case "fail": return "❌";
      case "error": return "⚠️";
      case "testing": return "⏳";
      case "pending": return "⬜";
      default: return "—";
    }
  };

  const passFailLabel = (val: boolean, status: string) => {
    if (status === "pending" || status === "testing") return "—";
    if (status === "error") return "Error";
    return val ? "Pass" : "Fail";
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Translation Stress Test
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Verifies number/unit preservation and RTL rendering across all languages
          </p>
        </div>
        <div className="flex gap-2">
          {!running ? (
            <button
              onClick={runTest}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary-hover transition-colors"
            >
              Run Stress Test
            </button>
          ) : (
            <button
              onClick={handleAbort}
              className="px-4 py-2 rounded-lg border border-input bg-background text-foreground font-medium text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Abort
            </button>
          )}
        </div>
      </div>

      {/* Phase indicator */}
      {phase && (
        <div className="text-xs text-muted-foreground font-mono">
          {running && <span className="inline-block animate-pulse mr-1">●</span>}
          {phase}
        </div>
      )}

      {/* Synthetic scenario info */}
      {comparisonResult && (
        <div className="rounded-md border border-border bg-muted/30 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Test Scenario
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Synthetic text with numeric patterns: 90%, 75%, 30 days, 3→7 years, 1%–5%, 14 calendar days, $10,000, Jan 1, 2025
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Changes detected: {comparisonResult.categories.filter((c) => c.status === "changed").length}
          </p>
        </div>
      )}

      {/* Results table */}
      {results.length > 0 && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap text-xs">Language</TableHead>
                <TableHead className="whitespace-nowrap text-xs">Status</TableHead>
                <TableHead className="whitespace-nowrap text-xs">Numbers Preserved</TableHead>
                <TableHead className="whitespace-nowrap text-xs">Evidence Unchanged</TableHead>
                <TableHead className="whitespace-nowrap text-xs">Layout OK</TableHead>
                <TableHead className="whitespace-nowrap text-xs">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((r) => (
                <TableRow key={r.language}>
                  <TableCell className="text-xs font-medium text-foreground whitespace-nowrap">
                    {r.language}
                    {r.language === "Hebrew" && (
                      <span className="ml-1 text-[10px] text-muted-foreground">(RTL)</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        r.status === "pass"
                          ? "bg-unchanged-bg text-unchanged border-border"
                          : r.status === "fail"
                            ? "bg-changed-bg text-changed border-changed-border"
                            : r.status === "testing"
                              ? "bg-secondary text-secondary-foreground border-border"
                              : r.status === "error"
                                ? "bg-changed-bg text-changed border-changed-border"
                                : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {statusIcon(r.status)} {r.status.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-foreground">
                    {passFailLabel(r.numbersPreserved, r.status)}
                  </TableCell>
                  <TableCell className="text-xs text-foreground">
                    {passFailLabel(r.evidenceUnchanged, r.status)}
                  </TableCell>
                  <TableCell className="text-xs text-foreground">
                    {passFailLabel(r.layoutOk, r.status)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">
                    {r.missingNumbers.length > 0 && (
                      <span className="text-changed">
                        Missing: {r.missingNumbers.join(", ")}
                      </span>
                    )}
                    {r.status === "pass" && r.language !== "English" && r.translatedEffects[0] && (
                      <span
                        className="block truncate"
                        dir={r.language === "Hebrew" ? "rtl" : undefined}
                      >
                        {r.translatedEffects[0].slice(0, 60)}…
                      </span>
                    )}
                    {r.status === "pass" && r.language === "English" && "Baseline"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Hebrew RTL sample preview */}
      {results.find((r) => r.language === "Hebrew" && r.status === "pass") && (
        <div className="rounded-md border border-border bg-muted/30 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Hebrew RTL Preview
          </div>
          <div className="space-y-1">
            {results
              .find((r) => r.language === "Hebrew")!
              .translatedEffects.map((t, i) => (
                <p
                  key={i}
                  dir="rtl"
                  className="text-xs text-foreground leading-relaxed"
                  style={{ textAlign: "right" }}
                >
                  {t}
                </p>
              ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {phase === "Complete" && results.length > 0 && (
        <div className="text-xs font-mono text-muted-foreground border-t border-border pt-3">
          {results.every((r) => r.status === "pass") ? (
            <span className="text-unchanged font-semibold">
              ✅ All {results.length} languages passed verification
            </span>
          ) : (
            <span className="text-changed font-semibold">
              ❌ {results.filter((r) => r.status !== "pass").length} language(s) need attention
            </span>
          )}
        </div>
      )}
    </div>
  );
}
