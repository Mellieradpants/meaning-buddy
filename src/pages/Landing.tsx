import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

type ShiftKey = "all" | "threshold" | "obligation" | "scope" | "enforcement";
type LangKey = "en" | "es" | "zh" | "ja" | "he";

const SHIFT_OPTIONS: { value: ShiftKey; label: string }[] = [
  { value: "all", label: "All shifts" },
  { value: "threshold", label: "Threshold change" },
  { value: "obligation", label: "Obligation removal" },
  { value: "scope", label: "Scope expansion" },
  { value: "enforcement", label: "Enforcement modification" },
];

const LANG_OPTIONS: { value: LangKey; label: string }[] = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "zh", label: "Chinese (Simplified)" },
  { value: "ja", label: "Japanese" },
  { value: "he", label: "Hebrew" },
];

interface DemoEntry {
  category: string;
  detail: string;
  effect: Record<LangKey, string>;
}

const DEMO_DATA: Record<ShiftKey, { original: string; revised: string; operationalEffect: Record<LangKey, string>; changes: DemoEntry[] }> = {
  all: {
    original: "The employer shall provide health insurance to all full-time employees within 30 days of their start date.",
    revised: "The employer may provide health insurance to eligible employees within a reasonable timeframe.",
    operationalEffect: {
      en: "Health insurance is no longer guaranteed. The employer can now decide whether to offer it. Coverage no longer extends to all full-time employees — only those deemed eligible. The fixed 30-day deadline no longer applies.",
      es: "El seguro de salud ya no está garantizado. El empleador ahora puede decidir si lo ofrece. La cobertura ya no se extiende a todos los empleados a tiempo completo, solo a los considerados elegibles. El plazo fijo de 30 días ya no aplica.",
      zh: "健康保险不再有保障。雇主现在可以决定是否提供。覆盖范围不再延伸至所有全职员工——仅限于被认为符合条件的人。30天的固定期限不再适用。",
      ja: "健康保険はもはや保証されていません。雇用主は提供するかどうかを決定できるようになりました。対象は全正社員ではなく、適格と判断された従業員のみです。30日の固定期限は適用されなくなりました。",
      he: "ביטוח הבריאות אינו מובטח עוד. המעסיק יכול כעת להחליט אם להציע אותו. הכיסוי אינו חל עוד על כל העובדים במשרה מלאה — רק על מי שנחשב זכאי. המועד הקבוע של 30 יום אינו חל עוד.",
    },
    changes: [
      { category: "Modality Shift", detail: '"shall provide" → "may provide"', effect: { en: "Mandatory obligation weakened to discretionary", es: "Obligación obligatoria debilitada a discrecional", zh: "强制性义务弱化为自由裁量", ja: "義務的な責務が裁量的に弱体化", he: "חובה מחייבת הוחלשה לשיקול דעת" } },
      { category: "Scope Change", detail: '"all full-time employees" → "eligible employees"', effect: { en: "Coverage narrowed to a subset", es: "Cobertura reducida a un subgrupo", zh: "覆盖范围缩小到一个子集", ja: "対象が一部に限定", he: "הכיסוי צומצם לתת-קבוצה" } },
      { category: "Threshold Shift", detail: '"within 30 days" → "within a reasonable timeframe"', effect: { en: "Fixed deadline replaced with subjective standard", es: "Plazo fijo reemplazado por estándar subjetivo", zh: "固定期限被主观标准取代", ja: "固定期限が主観的基準に置き換え", he: "מועד קבוע הוחלף בסטנדרט סובייקטיבי" } },
      { category: "Obligation Removal", detail: "Mandatory duty weakened to discretionary", effect: { en: "Core obligation effectively removed", es: "Obligación esencial efectivamente eliminada", zh: "核心义务实际上已取消", ja: "中核的義務が事実上削除", he: "חובה מרכזית הוסרה למעשה" } },
    ],
  },
  threshold: {
    original: "The client shall pay all invoices within 15 days of receipt.",
    revised: "Invoices must be paid within 45 days unless otherwise agreed in writing by the provider.",
    operationalEffect: {
      en: "Payment deadline extended from 15 to 45 days. A written exception clause allows further extension at the provider's discretion.",
      es: "El plazo de pago se extiende de 15 a 45 días. Una cláusula de excepción escrita permite una extensión adicional a discreción del proveedor.",
      zh: "付款期限从15天延长至45天。书面例外条款允许供应商酌情进一步延长。",
      ja: "支払い期限が15日から45日に延長。書面による例外条項により、提供者の裁量でさらに延長可能。",
      he: "מועד התשלום הוארך מ-15 ל-45 יום. סעיף חריג בכתב מאפשר הארכה נוספת לפי שיקול דעת הספק.",
    },
    changes: [
      { category: "Threshold Shift", detail: '"within 15 days" → "within 45 days"', effect: { en: "Payment window tripled", es: "Ventana de pago triplicada", zh: "付款窗口增加了三倍", ja: "支払い期間が3倍に", he: "חלון התשלום שולש" } },
    ],
  },
  obligation: {
    original: "A notice of appeal shall be filed within 30 days of the court's final judgment.",
    revised: "A notice of appeal may be filed within 60 days after the entry of final judgment.",
    operationalEffect: {
      en: "Filing an appeal changes from mandatory to optional. The deadline doubles from 30 to 60 days.",
      es: "Presentar una apelación cambia de obligatorio a opcional. El plazo se duplica de 30 a 60 días.",
      zh: "提起上诉从强制变为可选。期限从30天增加到60天。",
      ja: "上訴の提出が義務から任意に変更。期限が30日から60日に倍増。",
      he: "הגשת ערעור משתנה מחובה לאופציונלית. המועד מוכפל מ-30 ל-60 יום.",
    },
    changes: [
      { category: "Obligation Removal", detail: '"shall be filed" → "may be filed"', effect: { en: "Mandatory filing weakened to optional", es: "Presentación obligatoria debilitada a opcional", zh: "强制提交弱化为可选", ja: "義務的な提出が任意に弱体化", he: "הגשה חובה הוחלשה לאופציונלית" } },
    ],
  },
  scope: {
    original: "This policy covers all diagnostic imaging ordered by a licensed physician.",
    revised: "Coverage may be provided for certain diagnostic imaging procedures when deemed medically necessary.",
    operationalEffect: {
      en: "Coverage narrows from all diagnostic imaging to only certain procedures deemed medically necessary. Discretion is introduced where none existed.",
      es: "La cobertura se reduce de todas las imágenes diagnósticas a solo ciertos procedimientos considerados médicamente necesarios. Se introduce discreción donde no existía.",
      zh: "覆盖范围从所有诊断影像缩小到仅某些被认为医学上必要的程序。引入了之前不存在的自由裁量权。",
      ja: "対象がすべての画像診断から医学的に必要と判断された特定の手順のみに縮小。以前はなかった裁量が導入。",
      he: "הכיסוי מצטמצם מכל הדימות האבחנתי לנהלים מסוימים בלבד הנחשבים נחוצים רפואית. שיקול דעת מוכנס היכן שלא היה קיים.",
    },
    changes: [
      { category: "Scope Change", detail: '"all diagnostic imaging" → "certain diagnostic imaging procedures"', effect: { en: "Broad coverage narrowed to selective subset", es: "Cobertura amplia reducida a subgrupo selectivo", zh: "广泛覆盖缩小到选择性子集", ja: "広範な対象が選択的サブセットに縮小", he: "כיסוי רחב צומצם לתת-קבוצה סלקטיבית" } },
    ],
  },
  enforcement: {
    original: "The Department shall publish an annual environmental impact report by March 1 of each year.",
    revised: "The Department may publish periodic environmental impact reports as it deems appropriate.",
    operationalEffect: {
      en: "The fixed annual deadline is removed. Publication frequency and timing become discretionary. The public loses a guaranteed reporting schedule.",
      es: "Se elimina el plazo anual fijo. La frecuencia y el momento de publicación se vuelven discrecionales. El público pierde un calendario de informes garantizado.",
      zh: "固定的年度截止日期被取消。发布频率和时间变为自由裁量。公众失去了有保障的报告时间表。",
      ja: "固定の年次期限が撤廃。発行頻度とタイミングが裁量的に。国民は保証された報告スケジュールを失う。",
      he: "המועד השנתי הקבוע מוסר. תדירות ועיתוי הפרסום הופכים לשיקול דעת. הציבור מאבד לוח זמנים מובטח לדיווח.",
    },
    changes: [
      { category: "Enforcement Modification", detail: '"shall publish an annual report by March 1" → "may publish periodic reports as it deems appropriate"', effect: { en: "Enforceable deadline replaced with open-ended discretion", es: "Plazo ejecutable reemplazado por discreción abierta", zh: "可执行的截止日期被开放式自由裁量取代", ja: "強制力のある期限が無期限の裁量に置換", he: "מועד אכיף הוחלף בשיקול דעת פתוח" } },
    ],
  },
};

