export interface Sample {
  title: string;
  original: string;
  revised: string;
}

export const SAMPLES: Sample[] = [
  {
    title: "Employment Policy",
    original:
      "Employees shall receive employer-sponsored health insurance within 30 days of their start date.",
    revised:
      "The employer may offer health insurance benefits to eligible employees within a reasonable timeframe after hire.",
  },
  {
    title: "Government Regulation",
    original:
      "The Department shall publish an annual environmental impact report by March 1 of each year.",
    revised:
      "The Department may publish periodic environmental impact reports as it deems appropriate.",
  },
  {
    title: "Contract Payment Terms",
    original:
      "The client shall pay all invoices within 15 days of receipt.",
    revised:
      "Invoices must be paid within 45 days unless otherwise agreed in writing by the provider.",
  },
  {
    title: "Insurance Coverage",
    original:
      "This policy covers all diagnostic imaging ordered by a licensed physician.",
    revised:
      "Coverage may be provided for certain diagnostic imaging procedures when deemed medically necessary.",
  },
  {
    title: "University Policy",
    original:
      "Students must submit all assignment appeals within five business days of grade publication.",
    revised:
      "Students may submit assignment appeals within ten business days of grade publication.",
  },
  {
    title: "Legal Procedure",
    original:
      "A notice of appeal shall be filed within 30 days of the court's final judgment.",
    revised:
      "A notice of appeal may be filed within 60 days after the entry of final judgment.",
  },
];
