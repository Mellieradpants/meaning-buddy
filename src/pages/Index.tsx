import { useState, useEffect, useRef, useMemo, useCallback } from "react";
// ThemeToggle removed — light-only interface
import { supabase } from "@/integrations/supabase/client";
import { extractPageFromEvidence } from "@/lib/pageParser";
import { sanitizeEvidence } from "@/lib/sanitize";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORIES,
  type CategoryKey,
} from "@/lib/taxonomy";
import SummaryTable from "@/components/SummaryTable";
import ChangeSummary from "@/components/ChangeSummary";
import TranslationStressTest from "@/components/TranslationStressTest";
import {
  useEffectTranslation,
  EFFECT_LANGUAGES,
  type EffectLanguage,
} from "@/hooks/useEffectTranslation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CategoryResult {
  category: CategoryKey;
  status: "changed" | "unchanged";
  label: string;
  originalEvidence: string;
  revisedEvidence: string;
  operationalEffect?: string;
}

interface DiffResult {
  overallVerdict: "meaningful_change" | "no_meaningful_change";
  categories: CategoryResult[];
}

const SCOPE_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All shifts" },
  ...(Object.entries(CATEGORIES) as [CategoryKey, string][]).map(([key, label]) => ({
    value: key,
    label,
  })),
];

