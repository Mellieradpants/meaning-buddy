import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { t, UI_LANGUAGES, getStoredUILanguage, storeUILanguage, isRtlLanguage, langToCode, type UILanguage, type TranslationKey } from "@/lib/uiTranslations";
import { SHIFT_OPTIONS as SHARED_SHIFT_OPTIONS } from "@/lib/sharedConfig";
import { classifySourceText, type ClassifiedResult } from "@/lib/classifier";
import { type CategoryKey } from "@/lib/taxonomy";
import {
  shouldRetrieveEvidence,
  extractVerifiableClaims,
  type ClaimEvidence,
  type EvidenceResult,
  type EvidenceComparison,
} from "@/lib/evidenceRetrieval";

const CATEGORY_TRANSLATION_KEY: Record<CategoryKey, TranslationKey> = {
  modality_shift: "modalityShift",
  actor_power_shift: "actorPowerShift",
  scope_change: "scopeChange",
  threshold_shift: "thresholdShift",
  action_domain_shift: "actionDomainShift",
  obligation_removal: "obligationRemoval",
};

const CATEGORY_EXPLANATION_KEY: Record<CategoryKey, TranslationKey> = {
  modality_shift: "modalityShiftExplanation",
  actor_power_shift: "actorPowerShiftExplanation",
  scope_change: "scopeChangeExplanation",
  threshold_shift: "thresholdShiftExplanation",
  action_domain_shift: "actionDomainShiftExplanation",
  obligation_removal: "obligationRemovalExplanation",
};

const COMPARISON_KEY: Record<EvidenceComparison, TranslationKey> = {
  match: "comparisonMatch",
  partial: "comparisonPartial",
  unclear: "comparisonUnclear",
};

type ShiftFilter = "all" | CategoryKey;

const SHIFT_FILTER_OPTIONS = SHARED_SHIFT_OPTIONS;

interface AnalysisResult {
  plainLanguageMeaning: string;
  operationalEffect: string;
}

