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
import { t, UI_LANGUAGES, getStoredUILanguage, storeUILanguage, type UILanguage } from "@/lib/uiTranslations";
import { classifySourceText, type ClassifiedResult } from "@/lib/classifier";
import { type CategoryKey } from "@/lib/taxonomy";

const CATEGORY_TRANSLATION_KEY: Record<CategoryKey, Parameters<typeof t>[1]> = {
  modality_shift: "modalityShift",
  actor_power_shift: "actorPowerShift",
  scope_change: "scopeChange",
  threshold_shift: "thresholdShift",
  action_domain_shift: "actionDomainShift",
  obligation_removal: "obligationRemoval",
};

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
  const resultsRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

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

    // Run local classification immediately
    const scopeResults = classifySourceText(text);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-text", {
        body: { text },
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  const buildCopyText = () => {
    const parts: string[] = [];
    if (result) {
      parts.push(`## ${t(uiLang, "plainLanguageMeaning")}`, result.plainLanguageMeaning, "");
      parts.push(`## ${t(uiLang, "operationalEffect")}`, result.operationalEffect, "");
    }
    if (classified && classified.length > 0) {
      parts.push(`## ${t(uiLang, "detectedChanges")}`, "");
      for (const group of classified) {
        const label = t(uiLang, CATEGORY_TRANSLATION_KEY[group.category]);
        parts.push(`### ${label}`);
        parts.push(...group.matches.map((m) => `- ${m}`));
        parts.push("");
      }
    }
    return parts.join("\n");
  };

  return (
    <div className="min-h-dvh bg-background p-4 md:p-10 max-w-3xl mx-auto">
      {/* Header */}
      <header className="mb-6 space-y-1">
        <h1 className="font-semibold tracking-tight font-mono text-lg md:text-xl text-foreground-strong">
          {t(uiLang, "meaningTranslator")}
        </h1>
        <p className="text-foreground-strong text-sm">
          {t(uiLang, "meaningTranslatorDesc")}
        </p>

        {/* Language selector */}
        <div className="mt-3">
          <div className="w-64">
            <Select value={uiLang} onValueChange={(v) => handleUILangChange(v as UILanguage)}>
              <SelectTrigger className="h-9 text-xs font-medium bg-secondary text-secondary-foreground border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UI_LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang} className="text-xs">
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
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
        />
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
          <div className="rounded-lg border border-border bg-card p-5 space-y-3">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && result && (
        <div ref={resultsRef} className="space-y-6 scroll-mt-4">
          {/* Plain Language Meaning */}
          <div className="rounded-lg border border-border bg-card p-5 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground-strong">
              {t(uiLang, "plainLanguageMeaning")}
            </h2>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {result.plainLanguageMeaning}
            </p>
          </div>

          {/* Operational Effect */}
          <div className="rounded-lg border border-border bg-card p-5 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground-strong">
              {t(uiLang, "operationalEffect")}
            </h2>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {result.operationalEffect}
            </p>
          </div>

          {/* Grouped Taxonomy Scope Breakdown */}
          {classified && classified.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground-strong">
                {t(uiLang, "detectedChanges")}
              </h2>
              {classified.map((group) => (
                <div key={group.category} className="rounded-lg border border-border bg-card p-5 space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground-strong">
                    {t(uiLang, CATEGORY_TRANSLATION_KEY[group.category])}
                  </h3>
                  <ul className="space-y-1.5">
                    {group.matches.map((match, idx) => (
                      <li key={idx} className="text-sm text-foreground leading-relaxed font-mono">
                        {match}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Copy button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(buildCopyText()).then(() => toast.success("Copied to clipboard"));
              }}
              className="h-9 px-4 text-xs font-medium rounded-md border border-border bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
            >
              {t(uiLang, "copyResults")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