const Index = () => {
  const [original, setOriginal] = useState("");
  const [revised, setRevised] = useState("");
  const [result, setResult] = useState<DiffResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [scopeFilter, setScopeFilter] = useState<string>("all");
  const [devMode, setDevMode] = useState(() => {
    try { return localStorage.getItem("devModeEnabled") === "true"; } catch { return false; }
  });
  const inputRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const handleCompareRef = useRef<() => void>();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleCompareRef.current?.();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const effectStrings = useMemo(() => {
    if (!result) return [];
    return result.categories
      .filter((c) => c.status === "changed" && c.operationalEffect && c.operationalEffect !== "No change detected.")
      .map((c) => c.operationalEffect!);
  }, [result]);

  const { language, setLanguage, getTranslated, translating, error: translationError, isRtl } =
    useEffectTranslation(effectStrings);

  const effectIndexMap = useMemo(() => {
    const map = new Map<number, number>();
    if (!result) return map;
    let effectIdx = 0;
    result.categories.forEach((c, i) => {
      if (c.status === "changed" && c.operationalEffect && c.operationalEffect !== "No change detected.") {
        map.set(i, effectIdx++);
      }
    });
    return map;
  }, [result]);

  const getDisplayEffect = (catIndex: number, original: string): string => {
    const effectIdx = effectIndexMap.get(catIndex);
    if (effectIdx === undefined) return original;
    return getTranslated(effectIdx, original);
  };

  const handleCompare = async () => {
    if (!original.trim() || !revised.trim()) {
      toast.error("Please enter text in both fields.");
      return;
    }

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
      let parsedResult: DiffResult;
      if (raw.categories) {
        parsedResult = raw as DiffResult;
      } else if (raw.findings) {
        parsedResult = {
          overallVerdict: raw.overallVerdict,
          categories: raw.findings.map((f: any) => ({
            category: f.type || "scope_change",
            status: f.type === "no_change" ? "unchanged" : "changed",
            label: f.summary || f.type,
            originalEvidence: f.originalSnippet || "",
            revisedEvidence: f.revisedSnippet || "",
          })),
        };
      } else {
        parsedResult = raw as DiffResult;
      }

      setResult(parsedResult);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  handleCompareRef.current = handleCompare;

  const handleClear = () => {
    requestIdRef.current++;
    abortRef.current?.abort();
    abortRef.current = null;

    setOriginal("");
    setRevised("");
    setResult(null);
    setLoading(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Apply scope filter to results
  const allChanged = result?.categories.filter(c => c.status === "changed") || [];
  const allUnchanged = result?.categories.filter(c => c.status === "unchanged") || [];

  const changedCategories = scopeFilter === "all"
    ? allChanged
    : allChanged.filter(c => c.category === scopeFilter);
  const unchangedCategories = scopeFilter === "all"
    ? allUnchanged
    : allUnchanged.filter(c => c.category === scopeFilter);

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    }
  }, []);

  return (
    <div className="min-h-dvh bg-background p-4 md:p-10 max-w-5xl mx-auto">

      {/* Hero Section — compact technical header */}
      <header className="mb-6 space-y-1">
        <h1 className="font-semibold tracking-tight font-mono text-lg md:text-xl text-foreground-strong">
          Structural Language Comparison
        </h1>
        <p className="text-foreground-strong text-sm">
          Compare two versions of text to detect structural wording changes and their operational consequences.
        </p>
        <p className="text-muted-foreground text-xs">
          Operational explanations can be translated into multiple languages. Evidence remains verbatim.
        </p>

        {/* Scope + Language controls */}
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <div className="w-64">
            <Select value={scopeFilter} onValueChange={setScopeFilter}>
              <SelectTrigger className="h-9 text-xs font-medium bg-secondary text-secondary-foreground border-border">
                <SelectValue placeholder="All shifts" />
              </SelectTrigger>
              <SelectContent>
                {SCOPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value} className="text-xs">
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-64">
            <Select value={language} onValueChange={(v) => setLanguage(v as EffectLanguage)}>
              <SelectTrigger className="h-9 text-xs font-medium bg-secondary text-secondary-foreground border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EFFECT_LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang} className="text-xs">
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {translating && (
            <span className="text-xs text-muted-foreground flex items-center gap-0.5 self-center">
              <span className="animate-bounce [animation-delay:0ms]">·</span>
              <span className="animate-bounce [animation-delay:150ms]">·</span>
              <span className="animate-bounce [animation-delay:300ms]">·</span>
            </span>
          )}
        </div>
      </header>

      {/* Input Section */}
      <div ref={inputRef} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-strong mb-2">
            Original (earlier version)
          </label>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            className="w-full h-52 md:h-72 p-4 rounded-lg border border-border bg-card text-card-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Paste the earlier version here…"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-strong mb-2">
            Revised (updated version)
          </label>
          <textarea
            value={revised}
            onChange={(e) => setRevised(e.target.value)}
            className="w-full h-52 md:h-72 p-4 rounded-lg border border-border bg-card text-card-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Paste the updated version here…"
          />
        </div>
      </div>

      {/* Compare & Clear Buttons */}
      <div className="flex justify-center gap-3 mb-10">
        <button
          onClick={handleCompare}
          disabled={loading}
          className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Comparing…" : "Compare"}
          <kbd className="ml-2 hidden sm:inline-block text-[10px] opacity-60 font-mono bg-primary-foreground/10 px-1.5 py-0.5 rounded border border-primary-foreground/20">
            {/Mac|iPhone|iPad|iPod/.test(navigator.userAgent) ? "⌘ ↵" : "Ctrl ↵"}
          </kbd>
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
        <div id="results" ref={resultsRef} className="space-y-6 scroll-mt-4">

          {/* Results Control Bar */}
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Verdict Badge */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold border ${
                result.overallVerdict === "meaningful_change"
                  ? "bg-changed-bg text-changed border-changed-border"
                  : "bg-unchanged-bg text-unchanged border-border"
              }`}
            >
              <span className="text-base">
                {result.overallVerdict === "meaningful_change" ? "⚠" : "✓"}
              </span>
              {result.overallVerdict === "meaningful_change"
                ? "Structural Change Detected"
                : "No Meaningful Change"}
            </div>

            {/* Controls: Copy + Export */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Copy results */}
              <button
                type="button"
                onClick={() => {
                  const lines = changedCategories.map((cat) => {
                    const gi = result.categories.indexOf(cat);
                    const eff = cat.operationalEffect && cat.operationalEffect !== "No change detected."
                      ? getDisplayEffect(gi, cat.operationalEffect)
                      : "";
                    return [
                      `## ${CATEGORIES[cat.category] || cat.category}`,
                      `**Original:** ${sanitizeEvidence(cat.originalEvidence)}`,
                      `**Revised:** ${sanitizeEvidence(cat.revisedEvidence)}`,
                      eff ? `**Operational Effect:** ${eff}` : "",
                      "",
                    ].filter(Boolean).join("\n");
                  });
                  navigator.clipboard.writeText(lines.join("\n")).then(() => toast.success("Copied to clipboard"));
                }}
                className="h-8 px-3 text-xs font-medium rounded-md border border-border bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
              >
                Copy
              </button>

              {/* Export results */}
              <button
                type="button"
                onClick={() => {
                  const lines = changedCategories.map((cat) => {
                    const gi = result.categories.indexOf(cat);
                    const eff = cat.operationalEffect && cat.operationalEffect !== "No change detected."
                      ? getDisplayEffect(gi, cat.operationalEffect)
                      : "";
                    return [
                      `## ${CATEGORIES[cat.category] || cat.category}`,
                      `**Original:** ${sanitizeEvidence(cat.originalEvidence)}`,
                      `**Revised:** ${sanitizeEvidence(cat.revisedEvidence)}`,
                      eff ? `**Operational Effect:** ${eff}` : "",
                      "",
                    ].filter(Boolean).join("\n");
                  });
                  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "comparison-results.txt";
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success("Exported");
                }}
                className="h-8 px-3 text-xs font-medium rounded-md border border-border bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
              >
                Export
              </button>
            </div>
          </div>

          {/* No changes message */}
          {changedCategories.length === 0 && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {scopeFilter === "all"
                ? "No substantive structural changes detected."
                : `No changes detected for ${CATEGORIES[scopeFilter as CategoryKey] || scopeFilter}.`}
            </p>
          )}

          {/* Category Chips */}
          {result.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {result.categories
                .filter(cat => scopeFilter === "all" || cat.category === scopeFilter)
                .map((cat, i) => (
                <span
                  key={i}
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    cat.status === "changed"
                      ? "bg-changed-bg text-changed border-changed-border"
                      : "bg-unchanged-bg text-unchanged border-border"
                  }`}
                >
                  {CATEGORIES[cat.category] || cat.category}
                </span>
              ))}
            </div>
          )}

          {/* Changed Categories — mirror landing page card structure */}
          {changedCategories.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground-strong mb-4">
                Changes Detected ({changedCategories.length})
              </h2>
              <div className="space-y-4">
                {changedCategories.map((cat, i) => {
                  const globalIndex = result.categories.indexOf(cat);
                  const effectText = cat.operationalEffect && cat.operationalEffect !== "No change detected."
                    ? getDisplayEffect(globalIndex, cat.operationalEffect)
                    : null;

                  return (
                    <div
                      key={i}
                      className="rounded-lg border border-border bg-card p-5 font-mono text-sm space-y-4"
                    >
                      {/* Original evidence */}
                      <div>
                        <span className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                          Original
                        </span>
                        <span className="text-foreground leading-[1.8] block">
                          {sanitizeEvidence(cat.originalEvidence)}
                        </span>
                      </div>

                      {/* Revised evidence */}
                      <div className="border-t border-border pt-4">
                        <span className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                          Revised
                        </span>
                        <span className="text-foreground leading-[1.8] block">
                          {sanitizeEvidence(cat.revisedEvidence)}
                        </span>
                      </div>

                      {/* Operational Effect */}
                      {effectText && (
                        <div className="border-t border-border pt-4">
                          <span className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                            Operational Effect
                          </span>
                          <span
                            className="text-foreground leading-[1.8] block"
                            dir={isRtl ? "rtl" : "ltr"}
                            style={isRtl ? { textAlign: "right" } : undefined}
                          >
                            {effectText}
                          </span>
                        </div>
                      )}

                      {/* Detected changes / category chip */}
                      <div className="border-t border-border pt-4">
                        <span className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                          Detected changes
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-changed-bg text-changed border border-changed-border">
                            {CATEGORIES[cat.category] || cat.category}
                          </span>
                          <span className="text-xs font-sans text-muted-foreground">
                            {cat.label.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Change Summary (Markdown) */}
          {changedCategories.length > 0 && (
            <ChangeSummary
              categories={result.categories}
              originalText={original}
              revisedText={revised}
              getDisplayEffect={getDisplayEffect}
              isRtl={isRtl}
            />
          )}

          {/* Summary Table */}
          {changedCategories.length > 0 && (
            <SummaryTable
              categories={result.categories}
              getDisplayEffect={getDisplayEffect}
              isRtl={isRtl}
            />
          )}

          {/* Unchanged Categories */}
          {unchangedCategories.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground-strong mb-4">
                Unchanged ({unchangedCategories.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {unchangedCategories.map((cat, i) => (
                  <span
                    key={i}
                    className="inline-block px-3 py-1.5 rounded-full text-xs font-medium bg-unchanged-bg text-unchanged border border-border"
                  >
                    {CATEGORIES[cat.category] || cat.category}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* English verification check */}
      {result && language === "English" && (() => {
        const drifts: { catIndex: number; original: string; displayed: string }[] = [];
        result.categories.forEach((cat, i) => {
          if (cat.status === "changed" && cat.operationalEffect && cat.operationalEffect !== "No change detected.") {
            const displayed = getDisplayEffect(i, cat.operationalEffect);
            if (displayed !== cat.operationalEffect) {
              drifts.push({ catIndex: i, original: cat.operationalEffect, displayed });
            }
          }
        });
        if (!devMode) return null;
        return (
          <div className="mt-6">
            {drifts.length === 0 ? (
              <p className="text-xs text-muted-foreground">✅ English output verified: no translation drift.</p>
            ) : (
              <>
                <p className="text-xs text-destructive font-medium">⚠️ English output differs from original explanation.</p>
                <div className="mt-2 space-y-3">
                  {drifts.map((d, i) => (
                    <div key={i} className="rounded border border-border bg-muted/30 p-3 text-xs space-y-1 font-mono">
                      <p className="text-muted-foreground font-sans font-medium">Category index {d.catIndex}</p>
                      <p><span className="font-sans font-medium text-muted-foreground">Original:</span> {d.original}</p>
                      <p><span className="font-sans font-medium text-muted-foreground">Displayed:</span> {d.displayed}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      })()}

      {/* Developer Mode toggle + Stress Test — hidden from public view */}
      {devMode && (
        <div className="mt-10 border-t border-border/40 pt-6">
          <TranslationStressTest />
        </div>
      )}

      {/* Hidden dev mode toggle — only visible via localStorage */}
      <div className="mt-6 flex justify-center">
        <label className="inline-flex items-center gap-2 cursor-pointer select-none opacity-0 hover:opacity-100 transition-opacity">
          <input
            type="checkbox"
            checked={devMode}
            onChange={(e) => {
              const v = e.target.checked;
              setDevMode(v);
              try { localStorage.setItem("devModeEnabled", String(v)); } catch {}
            }}
            className="accent-primary w-3 h-3"
          />
          <span className="text-[10px] text-muted-foreground">Dev</span>
        </label>
      </div>
    </div>
  );
};

export default Index;
