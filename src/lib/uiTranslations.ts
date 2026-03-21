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
  | "exportResults"
  | "copied"
  | "clear"
  | "detectedChanges"
  | "noChangesDetected"
  | "shift"
  | "allShifts"
  | "explanationLanguage"
  | "modalityShift"
  | "actorPowerShift"
  | "scopeChange"
  | "thresholdShift"
  | "actionDomainShift"
  | "obligationRemoval"
  | "modalityShiftExplanation"
  | "actorPowerShiftExplanation"
  | "scopeChangeExplanation"
  | "thresholdShiftExplanation"
  | "actionDomainShiftExplanation"
  | "obligationRemovalExplanation";

const translations: Record<TranslationKey, Record<UILanguage, string>> = {
  meaningTranslator: {
    English: "Meaning Buddy",
    Spanish: "Traductor de Significado",
    French: "Traducteur de Sens",
    German: "Bedeutungsübersetzer",
    Russian: "Переводчик смысла",
    "Chinese (Simplified)": "含义翻译器",
    Hebrew: "מתרגם משמעות",
  },
  meaningTranslatorDesc: {
    English: "Paste any text to get a plain-language explanation, operational effect, and scope breakdown.",
    Spanish: "Pegue cualquier texto para obtener una explicación en lenguaje sencillo, efecto operativo y desglose de alcance.",
    French: "Collez un texte pour obtenir une explication en langage simple, son effet opérationnel et une analyse de portée.",
    German: "Fügen Sie einen Text ein, um eine verständliche Erklärung, operative Auswirkung und Umfangsanalyse zu erhalten.",
    Russian: "Вставьте текст, чтобы получить объяснение простым языком, практический эффект и разбивку по охвату.",
    "Chinese (Simplified)": "粘贴任何文本，获取通俗解释、操作效果和范围分析。",
    Hebrew: "הדביקו טקסט כדי לקבל הסבר בשפה פשוטה, השפעה תפעולית וניתוח היקף.",
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
  exportResults: {
    English: "Export",
    Spanish: "Exportar",
    French: "Exporter",
    German: "Exportieren",
    Russian: "Экспортировать",
    "Chinese (Simplified)": "导出",
    Hebrew: "ייצוא",
  },
  copied: {
    English: "Copied to clipboard",
    Spanish: "Copiado al portapapeles",
    French: "Copié dans le presse-papiers",
    German: "In die Zwischenablage kopiert",
    Russian: "Скопировано в буфер обмена",
    "Chinese (Simplified)": "已复制到剪贴板",
    Hebrew: "הועתק ללוח",
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
  shift: {
    English: "Shift",
    Spanish: "Cambio",
    French: "Changement",
    German: "Verschiebung",
    Russian: "Сдвиг",
    "Chinese (Simplified)": "变化",
    Hebrew: "שינוי",
  },
  allShifts: {
    English: "All shifts",
    Spanish: "Todos los cambios",
    French: "Tous les changements",
    German: "Alle Verschiebungen",
    Russian: "Все сдвиги",
    "Chinese (Simplified)": "所有变化",
    Hebrew: "כל השינויים",
  },
  explanationLanguage: {
    English: "Explanation language",
    Spanish: "Idioma de explicación",
    French: "Langue d'explication",
    German: "Erklärungssprache",
    Russian: "Язык объяснения",
    "Chinese (Simplified)": "解释语言",
    Hebrew: "שפת הסבר",
  },
  detectedChanges: {
    English: "Detected Changes",
    Spanish: "Cambios detectados",
    French: "Changements détectés",
    German: "Erkannte Änderungen",
    Russian: "Обнаруженные изменения",
    "Chinese (Simplified)": "检测到的变化",
    Hebrew: "שינויים שזוהו",
  },
  noChangesDetected: {
    English: "No structural changes detected.",
    Spanish: "No se detectaron cambios estructurales.",
    French: "Aucun changement structurel détecté.",
    German: "Keine strukturellen Änderungen erkannt.",
    Russian: "Структурные изменения не обнаружены.",
    "Chinese (Simplified)": "未检测到结构性变化。",
    Hebrew: "לא זוהו שינויים מבניים.",
  },
  modalityShift: {
    English: "Modality Shift",
    Spanish: "Cambio de modalidad",
    French: "Changement de modalité",
    German: "Modalitätswechsel",
    Russian: "Смена модальности",
    "Chinese (Simplified)": "模态变化",
    Hebrew: "שינוי מודאליות",
  },
  actorPowerShift: {
    English: "Actor Power Shift",
    Spanish: "Cambio de poder del actor",
    French: "Changement de pouvoir d'acteur",
    German: "Akteur-Machtverschiebung",
    Russian: "Смена полномочий",
    "Chinese (Simplified)": "主体权力转移",
    Hebrew: "שינוי סמכות",
  },
  scopeChange: {
    English: "Scope Change",
    Spanish: "Cambio de alcance",
    French: "Changement de portée",
    German: "Umfangsänderung",
    Russian: "Изменение объёма",
    "Chinese (Simplified)": "范围变更",
    Hebrew: "שינוי היקף",
  },
  thresholdShift: {
    English: "Threshold / Standard Shift",
    Spanish: "Cambio de umbral / estándar",
    French: "Changement de seuil / norme",
    German: "Schwellenwert- / Standardänderung",
    Russian: "Изменение порога / стандарта",
    "Chinese (Simplified)": "阈值/标准变化",
    Hebrew: "שינוי סף / תקן",
  },
  actionDomainShift: {
    English: "Action Domain Shift",
    Spanish: "Cambio de dominio de acción",
    French: "Changement de domaine d'action",
    German: "Aktionsbereichswechsel",
    Russian: "Смена области действия",
    "Chinese (Simplified)": "行动领域变化",
    Hebrew: "שינוי תחום פעולה",
  },
  obligationRemoval: {
    English: "Obligation Removal",
    Spanish: "Eliminación de obligación",
    French: "Suppression d'obligation",
    German: "Verpflichtungsentfernung",
    Russian: "Снятие обязательства",
    "Chinese (Simplified)": "义务移除",
    Hebrew: "הסרת חובה",
  },
  modalityShiftExplanation: {
    English: "Changes mandatory language to discretionary language",
    Spanish: "Cambia el lenguaje obligatorio a lenguaje discrecional",
    French: "Transforme le langage obligatoire en langage discrétionnaire",
    German: "Ändert verbindliche Sprache in ermessensbasierte Sprache",
    Russian: "Меняет обязательные формулировки на дискреционные",
    "Chinese (Simplified)": "将强制性语言改为自由裁量性语言",
    Hebrew: "משנה שפה מחייבת לשפה שיקולית",
  },
  actorPowerShiftExplanation: {
    English: "Shifts decision-making authority between parties",
    Spanish: "Transfiere la autoridad de toma de decisiones entre partes",
    French: "Transfère l'autorité décisionnelle entre les parties",
    German: "Verschiebt Entscheidungsbefugnisse zwischen Parteien",
    Russian: "Перераспределяет полномочия между сторонами",
    "Chinese (Simplified)": "在各方之间转移决策权",
    Hebrew: "מעביר סמכות קבלת החלטות בין גורמים",
  },
  scopeChangeExplanation: {
    English: "Modifies the scope of what is covered",
    Spanish: "Modifica el alcance de lo que está cubierto",
    French: "Modifie la portée de ce qui est couvert",
    German: "Ändert den Umfang des Abgedeckten",
    Russian: "Изменяет объём охвата",
    "Chinese (Simplified)": "修改覆盖范围",
    Hebrew: "משנה את היקף הכיסוי",
  },
  thresholdShiftExplanation: {
    English: "Adjusts the standards or thresholds required",
    Spanish: "Ajusta los estándares o umbrales requeridos",
    French: "Ajuste les normes ou seuils requis",
    German: "Passt erforderliche Standards oder Schwellenwerte an",
    Russian: "Корректирует требуемые стандарты или пороги",
    "Chinese (Simplified)": "调整所需的标准或阈值",
    Hebrew: "מתאים את הסטנדרטים או הספים הנדרשים",
  },
  actionDomainShiftExplanation: {
    English: "Changes the type of actions required",
    Spanish: "Cambia el tipo de acciones requeridas",
    French: "Modifie le type d'actions requises",
    German: "Ändert die Art der erforderlichen Maßnahmen",
    Russian: "Изменяет тип требуемых действий",
    "Chinese (Simplified)": "改变所需的行动类型",
    Hebrew: "משנה את סוג הפעולות הנדרשות",
  },
  obligationRemovalExplanation: {
    English: "Removes or weakens a previously stated obligation",
    Spanish: "Elimina o debilita una obligación previamente establecida",
    French: "Supprime ou affaiblit une obligation précédemment énoncée",
    German: "Entfernt oder schwächt eine zuvor festgelegte Verpflichtung",
    Russian: "Удаляет или ослабляет ранее установленное обязательство",
    "Chinese (Simplified)": "移除或削弱先前规定的义务",
    Hebrew: "מסיר או מחליש חובה שנקבעה קודם לכן",
  },
};

export function t(language: UILanguage, key: TranslationKey): string {
  return translations[key]?.[language] ?? translations[key]?.["English"] ?? key;
}
