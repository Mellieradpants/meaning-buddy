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
  | "changeSummary"
  | "operationalEffect"
  | "original"
  | "revised"
  | "analyze"
  | "analyzing"
  | "copyResults"
  | "copyAsMarkdown"
  | "exportResults"
  | "changesDetected"
  | "unchanged"
  | "detectedChanges"
  | "summaryTable"
  | "pageSection"
  | "category"
  | "status"
  | "originalSnippet"
  | "revisedSnippet"
  | "changed"
  | "effect"
  | "compare"
  | "comparing"
  | "clear";

const translations: Record<TranslationKey, Record<UILanguage, string>> = {
  changeSummary: {
    English: "Change Summary (Markdown)",
    Spanish: "Resumen de cambios (Markdown)",
    French: "Résumé des modifications (Markdown)",
    German: "Änderungsübersicht (Markdown)",
    Russian: "Сводка изменений (Markdown)",
    "Chinese (Simplified)": "变更摘要 (Markdown)",
    Hebrew: "סיכום שינויים (Markdown)",
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
  original: {
    English: "Original",
    Spanish: "Original",
    French: "Original",
    German: "Original",
    Russian: "Оригинал",
    "Chinese (Simplified)": "原文",
    Hebrew: "מקור",
  },
  revised: {
    English: "Revised",
    Spanish: "Revisado",
    French: "Révisé",
    German: "Überarbeitet",
    Russian: "Пересмотрено",
    "Chinese (Simplified)": "修订版",
    Hebrew: "מתוקן",
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
    English: "Analyzing",
    Spanish: "Analizando",
    French: "Analyse en cours",
    German: "Wird analysiert",
    Russian: "Анализируется",
    "Chinese (Simplified)": "分析中",
    Hebrew: "מנתח",
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
  copyAsMarkdown: {
    English: "Copy as Markdown",
    Spanish: "Copiar como Markdown",
    French: "Copier en Markdown",
    German: "Als Markdown kopieren",
    Russian: "Копировать как Markdown",
    "Chinese (Simplified)": "复制为 Markdown",
    Hebrew: "העתק כ-Markdown",
  },
  exportResults: {
    English: "Export",
    Spanish: "Exportar",
    French: "Exporter",
    German: "Exportieren",
    Russian: "Экспортировать",
    "Chinese (Simplified)": "导出",
    Hebrew: "ייצוא",
  },
  changesDetected: {
    English: "Changes Detected",
    Spanish: "Cambios detectados",
    French: "Modifications détectées",
    German: "Änderungen erkannt",
    Russian: "Обнаружены изменения",
    "Chinese (Simplified)": "检测到变更",
    Hebrew: "שינויים שזוהו",
  },
  unchanged: {
    English: "Unchanged",
    Spanish: "Sin cambios",
    French: "Inchangé",
    German: "Unverändert",
    Russian: "Без изменений",
    "Chinese (Simplified)": "未更改",
    Hebrew: "ללא שינוי",
  },
  detectedChanges: {
    English: "Detected changes",
    Spanish: "Cambios detectados",
    French: "Changements détectés",
    German: "Erkannte Änderungen",
    Russian: "Обнаруженные изменения",
    "Chinese (Simplified)": "检测到的变更",
    Hebrew: "שינויים שזוהו",
  },
  summaryTable: {
    English: "Summary Table of Changes",
    Spanish: "Tabla resumen de cambios",
    French: "Tableau récapitulatif des modifications",
    German: "Zusammenfassungstabelle der Änderungen",
    Russian: "Сводная таблица изменений",
    "Chinese (Simplified)": "变更汇总表",
    Hebrew: "טבלת סיכום שינויים",
  },
  pageSection: {
    English: "Page / Section",
    Spanish: "Página / Sección",
    French: "Page / Section",
    German: "Seite / Abschnitt",
    Russian: "Страница / Раздел",
    "Chinese (Simplified)": "页面 / 章节",
    Hebrew: "עמוד / סעיף",
  },
  category: {
    English: "Category",
    Spanish: "Categoría",
    French: "Catégorie",
    German: "Kategorie",
    Russian: "Категория",
    "Chinese (Simplified)": "类别",
    Hebrew: "קטגוריה",
  },
  status: {
    English: "Status",
    Spanish: "Estado",
    French: "Statut",
    German: "Status",
    Russian: "Статус",
    "Chinese (Simplified)": "状态",
    Hebrew: "סטטוס",
  },
  originalSnippet: {
    English: "Original Snippet",
    Spanish: "Fragmento original",
    French: "Extrait original",
    German: "Originalausschnitt",
    Russian: "Оригинальный фрагмент",
    "Chinese (Simplified)": "原始片段",
    Hebrew: "קטע מקורי",
  },
  revisedSnippet: {
    English: "Revised Snippet",
    Spanish: "Fragmento revisado",
    French: "Extrait révisé",
    German: "Überarbeiteter Ausschnitt",
    Russian: "Пересмотренный фрагмент",
    "Chinese (Simplified)": "修订片段",
    Hebrew: "קטע מתוקן",
  },
  changed: {
    English: "Changed",
    Spanish: "Cambiado",
    French: "Modifié",
    German: "Geändert",
    Russian: "Изменено",
    "Chinese (Simplified)": "已更改",
    Hebrew: "שונה",
  },
  effect: {
    English: "Effect",
    Spanish: "Efecto",
    French: "Effet",
    German: "Auswirkung",
    Russian: "Эффект",
    "Chinese (Simplified)": "效果",
    Hebrew: "השפעה",
  },
  compare: {
    English: "Compare",
    Spanish: "Comparar",
    French: "Comparer",
    German: "Vergleichen",
    Russian: "Сравнить",
    "Chinese (Simplified)": "比较",
    Hebrew: "השוואה",
  },
  comparing: {
    English: "Comparing…",
    Spanish: "Comparando…",
    French: "Comparaison…",
    German: "Vergleiche…",
    Russian: "Сравнение…",
    "Chinese (Simplified)": "比较中…",
    Hebrew: "…משווה",
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
