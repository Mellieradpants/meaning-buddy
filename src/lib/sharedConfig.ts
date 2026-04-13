/**
 * Single source of truth for shift categories and language options.
 * Both the Landing (instructional) page and the Index (tool) page import from here.
 */

export const SHIFT_OPTIONS = [
  { value: "all", label: "All shifts" },
  { value: "modality", label: "Modality Shift" },
  { value: "scope", label: "Scope Change" },
  { value: "actor_power", label: "Actor Power Shift" },
  { value: "action_domain", label: "Action Domain Shift" },
  { value: "threshold", label: "Threshold / Standard Shift" },
  { value: "obligation", label: "Obligation Removal" },
] as const;

export type ShiftKey = (typeof SHIFT_OPTIONS)[number]["value"];

export const LANG_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "ar", label: "Arabic" },
  { value: "so", label: "Somali" },
  { value: "uk", label: "Ukrainian" },
  { value: "ht", label: "Haitian Creole" },
  { value: "zh", label: "Mandarin Chinese" },
  { value: "ru", label: "Russian" },
  { value: "fr", label: "French" },
  { value: "pt", label: "Portuguese" },
  { value: "prs", label: "Dari" },
  { value: "ps", label: "Pashto" },
  { value: "vi", label: "Vietnamese" },
  { value: "ko", label: "Korean" },
  { value: "tl", label: "Tagalog" },
  { value: "ur", label: "Urdu" },
  { value: "bn", label: "Bengali" },
  { value: "pa", label: "Punjabi" },
  { value: "am", label: "Amharic" },
  { value: "fa", label: "Farsi / Persian" },
] as const;

export type LangKey = (typeof LANG_OPTIONS)[number]["value"];

export const RTL_LANGS: LangKey[] = ["ar", "fa", "ur", "prs", "ps"];

export function isRtlLang(lang: LangKey): boolean {
  return RTL_LANGS.includes(lang);
}
