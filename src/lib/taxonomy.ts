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
    original: `The Organization shall conduct a comprehensive internal audit of all operational divisions no less than once per calendar quarter. Each audit shall include a full review of financial records, personnel conduct reports, regulatory compliance documentation, and operational risk assessments. The scope of each audit shall be determined by the Chief Compliance Officer in consultation with the internal audit committee.

The Chief Compliance Officer shall submit a written report to the Board of Directors within thirty days of each audit's completion. This report shall detail all findings, corrective actions taken, a timeline for resolution of outstanding issues, and an assessment of systemic risks identified during the review period. The Board shall formally acknowledge receipt of each report and shall direct management to address any unresolved findings.

All employees shall complete mandatory compliance training within sixty days of onboarding and shall recertify annually through a standardized examination administered by the compliance department. Failure to complete training within the required timeframe shall result in immediate suspension of system access privileges and referral to the employee's direct supervisor for remedial action.

The Organization shall maintain a centralized compliance register accessible to all department heads, updated in real time as new regulatory obligations are identified or existing obligations are modified. Each entry in the register shall include the applicable regulatory citation, the responsible department, the compliance deadline, and the current status of implementation.

All divisions shall participate in the Organization's annual compliance effectiveness review. The review shall assess the adequacy of internal controls, the timeliness of corrective actions, and the overall compliance posture of each division against established benchmarks.`,
    revised: `The Organization may conduct an internal review of selected operational divisions on a periodic basis as determined by management. Each review may include an examination of financial records, personnel conduct reports, regulatory compliance documentation, and other materials deemed relevant by the reviewing team. The scope of each review may be adjusted based on available resources and management priorities.

The Chief Compliance Officer may submit a summary to the Board of Directors at the next scheduled board meeting following any review. This summary may outline key findings, any recommended actions, and general observations about operational conditions. The Board may discuss the summary as part of its regular agenda and may request additional information at its discretion.

All employees are encouraged to complete compliance training within a reasonable timeframe following onboarding and are encouraged to participate in periodic refresher sessions offered by the compliance department. Employees who have not completed training may be reminded by their department and may be asked to prioritize enrollment when scheduling permits.

The Organization may maintain a compliance register accessible to relevant personnel, updated periodically as resources allow. Entries in the register may include general descriptions of applicable obligations, the departments most likely affected, and approximate timeframes for action where known.

Divisions are encouraged to participate in periodic compliance reviews when invited. These reviews may examine selected aspects of internal controls and may result in recommendations for improvement that divisions can consider incorporating into their operational planning.`,
  },

  action_domain_shift: {
    original: `The Environmental Health and Safety team shall conduct on-site physical inspections of all manufacturing facilities on a monthly basis. Each inspection shall include air-quality sampling using calibrated monitoring equipment, noise-level measurement at designated stations throughout the facility, visual examination of all safety equipment, and documentation of any observable hazards in the work environment.

Inspectors shall use calibrated instrumentation to record all measurements during each facility visit. Results shall be entered into the facility's Environmental Monitoring System within twenty-four hours of collection. Deviations from permissible limits established by applicable regulatory standards shall trigger immediate corrective action at the facility level, including temporary shutdown of affected operations if necessary.

All findings from physical inspections shall be compiled into a facility inspection report and submitted to the Regional Compliance Director within five business days of the inspection. The Director shall review each report, authorize any necessary remediation activities, and confirm that corrective measures have been implemented before the next scheduled inspection cycle begins.

Training for inspection personnel shall consist of hands-on field certification renewed every two years. Certification shall include supervised practice sessions at an accredited testing facility, proficiency testing on all required instrumentation, and demonstrated competence in hazard identification through direct observation of active manufacturing processes.

The Organization shall maintain a complete inventory of all inspection instrumentation, including calibration records, maintenance history, and chain-of-custody documentation. Instruments that fail calibration checks shall be removed from service immediately and shall not be returned until recertified by an accredited calibration laboratory.`,
    revised: `The Environmental Health and Safety team shall conduct remote desktop reviews of facility self-assessment questionnaires submitted electronically by each manufacturing facility on a quarterly basis. Each review shall include analysis of self-reported data on air quality, noise levels, and safety equipment status, along with document verification and statistical trend assessment based on the submitted information.

Analysts shall use the Organization's data analytics platform to evaluate submitted questionnaires and supporting documentation. Results shall be summarized in a digital dashboard accessible to facility managers and updated within ten business days of each submission deadline. Deviations from expected data ranges shall trigger a request for additional documentation from the facility, including supplementary data tables and written explanations of anomalies.

All findings from desktop reviews shall be compiled into a quarterly trend report and distributed to the Regional Compliance Director via the compliance management portal. The Director shall flag items for follow-up discussion at the next quarterly review meeting and shall document any agreed-upon action items in the portal for tracking purposes.

Training for review personnel shall consist of online certification in data analysis methodologies renewed every three years. Certification shall include completion of a proctored assessment module covering statistical techniques, data validation procedures, and interpretation of self-reported environmental metrics.

The Organization shall maintain a digital repository of all submitted questionnaires, supporting documentation, and trend reports. The repository shall be organized by facility and reporting period, with automated retention schedules applied in accordance with the Organization's records management policy.`,
  },

  threshold_shift: {
    original: `A supplier shall be considered approved for inclusion on the Organization's vendor list upon achieving a quality audit score of ninety percent or higher, as assessed using the Organization's standardized supplier evaluation framework. The evaluation shall cover manufacturing processes, quality management systems, regulatory compliance history, and financial stability indicators. Audits shall be conducted by certified assessors from the Organization's procurement quality team.

All incoming raw materials shall be inspected upon receipt at the Organization's receiving facility. A shipment shall be accepted only if the defect rate is below one percent of the total units received, as determined through inspection of every unit in the shipment. Shipments exceeding this threshold shall be rejected and returned to the supplier at the supplier's expense within five business days, accompanied by a detailed deficiency report.

The Organization shall review supplier performance on a quarterly basis using data from incoming inspections, production yield records, and customer complaint reports. Any supplier whose average quality score falls below eighty-five percent over two consecutive quarters shall be placed on probationary status and shall be subject to increased inspection frequency, including unannounced on-site audits at the supplier's facility.

Products shall undergo final quality inspection before release to distribution. A production lot shall be approved for shipment only when the measured failure rate is at or below zero point five percent, verified through statistical sampling of no fewer than two hundred units per lot. Lots that exceed the failure threshold shall be quarantined and subjected to full inspection before any disposition decision is made.

All quality records, including inspection results, supplier audit reports, and corrective action documentation, shall be retained for a minimum of seven years and shall be available for review by regulatory authorities upon request.`,
    revised: `A supplier shall be considered approved for inclusion on the Organization's vendor list upon achieving a quality audit score of seventy-five percent or higher, as assessed using a streamlined supplier questionnaire. The questionnaire shall cover basic manufacturing capabilities, general quality practices, and a self-certification of regulatory compliance. Questionnaires shall be reviewed by the procurement department during the regular vendor onboarding process.

All incoming raw materials shall be inspected on a sampling basis at the Organization's receiving facility. A shipment shall be accepted if the defect rate is below five percent of the sampled units, as determined through inspection of a representative sample selected by the receiving team. Shipments exceeding this threshold shall be flagged for review by the receiving department, and the supplier shall be notified of the findings within fifteen business days.

The Organization shall review supplier performance on an annual basis using data from incoming sample inspections and general production records. Any supplier whose average quality score falls below sixty percent over the trailing twelve-month period may be placed on a watch list for further evaluation at the next annual review. Additional monitoring measures may be considered on a case-by-case basis.

Products shall undergo final quality inspection before release to distribution. A production lot shall be approved for shipment when the measured failure rate is at or below three percent, verified through sampling of no fewer than fifty units per lot. Lots that exceed the threshold shall be documented and referred to the production supervisor for a disposition recommendation.

Quality records, including sample inspection results and supplier questionnaire responses, shall be retained for a minimum of three years and shall be available for internal review upon request from the quality assurance department.`,
  },

  actor_power_shift: {
    original: `The Information Security team shall be responsible for defining, implementing, and enforcing all cybersecurity policies across the Organization. This includes establishing access controls for all information systems, monitoring network activity across all divisions, responding to security incidents at every level of the Organization, and maintaining the Organization's security architecture documentation.

The Information Security team shall conduct vulnerability assessments of all production systems on a monthly basis and shall remediate critical vulnerabilities within seventy-two hours of discovery. All remediation activities shall be documented in the centralized security incident management system and reported to the Chief Information Officer within five business days. The team shall also produce a monthly security posture report for distribution to the executive leadership team.

Department heads shall ensure that their staff complete the cybersecurity awareness training program assigned and administered by the Information Security team. The Information Security team shall set the training curriculum, establish completion deadlines, track participation rates across all departments, and follow up directly with non-compliant departments to ensure timely completion.

Budget allocation for all cybersecurity tools, personnel, and training programs across the Organization shall be determined by the Information Security team in coordination with the Chief Financial Officer, subject to final approval by the executive leadership team. Departments shall not procure security-related tools or services independently without prior written authorization from the Information Security team.

The Information Security team shall maintain sole authority over the Organization's incident response plan, including the authority to direct operational changes across any department during an active security incident. All departments shall comply with directives issued by the Information Security team during incident response operations.`,
    revised: `Each department head shall be responsible for defining, implementing, and enforcing cybersecurity practices within their respective departments, in alignment with general guidelines issued by the Information Security team. This includes managing access controls for departmental systems, monitoring department-level network activity, coordinating with the Information Security team during cross-departmental security incidents, and maintaining documentation of departmental security configurations.

Each department shall conduct its own vulnerability assessments of departmental systems on a quarterly basis and shall remediate critical vulnerabilities within a timeframe determined by the department head based on operational priorities. Remediation activities shall be documented internally within each department's records. Departments may share summary reports with the Information Security team upon request.

Department heads shall independently source and assign cybersecurity awareness training appropriate to their operational context and the specific risk profile of their staff. Completion tracking and follow-up for training participation shall be managed within each department using the department's existing administrative processes.

Budget allocation for departmental cybersecurity tools, personnel, and training shall be determined by each department head within their existing operational budget. Departments may procure security-related tools and services that meet their operational needs without requiring separate approval from the Information Security team or the executive leadership team.

During security incidents affecting a single department, the department head shall direct the response effort and may request advisory support from the Information Security team. For incidents affecting multiple departments, the affected department heads shall coordinate among themselves, with the Information Security team available in a consultative capacity.`,
  },

  obligation_removal: {
    original: `The Organization shall publish an annual sustainability report disclosing greenhouse gas emissions, water usage, waste generation, energy consumption, and progress toward published reduction targets for each metric. This report shall be prepared in accordance with the Global Reporting Initiative standards and shall be independently audited by a qualified third party selected through the Organization's standard procurement process.

The Chief Sustainability Officer shall present the report findings to the Board of Directors and to shareholders at the annual general meeting. The presentation shall include a detailed action plan for addressing any areas where targets were not met, projected resource requirements for the coming year, and a timeline for achieving stated environmental objectives.

All business units shall submit quarterly environmental performance data to the Sustainability Office using standardized reporting templates. The Sustainability Office shall verify each submission against operational records, utility invoices, and waste manifests, and shall follow up on discrepancies within fifteen business days of receipt. Verified data shall be entered into the Organization's environmental performance database.

The Organization shall maintain membership in at least two recognized industry sustainability initiatives and shall participate in their annual benchmarking programs. Results of benchmarking activities shall be disclosed in the sustainability report, including the Organization's ranking or percentile position relative to industry peers where such information is made available by the initiative.

The Organization shall set and publish annual environmental performance targets for greenhouse gas reduction, water conservation, and waste diversion. These targets shall be approved by the Board of Directors and shall be communicated to all employees, contractors, and key suppliers within thirty days of Board approval.`,
    revised: `The Organization may publish periodic updates on environmental initiatives through its corporate website or other communication channels at management's discretion. Updates may reference selected metrics where data is readily available and may highlight notable environmental programs or achievements.

The Chief Sustainability Officer may provide an informal briefing to the Board of Directors as scheduling permits. The briefing may include highlights of recent environmental programs, general observations about the Organization's environmental posture, and any topics the Officer considers noteworthy for Board awareness.

Business units are encouraged to share environmental performance information with the Sustainability Office when practical and when doing so does not create undue administrative burden. The Sustainability Office may review submitted data as resources allow and may provide feedback to contributing business units on a best-effort basis.

The Organization may maintain voluntary affiliations with industry groups focused on sustainability topics. Participation in benchmarking or peer comparison activities shall be at management's discretion and results need not be disclosed externally.

The Organization may identify general environmental priorities from time to time and may communicate them internally through existing channels. Formal target-setting and Board-level approval of environmental objectives are not required under this policy.`,
  },

  scope_change: {
    original: `This policy applies to all employees, contractors, temporary staff, and third-party vendors who access, process, or store any organizational data, regardless of location, employment status, or department. Coverage extends to all personnel operating under the Organization's authority, including those working remotely, at client sites, or through subsidiary and affiliate entities.

All covered individuals shall adhere to the data handling procedures outlined in this policy when working with personally identifiable information, financial records, health data, intellectual property, trade secrets, or any other category of sensitive information maintained by the Organization. These procedures apply regardless of the format in which data is stored, whether electronic, printed, or verbal.

The Organization shall monitor compliance across all divisions, subsidiaries, and partner entities operating under the Organization's brand or contractual agreements. Monitoring shall include both scheduled reviews conducted on a quarterly basis and unannounced spot checks initiated at the discretion of the compliance department. Results of all monitoring activities shall be reported to the Chief Compliance Officer.

Violations of this policy by any covered individual shall be subject to disciplinary action, up to and including termination of employment or contract, and may be reported to the relevant regulatory authority as required by applicable law. The Organization shall maintain a record of all reported violations and the outcomes of any resulting disciplinary proceedings.

This policy shall be reviewed annually by the compliance department in consultation with legal counsel, human resources, and information technology leadership. Any amendments resulting from the review shall be communicated to all covered individuals within thirty days of approval and shall take effect immediately upon distribution.`,
    revised: `This policy applies to full-time employees who access or process customer data within the Organization's primary business unit. Personnel in subsidiary operations, contractor roles, or temporary positions are addressed under separate policies maintained by their respective management structures.

Covered employees shall adhere to the data handling procedures outlined in this policy when working with personally identifiable information maintained in the Organization's primary customer database. Handling of other data categories, including financial records, health data, and intellectual property, is governed by separate domain-specific policies maintained by the relevant functional departments.

The Organization shall monitor compliance within the primary business unit through scheduled quarterly reviews conducted by the compliance department. Monitoring of subsidiary operations, partner entities, and contractor activities is addressed under separate oversight frameworks. Unannounced spot checks are not included in the scope of this policy.

Violations of this policy by covered employees shall be subject to disciplinary action as determined by the employee's direct supervisor and the Human Resources department. Referral to regulatory authorities is addressed under the Organization's separate regulatory reporting policy and is not within the scope of this document.

This policy shall be reviewed on a biennial basis by the compliance department. Amendments shall be communicated to covered employees through the Organization's standard internal communication channels. The review scope is limited to provisions affecting the primary business unit and does not extend to subsidiary or affiliate policies.`,
  },
};