const Index = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [classified, setClassified] = useState<ClassifiedResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [uiLang, setUiLang] = useState<UILanguage>(getStoredUILanguage);
  const [shiftFilter, setShiftFilter] = useState<ShiftFilter>("all");
  const resultsRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  // Evidence retrieval state
  const [evidence, setEvidence] = useState<EvidenceResult | null>(null);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [userRequestedEvidence, setUserRequestedEvidence] = useState(false);

  const isRtl = isRtlLanguage(uiLang);

  const handleUILangChange = (lang: UILanguage) => {
    setUiLang(lang);
    storeUILanguage(lang);
  };

  const retrieveEvidence = async (
    sourceText: string,
    classifiedResults: ClassifiedResult[],
    userRequested: boolean
  ) => {
    const trigger = shouldRetrieveEvidence(sourceText, classifiedResults, userRequested);
    if (!trigger.shouldRetrieve) {
      setEvidence({
        claims: classifiedResults.flatMap((g) =>
          g.matches.map((m) => ({
            claim: m,
            category: g.category,
            sourceClass: "general_reference" as const,
            evidenceStatus: "not_required" as const,
            sources: [],
            evidenceTrace: [],
          }))
        ),
        retrievalTriggered: false,
        triggerReason: trigger.reason,
      });
      return;
    }

    setEvidenceLoading(true);
    try {
      const claims = extractVerifiableClaims(sourceText, classifiedResults);
      if (claims.length === 0) {
        setEvidence({
          claims: [],
          retrievalTriggered: true,
          triggerReason: trigger.reason,
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke("retrieve-evidence", {
        body: { claims, sourceText: sourceText.slice(0, 3000) },
      });

      if (error || data?.error) {
        console.error("Evidence retrieval error:", error || data?.error);
        toast.error("Evidence retrieval failed.");
        return;
      }

      const claimResults: any[] = data?.claimResults || [];
      const evidenceClaims: ClaimEvidence[] = claims.map((c, i) => {
        const r = claimResults.find((cr: any) => cr.claimIndex === i);
        return {
          claim: c.claim,
          category: c.category,
          sourceClass: c.sourceClass,
          evidenceStatus: r?.evidenceStatus || "not_found",
          sources: (r?.sources || []).map((s: any) => ({
            sourceName: s.sourceName || "",
            link: s.link || "",
            snippet: s.snippet || "",
            section: s.section,
            timestamp: s.timestamp,
          })),
          evidenceTrace: r?.sources?.map((s: any) => ({
            claimText: c.claim,
            retrievedSnippet: s.snippet || "",
            comparison: r?.comparison || "unclear",
          })) || [],
        };
      });

      setEvidence({
        claims: evidenceClaims,
        retrievalTriggered: true,
        triggerReason: trigger.reason,
      });
    } finally {
      setEvidenceLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error(t(uiLang, "pasteTextPlaceholder"));
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const currentRequestId = ++requestIdRef.current;

    setLoading(true);
    setResult(null);
    setClassified(null);
    setEvidence(null);
    setShiftFilter("all");
    setUserRequestedEvidence(false);

    // Run local classification immediately
    const scopeResults = classifySourceText(text);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-text", {
        body: { text, language: langToCode(uiLang) },
      });

      if (currentRequestId !== requestIdRef.current) return;

      if (error) {
        console.error("Edge function error:", error);
        toast.error(t(uiLang, "analysisFailed"));
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setResult(data as AnalysisResult);
      setClassified(scopeResults);

      // Conditionally trigger evidence retrieval
      retrieveEvidence(text, scopeResults, false);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleVerifySources = () => {
    if (classified && text.trim()) {
      setUserRequestedEvidence(true);
      retrieveEvidence(text, classified, true);
    }
  };

  const handleClear = () => {
    requestIdRef.current++;
    abortRef.current?.abort();
    abortRef.current = null;
    setText("");
    setResult(null);
    setClassified(null);
    setEvidence(null);
    setLoading(false);
    setEvidenceLoading(false);
    setShiftFilter("all");
    setUserRequestedEvidence(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredClassified = useMemo(() => {
    if (!classified) return null;
    if (shiftFilter === "all") return classified;
    return classified.filter((g) => g.category === shiftFilter);
  }, [classified, shiftFilter]);

  const showMeaning = true;
  const showEffect = true;

  // Ctrl+Enter shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleAnalyze();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [text, uiLang]);

  // iOS resize fix
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
    }
  }, []);

  const buildExportText = () => {
    const parts: string[] = [];
    if (result && showMeaning) {
      parts.push(`## ${t(uiLang, "plainLanguageMeaning")}`, "", result.plainLanguageMeaning, "");
    }
    if (result && showEffect) {
      parts.push(`## ${t(uiLang, "operationalEffect")}`, "", result.operationalEffect, "");
    }
    if (filteredClassified && filteredClassified.length > 0) {
      parts.push(`## ${t(uiLang, "detectedChanges")}`, "");
      for (const group of filteredClassified) {
        const label = t(uiLang, CATEGORY_TRANSLATION_KEY[group.category]);
        const explanation = t(uiLang, CATEGORY_EXPLANATION_KEY[group.category]);
        parts.push(`### ${label}`);
        parts.push(...group.matches.map((m) => `- ${m}`));
        parts.push(`  ${explanation}`);
        parts.push("");
      }
    }
    // Evidence section
    if (evidence && evidence.retrievalTriggered && evidence.claims.length > 0) {
      parts.push(`## ${t(uiLang, "evidenceRetrieval")}`, "");
      for (const claim of evidence.claims) {
        parts.push(`### ${claim.claim}`);
        parts.push(`Status: ${claim.evidenceStatus}`);
        for (const src of claim.sources) {
          parts.push(`- ${t(uiLang, "evidenceSource")}: ${src.sourceName}`);
          if (src.link) parts.push(`  Link: ${src.link}`);
          parts.push(`  ${t(uiLang, "evidenceSnippet")}: "${src.snippet}"`);
          if (src.section) parts.push(`  ${t(uiLang, "evidenceSection")}: ${src.section}`);
          if (src.timestamp) parts.push(`  Date: ${src.timestamp}`);
        }
        parts.push("");
      }
    }
    return parts.join("\n");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildExportText()).then(() => toast.success(t(uiLang, "copied")));
  };

  const handleExport = () => {
    const content = buildExportText();
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meaning-buddy-analysis.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const comparisonBadgeClass = (comp: EvidenceComparison) => {
    switch (comp) {
      case "match":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
      case "unclear":
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "found":
        return "✓";
      case "not_found":
        return "✗";
      case "not_required":
        return "—";
      default:
        return "?";
    }
  };

  return (
    <div className={`min-h-dvh bg-background p-4 md:p-10 max-w-3xl mx-auto ${isRtl ? "text-right" : ""}`} dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="mb-6 space-y-1">
        <h1 className="font-semibold tracking-tight font-mono text-lg md:text-xl text-foreground-strong">
          {t(uiLang, "meaningTranslator")}
        </h1>
        <p className="text-foreground-strong text-sm">
          {t(uiLang, "meaningTranslatorDesc")}
        </p>
      </header>

      {/* Single Input */}
      <div className="mb-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-strong mb-2">
          {t(uiLang, "pasteText")}
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-52 md:h-72 p-4 rounded-lg border border-border bg-card text-card-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder={t(uiLang, "pasteTextPlaceholder")}
          dir={isRtl ? "rtl" : "ltr"}
        />
      </div>

      {/* Control group — stacked, matching Example section */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
            {t(uiLang, "shift")}
          </label>
          <Select value={shiftFilter} onValueChange={(v) => setShiftFilter(v as ShiftFilter)}>
            <SelectTrigger className="w-full bg-card text-foreground text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SHIFT_FILTER_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
            {t(uiLang, "outputLanguage")}
          </label>
          <Select value={uiLang} onValueChange={(v) => handleUILangChange(v as UILanguage)}>
            <SelectTrigger className="w-full bg-card text-foreground text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UI_LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Analyze & Clear Buttons */}
      <div className="flex justify-center gap-3 mb-10">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t(uiLang, "analyzing") : t(uiLang, "analyze")}
          <kbd className="ml-2 hidden sm:inline-block text-[10px] opacity-60 font-mono bg-primary-foreground/10 px-1.5 py-0.5 rounded border border-primary-foreground/20">
            {/Mac|iPhone|iPad|iPod/.test(navigator.userAgent) ? "⌘ ↵" : "Ctrl ↵"}
          </kbd>
        </button>
        <button
          onClick={handleClear}
          className="px-8 py-3 rounded-lg border border-input bg-background text-foreground font-medium text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {t(uiLang, "clear")}
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6 animate-pulse">
          <div className="rounded-lg border border-border bg-card p-5 space-y-3">
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-3/4 rounded bg-muted" />
            <div className="h-3 w-5/6 rounded bg-muted" />
          </div>
          <div className="rounded-lg border border-border bg-card p-5 space-y-3">
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-2/3 rounded bg-muted" />
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && result && (
        <div ref={resultsRef} className="space-y-4 scroll-mt-4">
          {/* Plain Language Meaning + Operational Effect */}
          <div className="rounded-lg border border-border bg-card p-5 font-mono text-sm space-y-4">
            {showMeaning && (
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                  {t(uiLang, "plainLanguageMeaning")}
                </span>
                <span className="text-foreground leading-[1.8] block">
                  {result.plainLanguageMeaning}
                </span>
              </div>
            )}
            {showMeaning && showEffect && <div className="border-t border-border" />}
            {showEffect && (
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                  {t(uiLang, "operationalEffect")}
                </span>
                <span className="text-foreground leading-[1.8] block">
                  {result.operationalEffect}
                </span>
              </div>
            )}
          </div>

          {/* Detected Changes */}
          {classified && classified.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-5">

              {/* Detected changes label */}
              <span className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                {t(uiLang, "detectedChanges")}
              </span>

              {/* Category chips */}
              <div className="flex flex-wrap gap-2 mb-3">
                {(filteredClassified ?? []).map((group) => (
                  <span
                    key={group.category}
                    className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-changed-bg text-changed border border-changed-border"
                  >
                    {t(uiLang, CATEGORY_TRANSLATION_KEY[group.category])}
                  </span>
                ))}
              </div>

              {/* Structured change list */}
              <ul className="text-sm text-foreground space-y-2.5">
                {(filteredClassified ?? []).map((group) =>
                  group.matches.map((match, idx) => (
                    <li key={`${group.category}-${idx}`} className="flex items-start gap-2">
                      <span className="text-changed mt-0.5">•</span>
                      <span>
                        <span className="font-medium">{t(uiLang, CATEGORY_TRANSLATION_KEY[group.category])}</span> — {match}
                        <br />
                        <span className="text-muted-foreground text-xs">
                          {t(uiLang, CATEGORY_EXPLANATION_KEY[group.category])}
                        </span>
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}

          {classified && classified.length === 0 && (
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">{t(uiLang, "noChangesDetected")}</p>
            </div>
          )}

          {/* Evidence Verification Section */}
          {true && (
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">
                  {t(uiLang, "evidenceRetrieval")}
                </span>
                {/* Manual verify button — shown when retrieval wasn't auto-triggered */}
                {!evidence?.retrievalTriggered && !evidenceLoading && classified && classified.length > 0 && (
                  <button
                    onClick={handleVerifySources}
                    className="text-xs font-medium px-3 py-1.5 rounded-md border border-border bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
                  >
                    {t(uiLang, "verifySource")}
                  </button>
                )}
              </div>

              {/* Evidence loading */}
              {evidenceLoading && (
                <div className="space-y-3 animate-pulse">
                  <div className="h-3 w-2/3 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                  <div className="h-3 w-3/4 rounded bg-muted" />
                  <p className="text-xs text-muted-foreground mt-2">{t(uiLang, "retrievingEvidence")}</p>
                </div>
              )}

              {/* Evidence not triggered */}
              {!evidenceLoading && evidence && !evidence.retrievalTriggered && (
                <p className="text-xs text-muted-foreground">
                  {t(uiLang, "evidenceNotRequired")}
                </p>
              )}

              {/* Evidence results */}
              {!evidenceLoading && evidence && evidence.retrievalTriggered && evidence.claims.length > 0 && (
                <ul className="space-y-4">
                  {evidence.claims.map((claim, i) => (
                    <li key={i} className="border-t border-border pt-3 first:border-t-0 first:pt-0">
                      {/* Claim text */}
                      <div className="flex items-start gap-2 mb-2">
                        <span className={`text-xs font-mono mt-0.5 ${
                          claim.evidenceStatus === "found" ? "text-green-600 dark:text-green-400" :
                          claim.evidenceStatus === "not_found" ? "text-destructive" : "text-muted-foreground"
                        }`}>
                          {statusIcon(claim.evidenceStatus)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground break-words">
                            {claim.claim}
                          </p>
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            {t(uiLang, CATEGORY_TRANSLATION_KEY[claim.category])} · {claim.sourceClass.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>

                      {/* Sources */}
                      {claim.evidenceStatus === "found" && claim.sources.length > 0 && (
                        <div className="ml-5 space-y-2">
                          {claim.sources.map((src, si) => (
                            <div key={si} className="rounded border border-border bg-muted/50 p-3 text-xs space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-foreground">{src.sourceName}</span>
                                {src.section && (
                                  <span className="text-muted-foreground">· {t(uiLang, "evidenceSection")}: {src.section}</span>
                                )}
                                {src.timestamp && (
                                  <span className="text-muted-foreground">· {src.timestamp}</span>
                                )}
                              </div>
                              {src.link && (
                                <a
                                  href={src.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline break-all block"
                                >
                                  {src.link}
                                </a>
                              )}
                              <div>
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-0.5">
                                  {t(uiLang, "evidenceSnippet")}
                                </span>
                                <blockquote className="border-l-2 border-primary/30 pl-2 text-foreground italic break-words">
                                  "{src.snippet}"
                                </blockquote>
                              </div>
                            </div>
                          ))}
                          {/* Comparison badge */}
                          {claim.evidenceTrace.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                {t(uiLang, "evidenceComparison")}:
                              </span>
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${comparisonBadgeClass(claim.evidenceTrace[0].comparison)}`}>
                                {t(uiLang, COMPARISON_KEY[claim.evidenceTrace[0].comparison])}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Not found */}
                      {claim.evidenceStatus === "not_found" && (
                        <p className="ml-5 text-xs text-muted-foreground italic">
                          {t(uiLang, "noSourceFound")}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {/* No claims to verify */}
              {!evidenceLoading && evidence && evidence.retrievalTriggered && evidence.claims.length === 0 && (
                <p className="text-xs text-muted-foreground">{t(uiLang, "noChangesDetected")}</p>
              )}
            </div>
          )}

          {/* Copy + Export */}
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="h-9 px-4 text-xs font-medium rounded-md border border-border bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
            >
              {t(uiLang, "copyResults")}
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="h-9 px-4 text-xs font-medium rounded-md border border-border bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
            >
              {t(uiLang, "exportResults")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
