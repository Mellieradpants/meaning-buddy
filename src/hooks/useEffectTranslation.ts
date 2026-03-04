import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const EFFECT_LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Russian",
  "Chinese (Simplified)",
  "Hebrew",
] as const;

export type EffectLanguage = (typeof EFFECT_LANGUAGES)[number];

const LS_KEY = "operationalEffectLanguage";

function getStoredLanguage(): EffectLanguage {
  try {
    const v = localStorage.getItem(LS_KEY);
    if (v && EFFECT_LANGUAGES.includes(v as EffectLanguage)) return v as EffectLanguage;
  } catch {}
  return "English";
}

// Cache: language -> effects-hash -> translations map
const translationCache = new Map<string, Map<string, string[]>>();

function effectsHash(effects: string[]): string {
  return effects.join("|||");
}

export function useEffectTranslation(effects: string[]) {
  const [language, setLanguageState] = useState<EffectLanguage>(getStoredLanguage);
  const [translations, setTranslations] = useState<Map<number, string>>(new Map());
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const setLanguage = useCallback((lang: EffectLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LS_KEY, lang);
    } catch {}
  }, []);

  useEffect(() => {
    if (language === "English" || effects.length === 0) {
      setTranslations(new Map());
      setError(false);
      return;
    }

    // Check cache
    const langCache = translationCache.get(language);
    const hash = effectsHash(effects);
    if (langCache?.has(hash)) {
      const cached = langCache.get(hash)!;
      const map = new Map<number, string>();
      cached.forEach((t, i) => map.set(i, t));
      setTranslations(map);
      setError(false);
      return;
    }

    // Translate
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setTranslating(true);
    setError(false);

    (async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("translate-effect", {
          body: { effects, targetLanguage: language },
        });

        if (controller.signal.aborted) return;

        if (fnError || data?.error) {
          console.error("Translation error:", fnError || data?.error);
          setError(true);
          setTranslations(new Map());
          toast.info("Translation unavailable. Showing English.");
          return;
        }

        const translated: string[] = data.translations;
        // Cache
        if (!translationCache.has(language)) {
          translationCache.set(language, new Map());
        }
        translationCache.get(language)!.set(hash, translated);

        const map = new Map<number, string>();
        translated.forEach((t, i) => map.set(i, t));
        setTranslations(map);
      } catch (e) {
        if (controller.signal.aborted) return;
        console.error("Translation fetch error:", e);
        setError(true);
        setTranslations(new Map());
        toast.info("Translation unavailable. Showing English.");
      } finally {
        if (!controller.signal.aborted) setTranslating(false);
      }
    })();

    return () => controller.abort();
  }, [language, effects]);

  const getTranslated = useCallback(
    (index: number, original: string): string => {
      if (language === "English") return original;
      return translations.get(index) ?? original;
    },
    [language, translations]
  );

  const isRtl = language === "Hebrew";

  return { language, setLanguage, getTranslated, translating, error, isRtl };
}
