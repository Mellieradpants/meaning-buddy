import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { t, UI_LANGUAGES, getStoredUILanguage, storeUILanguage, type UILanguage } from "@/lib/uiTranslations";
import { computeDiff } from "@/lib/diff";
import { classifyDiff, type ClassifiedResult } from "@/lib/classifier";
import { type CategoryKey } from "@/lib/taxonomy";

const CATEGORY_TRANSLATION_KEY: Record<CategoryKey, Parameters<typeof t>[1]> = {
  modality_shift: "modalityShift",
  actor_power_shift: "actorPowerShift",
  scope_change: "scopeChange",
  threshold_shift: "thresholdShift",
  action_domain_shift: "actionDomainShift",
  obligation_removal: "obligationRemoval",
};

const Index = () => {
  const [original, setOriginal] = useState("");
  const [revised, setRevised] = useState("");
  const [results, setResults] = useState<ClassifiedResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [uiLang, setUiLang] = useState<UILanguage>(getStoredUILanguage);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleUILangChange = (lang: UILanguage) => {
    setUiLang(lang);
    storeUILanguage(lang);
  };

  const handleCompare = () => {
    if (!original.trim() || !revised.trim()) {
      toast.error("Please enter both original and revised text.");
      return;
    }

    setLoading(true);
    setResults(null);

    // Run locally — no edge function needed
    setTimeout(() => {
      try {
        const diff = computeDiff(original, revised);
        const classified = classifyDiff(original, revised, diff);
        setResults(classified);

        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      } catch (err) {
        console.error("Classification error:", err);
        toast.error(t(uiLang, "analysisFailed"));
      } finally {
        setLoading(false);
      }
    }, 0);
  };

  const handleClear = () => {
    setOriginal("");
    setRevised("");
    setResults(null);
    setLoading(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Ctrl+Enter shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleCompare();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [original, revised, uiLang]);

  // iOS resize fix
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
    }
  }, []);

  const buildCopyText = () => {
    if (!results) return "";
    if (results.length === 0) return t(uiLang, "noChangesDetected");
    return results
      .map((r) => {
        const label = t(uiLang, CATEGORY_TRANSLATION_KEY[r.category]);
        return `## ${label}\n${r.matches.map((m) => `- ${m}`).join("\n")}`;
      })
      .join("\n\n");
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

      {/* Original Input */}
      <div className="mb-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-strong mb-2">
          {t(uiLang, "original")}
        </label>
        <textarea
          value={original}
          onChange={(e) => setOriginal(e.target.value)}
          className="w-full h-40 md:h-52 p-4 rounded-lg border border-border bg-card text-card-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder={t(uiLang, "pasteTextPlaceholder")}
        />
      </div>

      {/* Revised Input */}
      <div className="mb-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-strong mb-2">
          {t(uiLang, "revised")}
        </label>
        <textarea
          value={revised}
          onChange={(e) => setRevised(e.target.value)}
          className="w-full h-40 md:h-52 p-4 rounded-lg border border-border bg-card text-card-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder={t(uiLang, "pasteTextPlaceholder")}
        />
      </div>

      {/* Compare & Clear Buttons */}
      <div className="flex justify-center gap-3 mb-10">
        <button
          onClick={handleCompare}
          disabled={loading}
          className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t(uiLang, "comparing") : t(uiLang, "compare")}
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
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-5 space-y-3">
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-3/4 rounded bg-muted" />
            </div>
          ))}
        </div>
      )}

      {/* Results — grouped by taxonomy category */}
      {!loading && results !== null && (
        <div ref={resultsRef} className="space-y-4 scroll-mt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground-strong">
            {t(uiLang, "detectedChanges")}
          </h2>

          {results.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">{t(uiLang, "noChangesDetected")}</p>
            </div>
          ) : (
            results.map((group) => (
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
            ))
          )}

          {/* Copy button */}
          <div className="flex justify-center pt-2">
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
