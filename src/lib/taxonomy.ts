/**
 * Structural Semantic Change Taxonomy — Version 0.1
 * Single source of truth for category keys, labels, sample scenarios, and summary phrases.
 *
 * NOTE: The key "threshold_shift" (not "threshold_standard_shift") is used to match
 * the edge-function enum returned by the API. The display label is "Threshold / Standard Shift".
 */

export const CATEGORIES = {
  modality_shift: "Modality Shift",
  action_domain_shift: "Action Domain Shift",
  threshold_shift: "Threshold / Standard Shift",
  actor_power_shift: "Actor Power Shift",
  obligation_removal: "Obligation Removal",
  scope_change: "Scope Change",
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

/** Plain-language phrases used in the auto-generated summary sentence. */
export const SUMMARY_PHRASES: Record<CategoryKey, string> = {
  modality_shift: "changes mandatory language to discretionary language",
  actor_power_shift: "shifts decision-making authority between parties",
  scope_change: "modifies the scope of what is covered",
  threshold_shift: "adjusts the standards or thresholds required",
  action_domain_shift: "changes the type of actions required",
  obligation_removal: "removes or weakens a previously stated obligation",
};

/** One representative sample per taxonomy category. */
export const SAMPLE_SCENARIOS: Record<CategoryKey, { original: string; revised: string }> = {
  modality_shift: {
    original: `The Organization shall conduct a comprehensive internal audit of all operational divisions no less than once per calendar quarter. Each audit shall include a full review of financial records, personnel conduct reports, and regulatory compliance documentation.

The Chief Compliance Officer shall submit a written report to the Board of Directors within thirty days of each audit's completion. This report shall detail all findings, corrective actions taken, and a timeline for resolution of outstanding issues.

All employees shall complete mandatory compliance training within sixty days of onboarding and shall recertify annually. Failure to complete training within the required timeframe shall result in suspension of access privileges.

The Organization shall maintain a centralized compliance register accessible to all department heads, updated in real time as new obligations are identified or existing obligations change.`,
    revised: `The Organization may conduct an internal review of selected operational divisions on a periodic basis as determined by management. Each review may include an examination of financial records, personnel conduct reports, and regulatory compliance documentation.

The Chief Compliance Officer may submit a summary to the Board of Directors at the next scheduled board meeting following any review. This summary may outline key findings and any recommended actions.

All employees are encouraged to complete compliance training within a reasonable timeframe following onboarding and are encouraged to participate in periodic refresher sessions. Access privileges will be managed according to departmental policy.

The Organization may maintain a compliance register accessible to relevant personnel, updated periodically as resources allow.`,
  },

  action_domain_shift: {
    original: `The Environmental Health and Safety team shall conduct on-site physical inspections of all manufacturing facilities on a monthly basis. Each inspection shall include air-quality sampling, noise-level measurement, and visual examination of safety equipment.

Inspectors shall use calibrated instrumentation to record all measurements, and results shall be entered into the facility's Environmental Monitoring System within twenty-four hours of collection. Deviations from permissible limits shall trigger immediate corrective action at the facility level.

All findings shall be compiled into a facility inspection report and submitted to the Regional Compliance Director. The Director shall review each report and authorize any necessary remediation activities before the next inspection cycle.

Training for inspection personnel shall consist of hands-on field certification renewed every two years, including supervised practice sessions at an accredited testing facility.`,
    revised: `The Environmental Health and Safety team shall conduct remote desktop reviews of facility self-assessment questionnaires submitted electronically by each manufacturing facility on a quarterly basis. Each review shall include analysis of self-reported data, document verification, and statistical trend assessment.

Analysts shall use the Organization's data analytics platform to evaluate submitted questionnaires, and results shall be summarized in a digital dashboard accessible to facility managers. Deviations from expected ranges shall trigger a request for additional documentation from the facility.

All findings shall be compiled into a quarterly trend report and distributed to the Regional Compliance Director via the compliance management portal. The Director shall flag items for follow-up discussion at the next quarterly review meeting.

Training for review personnel shall consist of online certification in data analysis methodologies renewed every three years, including completion of a proctored assessment module.`,
  },

  threshold_shift: {
    original: `A supplier shall be considered approved for inclusion on the Organization's vendor list upon achieving a quality audit score of ninety percent or higher, as assessed using the Organization's standardized supplier evaluation framework.

All incoming raw materials shall be inspected upon receipt. A shipment shall be accepted only if the defect rate is below one percent of the total units received. Shipments exceeding this threshold shall be returned to the supplier at the supplier's expense.

The Organization shall review supplier performance on a quarterly basis. Any supplier whose average quality score falls below eighty-five percent over two consecutive quarters shall be placed on probationary status and subject to increased inspection frequency.

Products shall undergo final quality inspection before release. A production lot shall be approved for shipment only when the measured failure rate is at or below zero point five percent, verified through statistical sampling of no fewer than two hundred units per lot.`,
    revised: `A supplier shall be considered approved for inclusion on the Organization's vendor list upon achieving a quality audit score of seventy-five percent or higher, as assessed using a streamlined supplier questionnaire.

All incoming raw materials shall be inspected on a sampling basis. A shipment shall be accepted if the defect rate is below five percent of the sampled units. Shipments exceeding this threshold shall be flagged for review by the receiving department.

The Organization shall review supplier performance on an annual basis. Any supplier whose average quality score falls below sixty percent over the trailing twelve-month period may be placed on a watch list for further evaluation.

Products shall undergo final quality inspection before release. A production lot shall be approved for shipment when the measured failure rate is at or below three percent, verified through sampling of no fewer than fifty units per lot.`,
  },

  actor_power_shift: {
    original: `The Information Security team shall be responsible for defining, implementing, and enforcing all cybersecurity policies across the Organization. This includes establishing access controls, monitoring network activity, and responding to security incidents.

The Information Security team shall conduct vulnerability assessments of all production systems on a monthly basis and shall remediate critical vulnerabilities within seventy-two hours of discovery. All remediation activities shall be documented and reported to the Chief Information Officer.

Department heads shall ensure that their staff complete the cybersecurity awareness training assigned by the Information Security team. The Information Security team shall track completion rates and follow up with non-compliant departments.

Budget allocation for cybersecurity tools, personnel, and training shall be determined by the Information Security team in coordination with the Chief Financial Officer, subject to approval by the executive leadership team.`,
    revised: `Each department head shall be responsible for defining, implementing, and enforcing cybersecurity practices within their respective departments, in alignment with general guidelines issued by the Information Security team. This includes managing access controls for departmental systems, monitoring department-level activity, and coordinating with the Information Security team during security incidents.

Each department shall conduct its own vulnerability assessments of departmental systems on a quarterly basis and shall remediate critical vulnerabilities within a timeframe determined by the department head. Remediation activities shall be documented internally within each department.

Department heads shall independently source and assign cybersecurity awareness training appropriate to their operational context. Completion tracking and follow-up shall be managed within each department.

Budget allocation for departmental cybersecurity tools, personnel, and training shall be determined by each department head within their existing operational budget, without requiring separate approval from the Information Security team or executive leadership.`,
  },

  obligation_removal: {
    original: `The Organization shall publish an annual sustainability report disclosing greenhouse gas emissions, water usage, waste generation, and progress toward published reduction targets. This report shall be prepared in accordance with the Global Reporting Initiative standards and shall be independently audited by a qualified third party.

The Chief Sustainability Officer shall present the report findings to the Board of Directors and to shareholders at the annual general meeting. The presentation shall include a detailed action plan for addressing any areas where targets were not met.

All business units shall submit quarterly environmental performance data to the Sustainability Office. The Sustainability Office shall verify each submission against operational records and shall follow up on discrepancies within fifteen business days.

The Organization shall maintain membership in at least two recognized industry sustainability initiatives and shall participate in their annual benchmarking programs. Results of benchmarking shall be disclosed in the sustainability report.`,
    revised: `The Organization may publish periodic updates on environmental initiatives through its corporate website or other channels at management's discretion. Updates may reference selected metrics where data is readily available.

The Chief Sustainability Officer may provide an informal briefing to the Board of Directors as scheduling permits. The briefing may include highlights of recent environmental programs.

Business units are encouraged to share environmental performance information with the Sustainability Office when practical. The Sustainability Office may review submitted data as resources allow.

The Organization may maintain voluntary affiliations with industry groups focused on sustainability topics.`,
  },

  scope_change: {
    original: `This policy applies to all employees, contractors, temporary staff, and third-party vendors who access, process, or store any organizational data, regardless of location, employment status, or department.

All covered individuals shall adhere to the data handling procedures outlined in this policy when working with personally identifiable information, financial records, health data, intellectual property, or any other category of sensitive information maintained by the Organization.

The Organization shall monitor compliance across all divisions, subsidiaries, and partner entities operating under the Organization's brand or contractual agreements. Monitoring shall include both scheduled reviews and unannounced spot checks.

Violations of this policy by any covered individual shall be subject to disciplinary action, up to and including termination of employment or contract, and may be reported to the relevant regulatory authority.`,
    revised: `This policy applies to full-time employees who access or process customer data within the Organization's primary business unit.

Covered employees shall adhere to the data handling procedures outlined in this policy when working with personally identifiable information maintained in the Organization's primary customer database.

The Organization shall monitor compliance within the primary business unit through scheduled quarterly reviews. Monitoring of subsidiary operations is addressed under separate policies maintained by each subsidiary.

Violations of this policy by covered employees shall be subject to disciplinary action as determined by the employee's direct supervisor and the Human Resources department.`,
  },
};
