export const UI_LANGUAGES = [
  "English",
  "Spanish",
  "Arabic",
  "Somali",
  "Ukrainian",
] as const;

export type UILanguage = (typeof UI_LANGUAGES)[number];

/** Languages that render right-to-left */
export function isRtlLanguage(lang: UILanguage): boolean {
  return lang === "Arabic";
}

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

/** ISO code used when passing language to the edge function */
export function langToCode(lang: UILanguage): string {
  const map: Record<UILanguage, string> = {
    English: "en",
    Spanish: "es",
    Arabic: "ar",
    Somali: "so",
    Ukrainian: "uk",
  };
  return map[lang];
}

export type TranslationKey =
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
  | "scopeLabel"
  | "scopeFull"
  | "scopeMeaningOnly"
  | "scopeOperationalOnly"
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
    Spanish: "Meaning Buddy",
    Arabic: "Meaning Buddy",
    Somali: "Meaning Buddy",
    Ukrainian: "Meaning Buddy",
  },
  meaningTranslatorDesc: {
    English: "Paste any text to get a plain-language explanation, operational effect, and scope breakdown.",
    Spanish: "Pegue cualquier texto para obtener una explicación en lenguaje sencillo, efecto operativo y desglose de alcance.",
    Arabic: "الصق أي نص للحصول على شرح بلغة بسيطة، والأثر التشغيلي، وتحليل النطاق.",
    Somali: "Ku dhaji qoraal kasta si aad u hesho sharaxaad luuqad fudud, saamaynta hawlgalka, iyo falanqaynta baaxadda.",
    Ukrainian: "Вставте будь-який текст, щоб отримати пояснення простою мовою, операційний ефект та розбивку за обсягом.",
  },
  operationalEffect: {
    English: "Operational Effect",
    Spanish: "Efecto Operativo",
    Arabic: "الأثر التشغيلي",
    Somali: "Saamaynta Hawlgalka",
    Ukrainian: "Операційний ефект",
  },
  plainLanguageMeaning: {
    English: "Plain Language Meaning",
    Spanish: "Significado en Lenguaje Sencillo",
    Arabic: "المعنى بلغة بسيطة",
    Somali: "Macnaha Luuqadda Fudud",
    Ukrainian: "Значення простою мовою",
  },
  pasteText: {
    English: "Paste text",
    Spanish: "Pegar texto",
    Arabic: "الصق النص",
    Somali: "Ku dhaji qoraalka",
    Ukrainian: "Вставте текст",
  },
  pasteTextPlaceholder: {
    English: "Paste your text here…",
    Spanish: "Pegue su texto aquí…",
    Arabic: "الصق النص هنا…",
    Somali: "Halkan ku dhaji qoraalkaaga…",
    Ukrainian: "Вставте текст сюди…",
  },
  analyze: {
    English: "Analyze",
    Spanish: "Analizar",
    Arabic: "تحليل",
    Somali: "Falanqee",
    Ukrainian: "Аналізувати",
  },
  analyzing: {
    English: "Analyzing…",
    Spanish: "Analizando…",
    Arabic: "جارٍ التحليل…",
    Somali: "Waa la falanqeynayaa…",
    Ukrainian: "Аналізується…",
  },
  analysisFailed: {
    English: "Analysis failed. Please try again.",
    Spanish: "El análisis falló. Inténtelo de nuevo.",
    Arabic: "فشل التحليل. يرجى المحاولة مرة أخرى.",
    Somali: "Falanqayntu way fashilantay. Fadlan isku day mar kale.",
    Ukrainian: "Аналіз не вдався. Спробуйте ще раз.",
  },
  copyResults: {
    English: "Copy Results",
    Spanish: "Copiar Resultados",
    Arabic: "نسخ النتائج",
    Somali: "Koobi Natiijooyinka",
    Ukrainian: "Копіювати результати",
  },
  exportResults: {
    English: "Export",
    Spanish: "Exportar",
    Arabic: "تصدير",
    Somali: "Dhoofi",
    Ukrainian: "Експорт",
  },
  copied: {
    English: "Copied to clipboard",
    Spanish: "Copiado al portapapeles",
    Arabic: "تم النسخ إلى الحافظة",
    Somali: "Waa lagu koobiyay",
    Ukrainian: "Скопійовано в буфер обміну",
  },
  clear: {
    English: "Clear",
    Spanish: "Borrar",
    Arabic: "مسح",
    Somali: "Nadiifi",
    Ukrainian: "Очистити",
  },
  shift: {
    English: "Shift",
    Spanish: "Cambio",
    Arabic: "تحوّل",
    Somali: "Beddel",
    Ukrainian: "Зміщення",
  },
  allShifts: {
    English: "All shifts",
    Spanish: "Todos los cambios",
    Arabic: "جميع التحولات",
    Somali: "Dhammaan beddelashada",
    Ukrainian: "Усі зміщення",
  },
  explanationLanguage: {
    English: "Explanation language",
    Spanish: "Idioma de explicación",
    Arabic: "لغة الشرح",
    Somali: "Luuqadda sharaxaadda",
    Ukrainian: "Мова пояснення",
  },
  scopeLabel: {
    English: "Scope",
    Spanish: "Alcance",
    Arabic: "النطاق",
    Somali: "Baaxadda",
    Ukrainian: "Обсяг",
  },
  scopeFull: {
    English: "Full analysis",
    Spanish: "Análisis completo",
    Arabic: "تحليل كامل",
    Somali: "Falanqayn buuxa",
    Ukrainian: "Повний аналіз",
  },
  scopeMeaningOnly: {
    English: "Meaning only",
    Spanish: "Solo significado",
    Arabic: "المعنى فقط",
    Somali: "Macnaha kaliya",
    Ukrainian: "Лише значення",
  },
  scopeOperationalOnly: {
    English: "Operational effect only",
    Spanish: "Solo efecto operativo",
    Arabic: "الأثر التشغيلي فقط",
    Somali: "Saamaynta hawlgalka kaliya",
    Ukrainian: "Лише операційний ефект",
  },
  detectedChanges: {
    English: "Detected Changes",
    Spanish: "Cambios Detectados",
    Arabic: "التغييرات المكتشفة",
    Somali: "Isbeddelada la ogaaday",
    Ukrainian: "Виявлені зміни",
  },
  noChangesDetected: {
    English: "No structural changes detected.",
    Spanish: "No se detectaron cambios estructurales.",
    Arabic: "لم يتم اكتشاف تغييرات هيكلية.",
    Somali: "Lama helin isbeddel qaab-dhismeedka ah.",
    Ukrainian: "Структурних змін не виявлено.",
  },
  modalityShift: {
    English: "Modality Shift",
    Spanish: "Cambio de Modalidad",
    Arabic: "تحوّل في الصيغة",
    Somali: "Beddelashada Qaabka",
    Ukrainian: "Зміна модальності",
  },
  actorPowerShift: {
    English: "Actor Power Shift",
    Spanish: "Cambio de Poder del Actor",
    Arabic: "تحوّل في سلطة الفاعل",
    Somali: "Beddelashada Awoodda",
    Ukrainian: "Зміна повноважень",
  },
  scopeChange: {
    English: "Scope Change",
    Spanish: "Cambio de Alcance",
    Arabic: "تغيير النطاق",
    Somali: "Beddelashada Baaxadda",
    Ukrainian: "Зміна обсягу",
  },
  thresholdShift: {
    English: "Threshold / Standard Shift",
    Spanish: "Cambio de Umbral / Estándar",
    Arabic: "تحوّل في الحدود / المعايير",
    Somali: "Beddelashada Heerka",
    Ukrainian: "Зміна порогу / стандарту",
  },
  actionDomainShift: {
    English: "Action Domain Shift",
    Spanish: "Cambio de Dominio de Acción",
    Arabic: "تحوّل في مجال الإجراءات",
    Somali: "Beddelashada Qaybta Ficilka",
    Ukrainian: "Зміна сфери дії",
  },
  obligationRemoval: {
    English: "Obligation Removal",
    Spanish: "Eliminación de Obligación",
    Arabic: "إزالة الالتزام",
    Somali: "Ka saarista Waajibaadka",
    Ukrainian: "Зняття зобов'язання",
  },
  modalityShiftExplanation: {
    English: "Changes mandatory language to discretionary language",
    Spanish: "Cambia el lenguaje obligatorio a lenguaje discrecional",
    Arabic: "يغيّر اللغة الإلزامية إلى لغة تقديرية",
    Somali: "Wuxuu beddelaa luuqadda waajibka ah luuqad ikhtiyaari ah",
    Ukrainian: "Змінює обов'язкові формулювання на дискреційні",
  },
  actorPowerShiftExplanation: {
    English: "Shifts decision-making authority between parties",
    Spanish: "Transfiere la autoridad de toma de decisiones entre partes",
    Arabic: "ينقل سلطة اتخاذ القرار بين الأطراف",
    Somali: "Wuxuu wareejiyaa awoodda go'aan qaadashada dhinacyada dhexdooda",
    Ukrainian: "Перерозподіляє повноваження між сторонами",
  },
  scopeChangeExplanation: {
    English: "Modifies the scope of what is covered",
    Spanish: "Modifica el alcance de lo que está cubierto",
    Arabic: "يعدّل نطاق ما يتم تغطيته",
    Somali: "Wuxuu wax ka beddelaa baaxadda waxa daboolaya",
    Ukrainian: "Змінює обсяг охоплення",
  },
  thresholdShiftExplanation: {
    English: "Adjusts the standards or thresholds required",
    Spanish: "Ajusta los estándares o umbrales requeridos",
    Arabic: "يعدّل المعايير أو الحدود المطلوبة",
    Somali: "Wuxuu hagaajiyaa heerarka ama xadka loo baahan yahay",
    Ukrainian: "Коригує необхідні стандарти або пороги",
  },
  actionDomainShiftExplanation: {
    English: "Changes the type of actions required",
    Spanish: "Cambia el tipo de acciones requeridas",
    Arabic: "يغيّر نوع الإجراءات المطلوبة",
    Somali: "Wuxuu beddelaa nooca ficillada loo baahan yahay",
    Ukrainian: "Змінює тип необхідних дій",
  },
  obligationRemovalExplanation: {
    English: "Removes or weakens a previously stated obligation",
    Spanish: "Elimina o debilita una obligación previamente establecida",
    Arabic: "يزيل أو يضعف التزامًا سابقًا",
    Somali: "Wuxuu ka saaraa ama daciifiyaa waajib horey loo sheegay",
    Ukrainian: "Знімає або послаблює раніше визначене зобов'язання",
  },
};

export function t(language: UILanguage, key: TranslationKey): string {
  return translations[key]?.[language] ?? translations[key]?.["English"] ?? key;
}
