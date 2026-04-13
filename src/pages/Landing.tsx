import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SHIFT_OPTIONS, LANG_OPTIONS, RTL_LANGS, type ShiftKey, type LangKey } from "@/lib/sharedConfig";

type LangText = Partial<Record<LangKey, string>> & { en: string };

/** Look up text for a language, falling back to English */
function lt(map: LangText, lang: LangKey): string {
  return map[lang] ?? map.en;
}

interface DemoEntry {
  category: string;
  detail: string;
  effect: LangText;
}

interface DemoData {
  original: string;
  revised: string;
  operationalEffect: LangText;
  changes: DemoEntry[];
}

const DEMO_DATA: Partial<Record<ShiftKey, DemoData>> = {
  modality: {
    original: "The contractor shall complete all safety inspections before occupancy is granted.",
    revised: "The contractor may complete safety inspections before occupancy is granted.",
    operationalEffect: {
      en: "Mandatory safety inspections become optional. The contractor now has discretion over whether inspections occur before occupancy, removing a previously binding requirement.",
      es: "Las inspecciones de seguridad obligatorias se vuelven opcionales. El contratista ahora tiene discreción sobre si las inspecciones ocurren antes de la ocupación, eliminando un requisito previamente vinculante.",
      fr: "Les inspections de sécurité obligatoires deviennent facultatives. L'entrepreneur a désormais le pouvoir discrétionnaire de décider si les inspections ont lieu avant l'occupation, supprimant une exigence auparavant contraignante.",
      zh: "强制性安全检查变为可选。承包商现在可以自行决定是否在入住前进行检查，取消了之前的强制性要求。",
      ru: "Обязательные проверки безопасности становятся необязательными. Подрядчик теперь сам решает, проводить ли проверки до заселения, устраняя ранее обязательное требование.",
      ar: "تصبح عمليات التفتيش الإلزامية اختيارية. أصبح للمقاول حرية التصرف في إجراء عمليات التفتيش قبل الإشغال.",
    },
    changes: [
      { category: "Modality Shift", detail: '"shall complete" → "may complete"', effect: { en: "Binding duty weakened to permission", es: "Deber vinculante debilitado a permiso", fr: "Devoir contraignant affaibli en permission", zh: "约束性义务弱化为许可", ru: "Обязывающая обязанность ослаблена до разрешения", ar: "واجب ملزم تم إضعافه إلى إذن" } },
    ],
  },
  action_domain: {
    original: "The agency shall investigate all consumer complaints within 10 business days.",
    revised: "The agency shall review consumer complaints and may refer them for further evaluation.",
    operationalEffect: {
      en: "The required action shifts from 'investigate' to 'review,' a significantly less rigorous process. The fixed 10-day timeline is removed, and referral for further evaluation is discretionary.",
      es: "La acción requerida cambia de 'investigar' a 'revisar', un proceso significativamente menos riguroso. Se elimina el plazo fijo de 10 días y la derivación para evaluación adicional es discrecional.",
      fr: "L'action requise passe de 'enquêter' à 'examiner', un processus nettement moins rigoureux. Le délai fixe de 10 jours est supprimé et le renvoi pour évaluation complémentaire est discrétionnaire.",
      zh: "所需行动从'调查'转变为'审查'，这是一个显著不那么严格的过程。固定的10天时限被取消，转交进一步评估是自由裁量的。",
      ru: "Требуемое действие меняется с 'расследовать' на 'рассмотреть' — значительно менее строгий процесс. Фиксированный 10-дневный срок отменён, а направление на дополнительную оценку является дискреционным.",
      ar: "يتحول الإجراء المطلوب من 'التحقيق' إلى 'المراجعة'، وهي عملية أقل صرامة بشكل ملحوظ. تم إلغاء الجدول الزمني الثابت البالغ 10 أيام.",
    },
    changes: [
      { category: "Action Domain Shift", detail: '"investigate" → "review … may refer"', effect: { en: "Rigorous investigation replaced with lighter review", es: "Investigación rigurosa reemplazada por revisión más ligera", fr: "Enquête rigoureuse remplacée par un examen plus léger", zh: "严格调查被较轻的审查取代", ru: "Тщательное расследование заменено более лёгким рассмотрением", ar: "تم استبدال التحقيق الصارم بمراجعة أخف" } },
    ],
  },
  actor_power: {
    original: "An independent review board shall approve all research protocols before trials begin.",
    revised: "The project director may approve research protocols before trials begin.",
    operationalEffect: {
      en: "Approval authority shifts from an independent review board to the project director — a party with a potential conflict of interest. Independent oversight is eliminated.",
      es: "La autoridad de aprobación pasa de una junta de revisión independiente al director del proyecto, una parte con un posible conflicto de intereses. Se elimina la supervisión independiente.",
      fr: "L'autorité d'approbation passe d'un comité de révision indépendant au directeur de projet — une partie potentiellement en conflit d'intérêts. La supervision indépendante est éliminée.",
      zh: "审批权从独立审查委员会转移到项目主管——一个可能存在利益冲突的一方。独立监督被取消。",
      ru: "Полномочия по утверждению переходят от независимого наблюдательного совета к руководителю проекта — стороне с потенциальным конфликтом интересов. Независимый надзор устраняется.",
      ar: "تنتقل سلطة الموافقة من مجلس مراجعة مستقل إلى مدير المشروع — طرف لديه تضارب محتمل في المصالح.",
    },
    changes: [
      { category: "Actor Power Shift", detail: '"independent review board shall" → "project director may"', effect: { en: "Independent oversight replaced by internal discretion", es: "Supervisión independiente reemplazada por discreción interna", fr: "Surveillance indépendante remplacée par discrétion interne", zh: "独立监督被内部自由裁量取代", ru: "Независимый надзор заменён внутренним усмотрением", ar: "تم استبدال الرقابة المستقلة بالسلطة التقديرية الداخلية" } },
    ],
  },
  all: {
    original: "The employer shall provide health insurance to all full-time employees within 30 days of their start date.",
    revised: "The employer may provide health insurance to eligible employees within a reasonable timeframe.",
    operationalEffect: {
      en: "Health insurance is no longer guaranteed. The employer can now decide whether to offer it. Coverage no longer extends to all full-time employees — only those deemed eligible. The fixed 30-day deadline no longer applies.",
      es: "El seguro de salud ya no está garantizado. El empleador ahora puede decidir si lo ofrece. La cobertura ya no se extiende a todos los empleados a tiempo completo, solo a los considerados elegibles. El plazo fijo de 30 días ya no aplica.",
      fr: "L'assurance maladie n'est plus garantie. L'employeur peut désormais décider s'il la propose. La couverture ne s'étend plus à tous les employés à temps plein — uniquement à ceux jugés éligibles. Le délai fixe de 30 jours ne s'applique plus.",
      zh: "健康保险不再有保障。雇主现在可以决定是否提供。覆盖范围不再延伸至所有全职员工——仅限于被认为符合条件的人。30天的固定期限不再适用。",
      ru: "Медицинское страхование больше не гарантировано. Работодатель теперь может решать, предоставлять ли его. Покрытие больше не распространяется на всех штатных сотрудников — только на тех, кто признан имеющим право. Фиксированный 30-дневный срок больше не применяется.",
      ar: "لم يعد التأمين الصحي مضموناً. يمكن لصاحب العمل الآن أن يقرر ما إذا كان سيقدمه. لم تعد التغطية تشمل جميع الموظفين بدوام كامل — فقط من يُعتبرون مؤهلين.",
    },
    changes: [
      { category: "Modality Shift", detail: '"shall provide" → "may provide"', effect: { en: "Mandatory obligation weakened to discretionary", es: "Obligación obligatoria debilitada a discrecional", fr: "Obligation impérative affaiblie en discrétionnaire", zh: "强制性义务弱化为自由裁量", ru: "Обязательное обязательство ослаблено до дискреционного", ar: "تم إضعاف الالتزام الإلزامي إلى تقديري" } },
      { category: "Scope Change", detail: '"all full-time employees" → "eligible employees"', effect: { en: "Coverage narrowed to a subset", es: "Cobertura reducida a un subgrupo", fr: "Couverture réduite à un sous-ensemble", zh: "覆盖范围缩小到一个子集", ru: "Покрытие сужено до подгруппы", ar: "تم تضييق التغطية إلى مجموعة فرعية" } },
      { category: "Threshold Shift", detail: '"within 30 days" → "within a reasonable timeframe"', effect: { en: "Fixed deadline replaced with subjective standard", es: "Plazo fijo reemplazado por estándar subjetivo", fr: "Délai fixe remplacé par un critère subjectif", zh: "固定期限被主观标准取代", ru: "Фиксированный срок заменён субъективным стандартом", ar: "تم استبدال الموعد النهائي الثابت بمعيار شخصي" } },
      { category: "Obligation Removal", detail: "Mandatory duty weakened to discretionary", effect: { en: "Core obligation effectively removed", es: "Obligación esencial efectivamente eliminada", fr: "Obligation fondamentale effectivement supprimée", zh: "核心义务实际上已取消", ru: "Основное обязательство фактически устранено", ar: "تمت إزالة الالتزام الأساسي فعلياً" } },
    ],
  },
  threshold: {
    original: "The client shall pay all invoices within 15 days of receipt.",
    revised: "Invoices must be paid within 45 days unless otherwise agreed in writing by the provider.",
    operationalEffect: {
      en: "Payment deadline extended from 15 to 45 days. A written exception clause allows further extension at the provider's discretion.",
      es: "El plazo de pago se extiende de 15 a 45 días. Una cláusula de excepción escrita permite una extensión adicional a discreción del proveedor.",
      fr: "Le délai de paiement est prolongé de 15 à 45 jours. Une clause d'exception écrite permet une prolongation supplémentaire à la discrétion du prestataire.",
      zh: "付款期限从15天延长至45天。书面例外条款允许供应商酌情进一步延长。",
      ru: "Срок оплаты увеличен с 15 до 45 дней. Письменная оговорка позволяет дальнейшее продление по усмотрению поставщика.",
      ar: "تم تمديد الموعد النهائي للدفع من 15 إلى 45 يوماً. يسمح شرط الاستثناء الكتابي بمزيد من التمديد.",
    },
    changes: [
      { category: "Threshold Shift", detail: '"within 15 days" → "within 45 days"', effect: { en: "Payment window tripled", es: "Ventana de pago triplicada", fr: "Fenêtre de paiement triplée", zh: "付款窗口增加了三倍", ru: "Окно оплаты утроено", ar: "تضاعفت نافذة الدفع ثلاث مرات" } },
    ],
  },
  obligation: {
    original: "A notice of appeal shall be filed within 30 days of the court's final judgment.",
    revised: "A notice of appeal may be filed within 60 days after the entry of final judgment.",
    operationalEffect: {
      en: "Filing an appeal changes from mandatory to optional. The deadline doubles from 30 to 60 days.",
      es: "Presentar una apelación cambia de obligatorio a opcional. El plazo se duplica de 30 a 60 días.",
      fr: "Le dépôt d'un appel passe d'obligatoire à facultatif. Le délai double, passant de 30 à 60 jours.",
      zh: "提起上诉从强制变为可选。期限从30天增加到60天。",
      ru: "Подача апелляции меняется с обязательной на необязательную. Срок удваивается с 30 до 60 дней.",
      ar: "يتحول تقديم الاستئناف من إلزامي إلى اختياري. يتضاعف الموعد النهائي من 30 إلى 60 يوماً.",
    },
    changes: [
      { category: "Obligation Removal", detail: '"shall be filed" → "may be filed"', effect: { en: "Mandatory filing weakened to optional", es: "Presentación obligatoria debilitada a opcional", fr: "Dépôt obligatoire affaibli en facultatif", zh: "强制提交弱化为可选", ru: "Обязательная подача ослаблена до необязательной", ar: "تم إضعاف التقديم الإلزامي إلى اختياري" } },
    ],
  },
  scope: {
    original: "This policy covers all diagnostic imaging ordered by a licensed physician.",
    revised: "Coverage may be provided for certain diagnostic imaging procedures when deemed medically necessary.",
    operationalEffect: {
      en: "Coverage narrows from all diagnostic imaging to only certain procedures deemed medically necessary. Discretion is introduced where none existed.",
      es: "La cobertura se reduce de todas las imágenes diagnósticas a solo ciertos procedimientos considerados médicamente necesarios. Se introduce discreción donde no existía.",
      fr: "La couverture se réduit de toute l'imagerie diagnostique à certaines procédures jugées médicalement nécessaires. Un pouvoir discrétionnaire est introduit là où il n'existait pas.",
      zh: "覆盖范围从所有诊断影像缩小到仅某些被认为医学上必要的程序。引入了之前不存在的自由裁量权。",
      ru: "Покрытие сужается от всей диагностической визуализации до определённых процедур, признанных медицински необходимыми. Вводится усмотрение там, где его не было.",
      ar: "تضيق التغطية من جميع التصوير التشخيصي إلى إجراءات معينة فقط تُعتبر ضرورية طبياً.",
    },
    changes: [
      { category: "Scope Change", detail: '"all diagnostic imaging" → "certain diagnostic imaging procedures"', effect: { en: "Broad coverage narrowed to selective subset", es: "Cobertura amplia reducida a subgrupo selectivo", fr: "Couverture large réduite à un sous-ensemble sélectif", zh: "广泛覆盖缩小到选择性子集", ru: "Широкое покрытие сужено до избранной подгруппы", ar: "تم تضييق التغطية الواسعة إلى مجموعة فرعية انتقائية" } },
    ],
  },

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
  const isRtl = RTL_LANGS.includes(lang);

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
            className="px-7 py-3.5 rounded-lg bg-primary text-primary-foreground text-base font-medium hover:bg-primary-hover transition-colors"
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
              {lt(demo.operationalEffect, lang)}
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
                    {lt(c.effect, lang)}
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