const Landing = () => {
  const navigate = useNavigate();
  const [shift, setShift] = useState<ShiftKey>("all");
  const [lang, setLang] = useState<LangKey>("en");

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    }
  }, []);

  const demo = useMemo(() => DEMO_DATA[shift], [shift]);
  const isRtl = lang === "he";

  return (
    <div className="min-h-dvh bg-background p-6 md:p-10 max-w-3xl mx-auto">
      <header className="mb-14">
        <h1 className="font-semibold tracking-tight font-mono text-[2rem] md:text-[2.5rem]" style={{ lineHeight: 1.2 }}>
          Structural Language Comparison Tool
        </h1>
        <p className="text-muted-foreground text-sm mt-3 max-w-2xl leading-[1.8]">
          Structural change detection for revised documents.
        </p>

        <div className="mt-8">
          <button
            onClick={() => navigate("/tool")}
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Open the tool
          </button>
        </div>
      </header>

      <section className="mb-14">
        <h2 className="text-xl font-semibold font-mono mb-4">What it does</h2>
        <p className="text-sm text-muted-foreground leading-[1.8] mb-3 max-w-2xl">
          Language Structure Comparison analyzes two versions of text and identifies structural changes that alter obligations, authority, scope, measurable standards, or required actions.
        </p>
        <p className="text-sm text-muted-foreground leading-[1.8] max-w-2xl">
          The tool does not interpret intent or provide legal advice. It highlights structural differences that may change how a rule operates.
        </p>
      </section>

      <section id="how-it-works" className="mb-14 scroll-mt-8">
        <h2 className="text-xl font-semibold font-mono mb-4">How it works</h2>
        <p className="text-sm text-muted-foreground leading-[1.8] mb-4 max-w-2xl">
          The tool evaluates six categories of structural change:
        </p>
        <ul className="text-sm text-muted-foreground space-y-2.5 max-w-2xl leading-[1.8]">
          <li>• Modality Shift — A change in how strong a rule is (for example, "shall" becoming "may").</li>
          <li>• Scope Change — A change in who or what the rule applies to.</li>
          <li>• Actor Power Shift — A change in who has authority or responsibility.</li>
          <li>• Action Domain Shift — A change in the type of action required.</li>
          <li>• Threshold / Standard Shift — A change in a measurable requirement such as time, quantity, or duration.</li>
          <li>• Obligation Removal — A duty or requirement that has been deleted or weakened.</li>
        </ul>
      </section>

      <section className="mb-14">
        <h2 className="text-xl font-semibold font-mono mb-4">Example</h2>

        {/* Control row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Shift</label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value as ShiftKey)}
              className="w-full rounded-md border border-border bg-card text-foreground text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {SHIFT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Explanation language</label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as LangKey)}
              className="w-full rounded-md border border-border bg-card text-foreground text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {LANG_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sample card */}
        <div className="rounded-lg border border-border bg-card p-5 font-mono text-sm space-y-4">
          <div>
            <span className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Original</span>
            <span className="text-foreground leading-[1.8]">{demo.original}</span>
          </div>
          <div className="border-t border-border pt-4">
            <span className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Revised</span>
            <span className="text-foreground leading-[1.8]">{demo.revised}</span>
          </div>
          <div className="border-t border-border pt-4">
            <span className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Operational Effect</span>
            <span className={`text-foreground leading-[1.8] block ${isRtl ? "text-right" : ""}`} dir={isRtl ? "rtl" : "ltr"}>
              {demo.operationalEffect[lang]}
            </span>
          </div>
        </div>

        {/* Detected changes card */}
        <div className="mt-4 rounded-lg border border-border bg-card p-5">
          <span className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Detected changes</span>
          <div className="flex flex-wrap gap-2 mb-3">
            {demo.changes.map((c) => (
              <span key={c.category} className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-changed-bg text-changed border border-changed-border">
                {c.category}
              </span>
            ))}
          </div>
          <ul className="text-sm text-foreground space-y-2.5">
            {demo.changes.map((c) => (
              <li key={c.category} className="flex items-start gap-2">
                <span className="text-changed mt-0.5">•</span>
                <span>
                  <span className="font-medium">{c.category}</span> — {c.detail}
                  <br />
                  <span className={`text-muted-foreground text-xs ${isRtl ? "text-right block" : ""}`} dir={isRtl ? "rtl" : "ltr"}>
                    {c.effect[lang]}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-10 rounded-lg border border-border bg-muted/50 p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          API keys are stored server-side. Do not paste sensitive personal data.
        </p>
      </section>
    </div>
  );
};

export default Landing;
