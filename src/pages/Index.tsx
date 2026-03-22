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
import { classifySourceText, type ClassifiedResult } from "@/lib/classifier";
import { type CategoryKey } from "@/lib/taxonomy";

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

type ShiftFilter = "all" | CategoryKey;
type ScopeMode = "full" | "meaning_only" | "operational_effect_only";

const SHIFT_OPTIONS: { value: ShiftFilter; key: TranslationKey | null }[] = [
  { value: "all", key: null },
  { value: "modality_shift", key: "modalityShift" },
  { value: "scope_change", key: "scopeChange" },
  { value: "threshold_shift", key: "thresholdShift" },
  { value: "actor_power_shift", key: "actorPowerShift" },
  { value: "action_domain_shift", key: "actionDomainShift" },
  { value: "obligation_removal", key: "obligationRemoval" },
];

const SCOPE_OPTIONS: { value: ScopeMode; key: TranslationKey }[] = [
  { value: "full", key: "scopeFull" },
  { value: "meaning_only", key: "scopeMeaningOnly" },
  { value: "operational_effect_only", key: "scopeOperationalOnly" },
];

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
  const [scope, setScope] = useState<ScopeMode>("full");
  const resultsRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const isRtl = isRtlLanguage(uiLang);

  const handleUILangChange = (lang: UILanguage) => {
    setUiLang(lang);
    storeUILanguage(lang);
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
    setShiftFilter("all");

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

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleClear = () => {
    requestIdRef.current++;
    abortRef.current?.abort();
    abortRef.current = null;
    setText("");
    setResult(null);
    setClassified(null);
    setLoading(false);
    setShiftFilter("all");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredClassified = useMemo(() => {
    if (!classified) return null;
    if (shiftFilter === "all") return classified;
    return classified.filter((g) => g.category === shiftFilter);
  }, [classified, shiftFilter]);

  const showMeaning = scope === "full" || scope === "meaning_only";
  const showEffect = scope === "full" || scope === "operational_effect_only";
  const showScope = scope === "full";

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
    if (showScope && filteredClassified && filteredClassified.length > 0) {
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
            {t(uiLang, "scopeLabel")}
          </label>
          <Select value={scope} onValueChange={(v) => setScope(v as ScopeMode)}>
            <SelectTrigger className="w-full bg-card text-foreground text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCOPE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {t(uiLang, o.key)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
            {t(uiLang, "explanationLanguage")}
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

          {/* Detected Changes — only in full scope mode */}
          {showScope && classified && classified.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-5">
              {/* Shift filter */}
              <div className="mb-4 max-w-xs">
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                  {t(uiLang, "shift")}
                </label>
                <Select value={shiftFilter} onValueChange={(v) => setShiftFilter(v as ShiftFilter)}>
                  <SelectTrigger className="w-full bg-card text-foreground text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIFT_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.key ? t(uiLang, o.key) : t(uiLang, "allShifts")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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

          {showScope && classified && classified.length === 0 && (
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">{t(uiLang, "noChangesDetected")}</p>
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
