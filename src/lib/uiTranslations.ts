export const UI_LANGUAGES = [
  "English",
  "Spanish",
  "Arabic",
  "Somali",
  "Ukrainian",
  "Haitian Creole",
  "Mandarin Chinese",
  "Russian",
  "French",
  "Portuguese",
  "Dari",
  "Pashto",
  "Vietnamese",
  "Korean",
  "Tagalog",
  "Urdu",
  "Bengali",
  "Punjabi",
  "Amharic",
  "Farsi / Persian",
] as const;

export type UILanguage = (typeof UI_LANGUAGES)[number];

/** Languages that render right-to-left */
export function isRtlLanguage(lang: UILanguage): boolean {
  return lang === "Arabic" || lang === "Farsi / Persian" || lang === "Urdu" || lang === "Pashto" || lang === "Dari";
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
    "Haitian Creole": "ht",
    "Mandarin Chinese": "zh",
    Russian: "ru",
    French: "fr",
    Portuguese: "pt",
    Dari: "prs",
    Pashto: "ps",
    Vietnamese: "vi",
    Korean: "ko",
    Tagalog: "tl",
    Urdu: "ur",
    Bengali: "bn",
    Punjabi: "pa",
    Amharic: "am",
    "Farsi / Persian": "fa",
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
  | "outputLanguage"
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
  | "obligationRemovalExplanation"
  | "evidenceRetrieval"
  | "retrievingEvidence"
  | "verifySource"
  | "evidenceFound"
  | "evidenceNotFound"
  | "evidenceNotRequired"
  | "evidenceSnippet"
  | "evidenceSource"
  | "evidenceSection"
  | "evidenceComparison"
  | "comparisonMatch"
  | "comparisonPartial"
  | "comparisonUnclear"
  | "noSourceFound";

type LangMap = Partial<Record<UILanguage, string>> & { English: string };

const translations: Record<TranslationKey, LangMap> = {
  meaningTranslator: {
    English: "Meaning Buddy",
  },
  meaningTranslatorDesc: {
    English: "Paste any text to get a plain-language explanation, operational effect, and scope breakdown.",
    Spanish: "Pegue cualquier texto para obtener una explicación en lenguaje sencillo, efecto operativo y desglose de alcance.",
    Arabic: "الصق أي نص للحصول على شرح بلغة بسيطة، والأثر التشغيلي، وتحليل النطاق.",
    Somali: "Ku dhaji qoraal kasta si aad u hesho sharaxaad luuqad fudud, saamaynta hawlgalka, iyo falanqaynta baaxadda.",
    Ukrainian: "Вставте будь-який текст, щоб отримати пояснення простою мовою, операційний ефект та розбивку за обсягом.",
    "Haitian Creole": "Kole nenpòt tèks pou jwenn yon eksplikasyon an lang senp, efè operasyonèl, ak dekoupaj pòte.",
    "Mandarin Chinese": "粘贴任何文本以获取通俗语言解释、操作效果和范围分析。",
    Russian: "Вставьте любой текст, чтобы получить объяснение простым языком, операционный эффект и разбивку по охвату.",
    French: "Collez n'importe quel texte pour obtenir une explication en langage clair, l'effet opérationnel et l'analyse de la portée.",
    Portuguese: "Cole qualquer texto para obter uma explicação em linguagem simples, efeito operacional e análise de escopo.",
    Dari: "هر متنی را بچسبانید تا توضیح ساده، اثر عملیاتی و تحلیل دامنه دریافت کنید.",
    Pashto: "هر متن ولګوئ ترڅو ساده توضیحات، عملیاتي اغیز او د ساحې تحلیل ترلاسه کړئ.",
    Vietnamese: "Dán bất kỳ văn bản nào để nhận giải thích bằng ngôn ngữ đơn giản, hiệu ứng vận hành và phân tích phạm vi.",
    Korean: "텍스트를 붙여넣으면 쉬운 언어 설명, 운영 효과, 범위 분석을 받을 수 있습니다.",
    Tagalog: "I-paste ang anumang teksto upang makakuha ng paliwanag sa simpleng wika, epekto sa operasyon, at pagsusuri ng saklaw.",
    Urdu: "کوئی بھی متن چسپاں کریں تاکہ سادہ زبان میں وضاحت، آپریشنل اثر اور دائرہ کار کا تجزیہ حاصل کریں۔",
    Bengali: "যেকোনো পাঠ্য আটকান সহজ ভাষায় ব্যাখ্যা, কার্যকরী প্রভাব এবং পরিসর বিশ্লেষণ পেতে।",
    Punjabi: "ਕੋਈ ਵੀ ਟੈਕਸਟ ਪੇਸਟ ਕਰੋ ਸਧਾਰਨ ਭਾਸ਼ਾ ਵਿੱਚ ਵਿਆਖਿਆ, ਸੰਚਾਲਨ ਪ੍ਰਭਾਵ ਅਤੇ ਸਕੋਪ ਵਿਸ਼ਲੇਸ਼ਣ ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ।",
    Amharic: "ማንኛውንም ጽሑፍ ለጥፉ ቀላል ቋንቋ ማብራሪያ፣ ተግባራዊ ውጤት እና የወሰን ትንተና ለማግኘት።",
    "Farsi / Persian": "هر متنی را بچسبانید تا توضیح ساده، اثر عملیاتی و تحلیل دامنه دریافت کنید.",
  },
  operationalEffect: {
    English: "Operational Effect",
    Spanish: "Efecto Operativo",
    Arabic: "الأثر التشغيلي",
    Somali: "Saamaynta Hawlgalka",
    Ukrainian: "Операційний ефект",
    "Haitian Creole": "Efè Operasyonèl",
    "Mandarin Chinese": "操作效果",
    Russian: "Операционный эффект",
    French: "Effet Opérationnel",
    Portuguese: "Efeito Operacional",
    Dari: "اثر عملیاتی",
    Pashto: "عملیاتي اغیز",
    Vietnamese: "Hiệu Ứng Vận Hành",
    Korean: "운영 효과",
    Tagalog: "Epekto sa Operasyon",
    Urdu: "آپریشنل اثر",
    Bengali: "কার্যকরী প্রভাব",
    Punjabi: "ਸੰਚਾਲਨ ਪ੍ਰਭਾਵ",
    Amharic: "ተግባራዊ ውጤት",
    "Farsi / Persian": "اثر عملیاتی",
  },
  plainLanguageMeaning: {
    English: "Plain Language Meaning",
    Spanish: "Significado en Lenguaje Sencillo",
    Arabic: "المعنى بلغة بسيطة",
    Somali: "Macnaha Luuqadda Fudud",
    Ukrainian: "Значення простою мовою",
    "Haitian Creole": "Siyifikasyon an Lang Senp",
    "Mandarin Chinese": "通俗语言含义",
    Russian: "Значение простым языком",
    French: "Signification en Langage Clair",
    Portuguese: "Significado em Linguagem Simples",
    Dari: "معنی به زبان ساده",
    Pashto: "په ساده ژبه معنی",
    Vietnamese: "Ý Nghĩa Ngôn Ngữ Đơn Giản",
    Korean: "쉬운 언어 의미",
    Tagalog: "Kahulugan sa Simpleng Wika",
    Urdu: "سادہ زبان میں معنی",
    Bengali: "সহজ ভাষায় অর্থ",
    Punjabi: "ਸਧਾਰਨ ਭਾਸ਼ਾ ਅਰਥ",
    Amharic: "ቀላል ቋንቋ ትርጉም",
    "Farsi / Persian": "معنی به زبان ساده",
  },
  pasteText: {
    English: "Paste text",
    Spanish: "Pegar texto",
    Arabic: "الصق النص",
    Somali: "Ku dhaji qoraalka",
    Ukrainian: "Вставте текст",
    "Haitian Creole": "Kole tèks",
    "Mandarin Chinese": "粘贴文本",
    Russian: "Вставьте текст",
    French: "Coller le texte",
    Portuguese: "Colar texto",
    Dari: "متن را بچسبانید",
    Pashto: "متن ولګوئ",
    Vietnamese: "Dán văn bản",
    Korean: "텍스트 붙여넣기",
    Tagalog: "I-paste ang teksto",
    Urdu: "متن چسپاں کریں",
    Bengali: "পাঠ্য আটকান",
    Punjabi: "ਟੈਕਸਟ ਪੇਸਟ ਕਰੋ",
    Amharic: "ጽሑፍ ለጥፍ",
    "Farsi / Persian": "متن را بچسبانید",
  },
  pasteTextPlaceholder: {
    English: "Paste your text here…",
    Spanish: "Pegue su texto aquí…",
    Arabic: "الصق النص هنا…",
    Somali: "Halkan ku dhaji qoraalkaaga…",
    Ukrainian: "Вставте текст сюди…",
    "Haitian Creole": "Kole tèks ou a isit la…",
    "Mandarin Chinese": "在此粘贴您的文本…",
    Russian: "Вставьте текст сюда…",
    French: "Collez votre texte ici…",
    Portuguese: "Cole seu texto aqui…",
    Vietnamese: "Dán văn bản của bạn vào đây…",
    Korean: "여기에 텍스트를 붙여넣으세요…",
    Urdu: "اپنا متن یہاں چسپاں کریں…",
    "Farsi / Persian": "متن خود را اینجا بچسبانید…",
  },
  analyze: {
    English: "Analyze",
    Spanish: "Analizar",
    Arabic: "تحليل",
    Somali: "Falanqee",
    Ukrainian: "Аналізувати",
    "Mandarin Chinese": "分析",
    Russian: "Анализировать",
    French: "Analyser",
    Portuguese: "Analisar",
    Vietnamese: "Phân tích",
    Korean: "분석",
    Urdu: "تجزیہ کریں",
    "Farsi / Persian": "تحلیل",
  },
  analyzing: {
    English: "Analyzing…",
    Spanish: "Analizando…",
    Arabic: "جارٍ التحليل…",
    Somali: "Waa la falanqeynayaa…",
    Ukrainian: "Аналізується…",
    "Mandarin Chinese": "分析中…",
    Russian: "Анализируется…",
    French: "Analyse en cours…",
    Portuguese: "Analisando…",
    Vietnamese: "Đang phân tích…",
    Korean: "분석 중…",
    Urdu: "تجزیہ ہو رہا ہے…",
    "Farsi / Persian": "در حال تحلیل…",
  },
  analysisFailed: {
    English: "Analysis failed. Please try again.",
    Spanish: "El análisis falló. Inténtelo de nuevo.",
    Arabic: "فشل التحليل. يرجى المحاولة مرة أخرى.",
    Somali: "Falanqayntu way fashilantay. Fadlan isku day mar kale.",
    Ukrainian: "Аналіз не вдався. Спробуйте ще раз.",
    Russian: "Анализ не удался. Попробуйте ещё раз.",
    French: "L'analyse a échoué. Veuillez réessayer.",
    Portuguese: "A análise falhou. Tente novamente.",
  },
  copyResults: {
    English: "Copy Results",
    Spanish: "Copiar Resultados",
    Arabic: "نسخ النتائج",
    Somali: "Koobi Natiijooyinka",
    Ukrainian: "Копіювати результати",
    "Mandarin Chinese": "复制结果",
    Russian: "Копировать результаты",
    French: "Copier les résultats",
    Portuguese: "Copiar resultados",
    Vietnamese: "Sao chép kết quả",
    Korean: "결과 복사",
    Urdu: "نتائج کاپی کریں",
    "Farsi / Persian": "کپی نتایج",
  },
  exportResults: {
    English: "Export",
    Spanish: "Exportar",
    Arabic: "تصدير",
    Somali: "Dhoofi",
    Ukrainian: "Експорт",
    "Mandarin Chinese": "导出",
    Russian: "Экспорт",
    French: "Exporter",
    Portuguese: "Exportar",
    Vietnamese: "Xuất",
    Korean: "내보내기",
    Urdu: "برآمد",
    "Farsi / Persian": "صادر کردن",
  },
  copied: {
    English: "Copied to clipboard",
    Spanish: "Copiado al portapapeles",
    Arabic: "تم النسخ إلى الحافظة",
    Somali: "Waa lagu koobiyay",
    Ukrainian: "Скопійовано в буфер обміну",
    Russian: "Скопировано в буфер обмена",
    French: "Copié dans le presse-papiers",
    Portuguese: "Copiado para a área de transferência",
  },
  clear: {
    English: "Clear",
    Spanish: "Borrar",
    Arabic: "مسح",
    Somali: "Nadiifi",
    Ukrainian: "Очистити",
    "Mandarin Chinese": "清除",
    Russian: "Очистить",
    French: "Effacer",
    Portuguese: "Limpar",
    Vietnamese: "Xóa",
    Korean: "지우기",
    Urdu: "صاف کریں",
    "Farsi / Persian": "پاک کردن",
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
    "Mandarin Chinese": "解释语言",
    Russian: "Язык объяснения",
    French: "Langue d'explication",
    Portuguese: "Idioma de explicação",
    Vietnamese: "Ngôn ngữ giải thích",
    Korean: "설명 언어",
    Urdu: "وضاحت کی زبان",
    "Farsi / Persian": "زبان توضیح",
  },
  scopeLabel: {
    English: "Scope",
    Spanish: "Alcance",
    Arabic: "النطاق",
    Somali: "Baaxadda",
    Ukrainian: "Обсяг",
    "Mandarin Chinese": "范围",
    Russian: "Объём",
    French: "Portée",
    Portuguese: "Escopo",
    Vietnamese: "Phạm vi",
    Korean: "범위",
    Urdu: "دائرہ کار",
    "Farsi / Persian": "دامنه",
  },
  scopeFull: {
    English: "Full analysis",
    Spanish: "Análisis completo",
    Arabic: "تحليل كامل",
    Somali: "Falanqayn buuxa",
    Ukrainian: "Повний аналіз",
    "Mandarin Chinese": "完整分析",
    Russian: "Полный анализ",
    French: "Analyse complète",
    Portuguese: "Análise completa",
  },
  scopeMeaningOnly: {
    English: "Meaning only",
    Spanish: "Solo significado",
    Arabic: "المعنى فقط",
    Somali: "Macnaha kaliya",
    Ukrainian: "Лише значення",
    "Mandarin Chinese": "仅含义",
    Russian: "Только значение",
    French: "Signification uniquement",
    Portuguese: "Apenas significado",
  },
  scopeOperationalOnly: {
    English: "Operational effect only",
    Spanish: "Solo efecto operativo",
    Arabic: "الأثر التشغيلي فقط",
    Somali: "Saamaynta hawlgalka kaliya",
    Ukrainian: "Лише операційний ефект",
    "Mandarin Chinese": "仅操作效果",
    Russian: "Только операционный эффект",
    French: "Effet opérationnel uniquement",
    Portuguese: "Apenas efeito operacional",
  },
  detectedChanges: {
    English: "Detected Changes",
    Spanish: "Cambios Detectados",
    Arabic: "التغييرات المكتشفة",
    Somali: "Isbeddelada la ogaaday",
    Ukrainian: "Виявлені зміни",
    "Mandarin Chinese": "检测到的变更",
    Russian: "Обнаруженные изменения",
    French: "Changements détectés",
    Portuguese: "Alterações detectadas",
  },
  noChangesDetected: {
    English: "No structural changes detected.",
    Spanish: "No se detectaron cambios estructurales.",
    Arabic: "لم يتم اكتشاف تغييرات هيكلية.",
    Somali: "Lama helin isbeddel qaab-dhismeedka ah.",
    Ukrainian: "Структурних змін не виявлено.",
    Russian: "Структурных изменений не обнаружено.",
    French: "Aucun changement structurel détecté.",
    Portuguese: "Nenhuma alteração estrutural detectada.",
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
  evidenceRetrieval: {
    English: "Evidence Verification",
    Spanish: "Verificación de evidencia",
    Arabic: "التحقق من الأدلة",
    Somali: "Xaqiijinta caddaynta",
    Ukrainian: "Перевірка доказів",
  },
  retrievingEvidence: {
    English: "Retrieving evidence…",
    Spanish: "Recuperando evidencia…",
    Arabic: "جارٍ استرجاع الأدلة…",
    Somali: "Caddaynta la soo celiyey…",
    Ukrainian: "Отримання доказів…",
  },
  verifySource: {
    English: "Verify Sources",
    Spanish: "Verificar fuentes",
    Arabic: "تحقق من المصادر",
    Somali: "Xaqiiji ilaha",
    Ukrainian: "Перевірити джерела",
  },
  evidenceFound: {
    English: "Evidence found",
    Spanish: "Evidencia encontrada",
    Arabic: "تم العثور على دليل",
    Somali: "Caddayn la helay",
    Ukrainian: "Докази знайдено",
  },
  evidenceNotFound: {
    English: "No source found",
    Spanish: "No se encontró fuente",
    Arabic: "لم يتم العثور على مصدر",
    Somali: "Isha lama helin",
    Ukrainian: "Джерело не знайдено",
  },
  evidenceNotRequired: {
    English: "Verification not required",
    Spanish: "Verificación no requerida",
    Arabic: "التحقق غير مطلوب",
    Somali: "Xaqiijinta looma baahna",
    Ukrainian: "Перевірка не потрібна",
  },
  evidenceSnippet: {
    English: "Source snippet",
    Spanish: "Fragmento de la fuente",
    Arabic: "مقتطف من المصدر",
    Somali: "Qayb ka mid ah isha",
    Ukrainian: "Фрагмент джерела",
  },
  evidenceSource: {
    English: "Source",
    Spanish: "Fuente",
    Arabic: "مصدر",
    Somali: "Isha",
    Ukrainian: "Джерело",
  },
  evidenceSection: {
    English: "Section",
    Spanish: "Sección",
    Arabic: "قسم",
    Somali: "Qaybta",
    Ukrainian: "Розділ",
  },
  evidenceComparison: {
    English: "Match quality",
    Spanish: "Calidad de coincidencia",
    Arabic: "جودة المطابقة",
    Somali: "Tayada u dhiganka",
    Ukrainian: "Якість відповідності",
  },
  comparisonMatch: {
    English: "Direct match",
    Spanish: "Coincidencia directa",
    Arabic: "تطابق مباشر",
    Somali: "U dhigma toos",
    Ukrainian: "Пряма відповідність",
  },
  comparisonPartial: {
    English: "Partial match",
    Spanish: "Coincidencia parcial",
    Arabic: "تطابق جزئي",
    Somali: "U dhigma qayb ahaan",
    Ukrainian: "Часткова відповідність",
  },
  comparisonUnclear: {
    English: "Unclear",
    Spanish: "No claro",
    Arabic: "غير واضح",
    Somali: "Aan caddayn",
    Ukrainian: "Незрозуміло",
  },
  noSourceFound: {
    English: "No source found — do not rely on this claim without independent verification.",
    Spanish: "No se encontró fuente — no confíe en esta afirmación sin verificación independiente.",
    Arabic: "لم يتم العثور على مصدر — لا تعتمد على هذا الادعاء دون تحقق مستقل.",
    Somali: "Isha lama helin — ha ku tiirsanin sheegashadaan iyada oo aan xaqiijin madaxbanaan la samayn.",
    Ukrainian: "Джерело не знайдено — не покладайтеся на це твердження без незалежної перевірки.",
  },
};

export function t(language: UILanguage, key: TranslationKey): string {
  return translations[key]?.[language] ?? translations[key]?.["English"] ?? key;
}
