export const UI_LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Russian",
  "Chinese (Simplified)",
  "Hebrew",
] as const;

export type UILanguage = (typeof UI_LANGUAGES)[number];

const LS_KEY = "meaningbuddy_language";

export function getStoredUILanguage(): UILanguage {
  try {
    const v = localStorage.getItem(LS_KEY);
    if (v && UI_LANGUAGES.includes(v as UILanguage)) return v as UILanguage;
  } catch {}
  return "English";
}

export function storeUILanguage(lang: UILanguage): void {
  try {
    localStorage.setItem(LS_KEY, lang);
  } catch {}
}

type TranslationKey =
  | "meaningTranslator"
  | "meaningTranslatorDesc"
  | "operationalEffect"
  | "plainLanguageMeaning"
  | "pasteText"
  | "pasteTextPlaceholder"
  | "analyze"
  | "analyzing"
  | "analysisFailed"
  | "copyResults"
  | "clear";

const translations: Record<TranslationKey, Record<UILanguage, string>> = {
  meaningTranslator: {
    English: "Meaning Translator",
    Spanish: "Traductor de Significado",
    French: "Traducteur de Sens",
    German: "Bedeutungsübersetzer",
    Russian: "Переводчик смысла",
    "Chinese (Simplified)": "含义翻译器",
    Hebrew: "מתרגם משמעות",
  },
  meaningTranslatorDesc: {
    English: "Paste any text to get a plain-language explanation and its operational effect.",
    Spanish: "Pegue cualquier texto para obtener una explicación en lenguaje sencillo y su efecto operativo.",
    French: "Collez un texte pour obtenir une explication en langage simple et son effet opérationnel.",
    German: "Fügen Sie einen Text ein, um eine verständliche Erklärung und die operative Auswirkung zu erhalten.",
    Russian: "Вставьте текст, чтобы получить объяснение простым языком и его практический эффект.",
    "Chinese (Simplified)": "粘贴任何文本，获取通俗解释及其操作效果。",
    Hebrew: "הדביקו טקסט כדי לקבל הסבר בשפה פשוטה ואת ההשפעה התפעולית שלו.",
  },
  operationalEffect: {
    English: "Operational Effect",
    Spanish: "Efecto operativo",
    French: "Effet opérationnel",
    German: "Operative Auswirkung",
    Russian: "Операционный эффект",
    "Chinese (Simplified)": "操作效果",
    Hebrew: "השפעה תפעולית",
  },
  plainLanguageMeaning: {
    English: "Plain Language Meaning",
    Spanish: "Significado en lenguaje sencillo",
    French: "Signification en langage simple",
    German: "Bedeutung in einfacher Sprache",
    Russian: "Значение простым языком",
    "Chinese (Simplified)": "通俗含义",
    Hebrew: "משמעות בשפה פשוטה",
  },
  pasteText: {
    English: "Paste text",
    Spanish: "Pegar texto",
    French: "Coller le texte",
    German: "Text einfügen",
    Russian: "Вставить текст",
    "Chinese (Simplified)": "粘贴文本",
    Hebrew: "הדבק טקסט",
  },
  pasteTextPlaceholder: {
    English: "Paste your text here…",
    Spanish: "Pegue su texto aquí…",
    French: "Collez votre texte ici…",
    German: "Fügen Sie Ihren Text hier ein…",
    Russian: "Вставьте текст сюда…",
    "Chinese (Simplified)": "在此粘贴文本…",
    Hebrew: "…הדביקו את הטקסט כאן",
  },
  analyze: {
    English: "Analyze",
    Spanish: "Analizar",
    French: "Analyser",
    German: "Analysieren",
    Russian: "Анализировать",
    "Chinese (Simplified)": "分析",
    Hebrew: "ניתוח",
  },
  analyzing: {
    English: "Analyzing…",
    Spanish: "Analizando…",
    French: "Analyse en cours…",
    German: "Wird analysiert…",
    Russian: "Анализируется…",
    "Chinese (Simplified)": "分析中…",
    Hebrew: "…מנתח",
  },
  analysisFailed: {
    English: "Analysis failed. Please try again.",
    Spanish: "El análisis falló. Inténtelo de nuevo.",
    French: "L'analyse a échoué. Veuillez réessayer.",
    German: "Analyse fehlgeschlagen. Bitte versuchen Sie es erneut.",
    Russian: "Анализ не удался. Попробуйте снова.",
    "Chinese (Simplified)": "分析失败，请重试。",
    Hebrew: "הניתוח נכשל. נסו שוב.",
  },
  copyResults: {
    English: "Copy Results",
    Spanish: "Copiar resultados",
    French: "Copier les résultats",
    German: "Ergebnisse kopieren",
    Russian: "Копировать результаты",
    "Chinese (Simplified)": "复制结果",
    Hebrew: "העתק תוצאות",
  },
  clear: {
    English: "Clear",
    Spanish: "Borrar",
    French: "Effacer",
    German: "Löschen",
    Russian: "Очистить",
    "Chinese (Simplified)": "清除",
    Hebrew: "נקה",
  },
};

export function t(language: UILanguage, key: TranslationKey): string {
  return translations[key]?.[language] ?? translations[key]?.["English"] ?? key;
}
