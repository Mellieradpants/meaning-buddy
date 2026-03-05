import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ShiftKey = "all" | "modality" | "action_domain" | "threshold" | "actor_power" | "obligation" | "scope" | "enforcement";
type LangKey = "en" | "es" | "fr" | "de" | "ru" | "zh" | "he";

const SHIFT_OPTIONS: { value: ShiftKey; label: string }[] = [
  { value: "all", label: "All shifts" },
  { value: "modality", label: "Modality Shift" },
  { value: "action_domain", label: "Action Domain Shift" },
  { value: "threshold", label: "Threshold / Standard Shift" },
  { value: "actor_power", label: "Actor Power Shift" },
  { value: "obligation", label: "Obligation Removal" },
  { value: "scope", label: "Scope Change" },
  { value: "enforcement", label: "Enforcement Modification" },
];

const LANG_OPTIONS: { value: LangKey; label: string }[] = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ru", label: "Russian" },
  { value: "zh", label: "Chinese (Simplified)" },
  { value: "he", label: "Hebrew" },
];

interface DemoEntry {
  category: string;
  detail: string;
  effect: Record<LangKey, string>;
}

const DEMO_DATA: Partial<Record<ShiftKey, { original: string; revised: string; operationalEffect: Record<LangKey, string>; changes: DemoEntry[] }>> = {
  modality: {
    original: "The contractor shall complete all safety inspections before occupancy is granted.",
    revised: "The contractor may complete safety inspections before occupancy is granted.",
    operationalEffect: {
      en: "Mandatory safety inspections become optional. The contractor now has discretion over whether inspections occur before occupancy, removing a previously binding requirement.",
      es: "Las inspecciones de seguridad obligatorias se vuelven opcionales. El contratista ahora tiene discreción sobre si las inspecciones ocurren antes de la ocupación, eliminando un requisito previamente vinculante.",
      fr: "Les inspections de sécurité obligatoires deviennent facultatives. L'entrepreneur a désormais le pouvoir discrétionnaire de décider si les inspections ont lieu avant l'occupation, supprimant une exigence auparavant contraignante.",
      de: "Pflicht-Sicherheitsinspektionen werden optional. Der Auftragnehmer hat nun Ermessensspielraum, ob Inspektionen vor der Belegung stattfinden, wodurch eine zuvor verbindliche Anforderung entfällt.",
      zh: "强制性安全检查变为可选。承包商现在可以自行决定是否在入住前进行检查，取消了之前的强制性要求。",
      he: "בדיקות בטיחות חובה הופכות לאופציונליות. לקבלן יש כעת שיקול דעת אם הבדיקות יתקיימו לפני האכלוס, מה שמסיר דרישה שהייתה מחייבת בעבר.",
      ru: "Обязательные проверки безопасности становятся необязательными. Подрядчик теперь сам решает, проводить ли проверки до заселения, устраняя ранее обязательное требование.",
    },
    changes: [
      { category: "Modality Shift", detail: '"shall complete" → "may complete"', effect: { en: "Binding duty weakened to permission", es: "Deber vinculante debilitado a permiso", fr: "Devoir contraignant affaibli en permission", de: "Verbindliche Pflicht zu Erlaubnis abgeschwächt", zh: "约束性义务弱化为许可", he: "חובה מחייבת הוחלשה להרשאה", ru: "Обязывающая обязанность ослаблена до разрешения" } },
    ],
  },
  action_domain: {
    original: "The agency shall investigate all consumer complaints within 10 business days.",
    revised: "The agency shall review consumer complaints and may refer them for further evaluation.",
    operationalEffect: {
      en: "The required action shifts from 'investigate' to 'review,' a significantly less rigorous process. The fixed 10-day timeline is removed, and referral for further evaluation is discretionary.",
      es: "La acción requerida cambia de 'investigar' a 'revisar', un proceso significativamente menos riguroso. Se elimina el plazo fijo de 10 días y la derivación para evaluación adicional es discrecional.",
      fr: "L'action requise passe de 'enquêter' à 'examiner', un processus nettement moins rigoureux. Le délai fixe de 10 jours est supprimé et le renvoi pour évaluation complémentaire est discrétionnaire.",
      de: "Die erforderliche Maßnahme ändert sich von 'untersuchen' zu 'prüfen', einem deutlich weniger strengen Verfahren. Die feste 10-Tage-Frist entfällt und die Weiterleitung zur weiteren Bewertung ist ermessensabhängig.",
      zh: "所需行动从\u2018调查\u2019转变为\u2018审查\u2019，这是一个显著不那么严格的过程。固定的10天时限被取消，转交进一步评估是自由裁量的。",
      he: "הפעולה הנדרשת משתנה מ'חקירה' ל'סקירה', תהליך פחות קפדני בהרבה. לוח הזמנים הקבוע של 10 ימים מוסר, וההפניה להערכה נוספת היא לפי שיקול דעת.",
      ru: "Требуемое действие меняется с 'расследовать' на 'рассмотреть' — значительно менее строгий процесс. Фиксированный 10-дневный срок отменён, а направление на дополнительную оценку является дискреционным.",
    },
    changes: [
      { category: "Action Domain Shift", detail: '"investigate" → "review … may refer"', effect: { en: "Rigorous investigation replaced with lighter review", es: "Investigación rigurosa reemplazada por revisión más ligera", fr: "Enquête rigoureuse remplacée par un examen plus léger", de: "Gründliche Untersuchung durch leichtere Prüfung ersetzt", zh: "严格调查被较轻的审查取代", he: "חקירה קפדנית הוחלפה בסקירה קלה יותר", ru: "Тщательное расследование заменено более лёгким рассмотрением" } },
    ],
  },
  actor_power: {
    original: "An independent review board shall approve all research protocols before trials begin.",
    revised: "The project director may approve research protocols before trials begin.",
    operationalEffect: {
      en: "Approval authority shifts from an independent review board to the project director — a party with a potential conflict of interest. Independent oversight is eliminated.",
      es: "La autoridad de aprobación pasa de una junta de revisión independiente al director del proyecto, una parte con un posible conflicto de intereses. Se elimina la supervisión independiente.",
      fr: "L'autorité d'approbation passe d'un comité de révision indépendant au directeur de projet — une partie potentiellement en conflit d'intérêts. La supervision indépendante est éliminée.",
      de: "Die Genehmigungsbefugnis verlagert sich von einem unabhängigen Prüfungsausschuss auf den Projektleiter — eine Partei mit potenziellem Interessenkonflikt. Die unabhängige Aufsicht entfällt.",
      zh: "审批权从独立审查委员会转移到项目主管——一个可能存在利益冲突的一方。独立监督被取消。",
      he: "סמכות האישור עוברת מוועדת ביקורת עצמאית למנהל הפרויקט — גורם עם ניגוד עניינים פוטנציאלי. הפיקוח העצמאי מבוטל.",
      ru: "Полномочия по утверждению переходят от независимого наблюдательного совета к руководителю проекта — стороне с потенциальным конфликтом интересов. Независимый надзор устраняется.",
    },
    changes: [
      { category: "Actor Power Shift", detail: '"independent review board shall" → "project director may"', effect: { en: "Independent oversight replaced by internal discretion", es: "Supervisión independiente reemplazada por discreción interna", fr: "Surveillance indépendante remplacée par discrétion interne", de: "Unabhängige Aufsicht durch internes Ermessen ersetzt", zh: "独立监督被内部自由裁量取代", he: "פיקוח עצמאי הוחלף בשיקול דעת פנימי", ru: "Независимый надзор заменён внутренним усмотрением" } },
    ],
  },
  all: {
    original: "The employer shall provide health insurance to all full-time employees within 30 days of their start date.",
    revised: "The employer may provide health insurance to eligible employees within a reasonable timeframe.",
    operationalEffect: {
      en: "Health insurance is no longer guaranteed. The employer can now decide whether to offer it. Coverage no longer extends to all full-time employees — only those deemed eligible. The fixed 30-day deadline no longer applies.",
      es: "El seguro de salud ya no está garantizado. El empleador ahora puede decidir si lo ofrece. La cobertura ya no se extiende a todos los empleados a tiempo completo, solo a los considerados elegibles. El plazo fijo de 30 días ya no aplica.",
      fr: "L'assurance maladie n'est plus garantie. L'employeur peut désormais décider s'il la propose. La couverture ne s'étend plus à tous les employés à temps plein — uniquement à ceux jugés éligibles. Le délai fixe de 30 jours ne s'applique plus.",
      de: "Die Krankenversicherung ist nicht mehr garantiert. Der Arbeitgeber kann nun entscheiden, ob er sie anbietet. Der Versicherungsschutz erstreckt sich nicht mehr auf alle Vollzeitbeschäftigten — nur auf als berechtigt eingestufte Mitarbeiter. Die feste 30-Tage-Frist gilt nicht mehr.",
      zh: "健康保险不再有保障。雇主现在可以决定是否提供。覆盖范围不再延伸至所有全职员工——仅限于被认为符合条件的人。30天的固定期限不再适用。",
      he: "ביטוח הבריאות אינו מובטח עוד. המעסיק יכול כעת להחליט אם להציע אותו. הכיסוי אינו חל עוד על כל העובדים במשרה מלאה — רק על מי שנחשב זכאי. המועד הקבוע של 30 יום אינו חל עוד.",
      ru: "Медицинское страхование больше не гарантировано. Работодатель теперь может решать, предоставлять ли его. Покрытие больше не распространяется на всех штатных сотрудников — только на тех, кто признан имеющим право. Фиксированный 30-дневный срок больше не применяется.",
    },
    changes: [
      { category: "Modality Shift", detail: '"shall provide" → "may provide"', effect: { en: "Mandatory obligation weakened to discretionary", es: "Obligación obligatoria debilitada a discrecional", fr: "Obligation impérative affaiblie en discrétionnaire", de: "Verbindliche Pflicht zu Ermessensentscheidung abgeschwächt", zh: "强制性义务弱化为自由裁量", he: "חובה מחייבת הוחלשה לשיקול דעת", ru: "Обязательное обязательство ослаблено до дискреционного" } },
      { category: "Scope Change", detail: '"all full-time employees" → "eligible employees"', effect: { en: "Coverage narrowed to a subset", es: "Cobertura reducida a un subgrupo", fr: "Couverture réduite à un sous-ensemble", de: "Deckung auf eine Teilgruppe eingeschränkt", zh: "覆盖范围缩小到一个子集", he: "הכיסוי צומצם לתת-קבוצה", ru: "Покрытие сужено до подгруппы" } },
      { category: "Threshold Shift", detail: '"within 30 days" → "within a reasonable timeframe"', effect: { en: "Fixed deadline replaced with subjective standard", es: "Plazo fijo reemplazado por estándar subjetivo", fr: "Délai fixe remplacé par un critère subjectif", de: "Feste Frist durch subjektiven Maßstab ersetzt", zh: "固定期限被主观标准取代", he: "מועד קבוע הוחלף בסטנדרט סובייקטיבי", ru: "Фиксированный срок заменён субъективным стандартом" } },
      { category: "Obligation Removal", detail: "Mandatory duty weakened to discretionary", effect: { en: "Core obligation effectively removed", es: "Obligación esencial efectivamente eliminada", fr: "Obligation fondamentale effectivement supprimée", de: "Kernpflicht faktisch aufgehoben", zh: "核心义务实际上已取消", he: "חובה מרכזית הוסרה למעשה", ru: "Основное обязательство фактически устранено" } },
    ],
  },
  threshold: {
    original: "The client shall pay all invoices within 15 days of receipt.",
    revised: "Invoices must be paid within 45 days unless otherwise agreed in writing by the provider.",
    operationalEffect: {
      en: "Payment deadline extended from 15 to 45 days. A written exception clause allows further extension at the provider's discretion.",
      es: "El plazo de pago se extiende de 15 a 45 días. Una cláusula de excepción escrita permite una extensión adicional a discreción del proveedor.",
      fr: "Le délai de paiement est prolongé de 15 à 45 jours. Une clause d'exception écrite permet une prolongation supplémentaire à la discrétion du prestataire.",
      de: "Die Zahlungsfrist wurde von 15 auf 45 Tage verlängert. Eine schriftliche Ausnahmeklausel ermöglicht eine weitere Verlängerung nach Ermessen des Anbieters.",
      zh: "付款期限从15天延长至45天。书面例外条款允许供应商酌情进一步延长。",
      he: "מועד התשלום הוארך מ-15 ל-45 יום. סעיף חריג בכתב מאפשר הארכה נוספת לפי שיקול דעת הספק.",
      ru: "Срок оплаты увеличен с 15 до 45 дней. Письменная оговорка позволяет дальнейшее продление по усмотрению поставщика.",
    },
    changes: [
      { category: "Threshold Shift", detail: '"within 15 days" → "within 45 days"', effect: { en: "Payment window tripled", es: "Ventana de pago triplicada", fr: "Fenêtre de paiement triplée", de: "Zahlungsfenster verdreifacht", zh: "付款窗口增加了三倍", he: "חלון התשלום שולש", ru: "Окно оплаты утроено" } },
    ],
  },
  obligation: {
    original: "A notice of appeal shall be filed within 30 days of the court's final judgment.",
    revised: "A notice of appeal may be filed within 60 days after the entry of final judgment.",
    operationalEffect: {
      en: "Filing an appeal changes from mandatory to optional. The deadline doubles from 30 to 60 days.",
      es: "Presentar una apelación cambia de obligatorio a opcional. El plazo se duplica de 30 a 60 días.",
      fr: "Le dépôt d'un appel passe d'obligatoire à facultatif. Le délai double, passant de 30 à 60 jours.",
      de: "Die Einlegung einer Berufung ändert sich von verpflichtend zu optional. Die Frist verdoppelt sich von 30 auf 60 Tage.",
      zh: "提起上诉从强制变为可选。期限从30天增加到60天。",
      he: "הגשת ערעור משתנה מחובה לאופציונלית. המועד מוכפל מ-30 ל-60 יום.",
      ru: "Подача апелляции меняется с обязательной на необязательную. Срок удваивается с 30 до 60 дней.",
    },
    changes: [
      { category: "Obligation Removal", detail: '"shall be filed" → "may be filed"', effect: { en: "Mandatory filing weakened to optional", es: "Presentación obligatoria debilitada a opcional", fr: "Dépôt obligatoire affaibli en facultatif", de: "Pflichteinreichung zu optional abgeschwächt", zh: "强制提交弱化为可选", he: "הגשה חובה הוחלשה לאופציונלית", ru: "Обязательная подача ослаблена до необязательной" } },
    ],
  },
  scope: {
    original: "This policy covers all diagnostic imaging ordered by a licensed physician.",
    revised: "Coverage may be provided for certain diagnostic imaging procedures when deemed medically necessary.",
    operationalEffect: {
      en: "Coverage narrows from all diagnostic imaging to only certain procedures deemed medically necessary. Discretion is introduced where none existed.",
      es: "La cobertura se reduce de todas las imágenes diagnósticas a solo ciertos procedimientos considerados médicamente necesarios. Se introduce discreción donde no existía.",
      fr: "La couverture se réduit de toute l'imagerie diagnostique à certaines procédures jugées médicalement nécessaires. Un pouvoir discrétionnaire est introduit là où il n'existait pas.",
      de: "Die Deckung verengt sich von der gesamten diagnostischen Bildgebung auf bestimmte als medizinisch notwendig erachtete Verfahren. Ermessensspielraum wird eingeführt, wo keiner bestand.",
      zh: "覆盖范围从所有诊断影像缩小到仅某些被认为医学上必要的程序。引入了之前不存在的自由裁量权。",
      he: "הכיסוי מצטמצם מכל הדימות האבחנתי לנהלים מסוימים בלבד הנחשבים נחוצים רפואית. שיקול דעת מוכנס היכן שלא היה קיים.",
      ru: "Покрытие сужается от всей диагностической визуализации до определённых процедур, признанных медицински необходимыми. Вводится усмотрение там, где его не было.",
    },
    changes: [
      { category: "Scope Change", detail: '"all diagnostic imaging" → "certain diagnostic imaging procedures"', effect: { en: "Broad coverage narrowed to selective subset", es: "Cobertura amplia reducida a subgrupo selectivo", fr: "Couverture large réduite à un sous-ensemble sélectif", de: "Breite Deckung auf selektive Teilmenge eingeschränkt", zh: "广泛覆盖缩小到选择性子集", he: "כיסוי רחב צומצם לתת-קבוצה סלקטיבית", ru: "Широкое покрытие сужено до избранной подгруппы" } },
    ],
  },
  enforcement: {
    original: "The Department shall publish an annual environmental impact report by March 1 of each year.",
    revised: "The Department may publish periodic environmental impact reports as it deems appropriate.",
    operationalEffect: {
      en: "The fixed annual deadline is removed. Publication frequency and timing become discretionary. The public loses a guaranteed reporting schedule.",
      es: "Se elimina el plazo anual fijo. La frecuencia y el momento de publicación se vuelven discrecionales. El público pierde un calendario de informes garantizado.",
      fr: "Le délai annuel fixe est supprimé. La fréquence et le calendrier de publication deviennent discrétionnaires. Le public perd un calendrier de rapports garanti.",
      de: "Die feste jährliche Frist wird aufgehoben. Veröffentlichungshäufigkeit und -zeitpunkt werden ermessensabhängig. Die Öffentlichkeit verliert einen garantierten Berichtszeitplan.",
      zh: "固定的年度截止日期被取消。发布频率和时间变为自由裁量。公众失去了有保障的报告时间表。",
      he: "המועד השנתי הקבוע מוסר. תדירות ועיתוי הפרסום הופכים לשיקול דעת. הציבור מאבד לוח זמנים מובטח לדיווח.",
      ru: "Фиксированный годовой срок отменён. Частота и сроки публикации становятся дискреционными. Общественность теряет гарантированный график отчётности.",
    },
    changes: [
      { category: "Enforcement Modification", detail: '"shall publish an annual report by March 1" → "may publish periodic reports as it deems appropriate"', effect: { en: "Enforceable deadline replaced with open-ended discretion", es: "Plazo ejecutable reemplazado por discreción abierta", fr: "Délai exécutoire remplacé par un pouvoir discrétionnaire illimité", de: "Durchsetzbare Frist durch unbegrenztes Ermessen ersetzt", zh: "可执行的截止日期被开放式自由裁量取代", he: "מועד אכיף הוחלף בשיקול דעת פתוח", ru: "Исполнимый срок заменён неограниченным усмотрением" } },
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

  const demo = useMemo(() => DEMO_DATA[shift] ?? DEMO_DATA["all"]!, [shift]);
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
            <Select value={shift} onValueChange={(v) => setShift(v as ShiftKey)}>
              <SelectTrigger className="w-full bg-card text-foreground text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHIFT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Explanation language</label>
            <Select value={lang} onValueChange={(v) => setLang(v as LangKey)}>
              <SelectTrigger className="w-full bg-card text-foreground text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANG_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
