/**
 * ─────────────────────────────────────────────────────────────────────────────
 * REQUIREMENT DEFINITIONS — the data layer, easy to update.
 *
 * To add / update a rule: edit this file only. The engine never needs to change.
 *
 * daysBeforeDeparture:
 *   Negative  = N days BEFORE departure   (e.g. -90 = "90 days before leaving")
 *   0         = on departure day
 *   Positive  = N days AFTER arrival      (e.g. +30 = "within 30 days of arriving")
 *
 * tiers: EU_EEA (free movement) or NON_EU (visa required)
 * destinations: which destination zones this applies to
 *
 * Sources used to verify information (March 2026):
 *   Schengen: https://education.ec.europa.eu/node/1775
 *   USA F-1:  https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html
 *   Canada:   https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { PassportTier } from "./passport-tiers";
import type { DestinationZone } from "./supported-destinations";

export type DocStatus = "todo" | "in_progress" | "done" | "expired";

export type RequirementDef = {
  id: string;
  type: string;
  label: string;
  description: string;
  icon: string;
  daysBeforeDeparture: number;
  priority: "required" | "recommended";
  /** Which passport tiers need this. Use both for requirements that apply to all. */
  tiers: PassportTier[];
  /** Which destination zones this applies to. */
  destinations: DestinationZone[];
  /** Official link where the student can apply or get more info. */
  link?: string;
  linkLabel?: string;
  note?: string;
  /**
   * Minimum stay duration (in days) for this requirement to apply.
   * If set, the requirement is hidden when stayDays < minStayDays.
   */
  minStayDays?: number;
  /**
   * Maximum stay duration (in days) for this requirement to apply.
   * If set, the requirement is hidden when stayDays > maxStayDays.
   */
  maxStayDays?: number;
  /**
   * Short human-readable note about the duration condition, shown in the UI.
   * e.g. "Required for stays > 90 days"
   */
  durationNote?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// COMMON — all destinations, all tiers
// ─────────────────────────────────────────────────────────────────────────────

const COMMON: RequirementDef[] = [
  {
    id: "university_acceptance",
    type: "acceptance",
    label: "University acceptance letter",
    description: "Official letter from the host university confirming your admission. Key document for all visa or permit applications.",
    icon: "🎓",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["SCHENGEN_EU", "USA", "CANADA", "UK", "JAPAN", "AUSTRALIA"],
  },
  {
    id: "accommodation_proof",
    type: "accommodation",
    label: "Proof of accommodation",
    description: "Rental contract, student residence certificate (dorm, residence hall) or third-party hosting with a notarised declaration.",
    icon: "🏠",
    daysBeforeDeparture: -45,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["SCHENGEN_EU", "USA", "CANADA", "UK", "JAPAN", "AUSTRALIA"],
  },
  {
    id: "bank_account_local",
    type: "bank",
    label: "Open a local bank account",
    description: "Essential for receiving scholarships, paying rent and a student job. Allow 2–4 weeks after arrival. Some banks (Wise, N26, Revolut) allow you to open before departure.",
    icon: "🏦",
    daysBeforeDeparture: 30,
    priority: "recommended",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["SCHENGEN_EU", "USA", "CANADA", "UK", "JAPAN", "AUSTRALIA"],
    link: "https://wise.com/fr/borderless/",
    linkLabel: "Open a Wise account (multi-currency)",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SCHENGEN / EU — EU passport holders (free movement)
// ─────────────────────────────────────────────────────────────────────────────

const SCHENGEN_EU_EEA: RequirementDef[] = [
  {
    id: "eu_id_passport",
    type: "passport",
    label: "Valid EU ID card or passport",
    description: "A national identity card is sufficient for all EU/EEA countries. Check the expiry date: it must be valid for the entire duration of your stay.",
    icon: "🛂",
    daysBeforeDeparture: -120,
    priority: "required",
    tiers: ["EU_EEA"],
    destinations: ["SCHENGEN_EU"],
    note: "A passport is recommended if you plan to travel outside the Schengen area.",
  },
  {
    id: "ehic_card",
    type: "insurance",
    label: "European Health Insurance Card (EHIC)",
    description: "Gives access to emergency healthcare in all EU/EEA countries at the same rates as residents. Free — apply through your health insurance fund (e.g. Ameli in France).",
    icon: "🏥",
    daysBeforeDeparture: -60,
    priority: "required",
    tiers: ["EU_EEA"],
    destinations: ["SCHENGEN_EU"],
    link: "https://www.ameli.fr/assure/droits-demarches/europe-international/protection-sociale-europe/carte-europeenne-assurance-maladie",
    linkLabel: "Apply for the EHIC on Ameli.fr",
    note: "The EHIC does not cover everything. Supplementary insurance is recommended for non-emergency care.",
  },
  {
    id: "eu_university_enrollment",
    type: "enrollment",
    label: "Administrative enrolment at host university",
    description: "Officially enrol to obtain your student card and access university services (library, transport, housing).",
    icon: "✏️",
    daysBeforeDeparture: 7,
    priority: "required",
    tiers: ["EU_EEA"],
    destinations: ["SCHENGEN_EU"],
  },
  {
    id: "eu_registration",
    type: "registration",
    label: "EU citizen registration (stays > 3 months)",
    description: "In most EU countries, EU citizens must register with local authorities for stays exceeding 3 months.",
    icon: "🏛️",
    daysBeforeDeparture: 30,
    priority: "recommended",
    tiers: ["EU_EEA"],
    destinations: ["SCHENGEN_EU"],
    link: "https://europa.eu/youreurope/citizens/residence/registration-residence/eu-nationals/index_fr.htm",
    linkLabel: "Official registration guide — Europa.eu",
    note: "Deadline varies: 8 days in Belgium, 3 months in France, 3 months in Spain.",
    minStayDays: 91,
    durationNote: "Required for stays > 3 months only",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SCHENGEN / EU — Non-EU passport holders (Type D visa required)
// Source : https://education.ec.europa.eu/node/1775
// ─────────────────────────────────────────────────────────────────────────────

const SCHENGEN_NON_EU: RequirementDef[] = [
  {
    id: "passport_validity_schengen",
    type: "passport",
    label: "Passport valid 6 months after end of stay",
    description: "Your passport must remain valid for at least 6 months after your planned return date. Also check that enough blank pages remain for entry stamps.",
    icon: "🛂",
    daysBeforeDeparture: -180,
    priority: "required",
    tiers: ["NON_EU"],
    destinations: ["SCHENGEN_EU"],
  },
  {
    id: "consular_appointment_schengen",
    type: "appointment",
    label: "Consular appointment (embassy / consulate)",
    description: "Book an appointment at the consulate of your destination country in your home country as early as possible. Slots often fill up 4–6 weeks in advance.",
    icon: "📅",
    daysBeforeDeparture: -100,
    priority: "required",
    tiers: ["NON_EU"],
    destinations: ["SCHENGEN_EU"],
    link: "https://www.schengenvisainfo.com/embassies-consulates/",
    linkLabel: "Find the relevant consulate",
    note: "Book in your country of legal residence, at the consulate of the country where you will study.",
    minStayDays: 91,
    durationNote: "Required for stays > 90 days (Type D visa)",
  },
  {
    id: "visa_student_d",
    type: "visa",
    label: "Long-stay student visa (Type D)",
    description: "Mandatory for any study stay exceeding 90 days in a Schengen country. The Type D visa is national (country-specific) — it does not grant access to all Schengen countries like a Type C visa.",
    icon: "📋",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["NON_EU"],
    destinations: ["SCHENGEN_EU"],
    link: "https://education.ec.europa.eu/node/1775",
    linkLabel: "Official EU guide — Student visa",
    note: "Processing time: 3 to 8 weeks depending on the consulate. Don't leave it to the last minute.",
    minStayDays: 91,
    durationNote: "Required for stays > 90 days",
  },
  {
    id: "visa_photos_schengen",
    type: "photos",
    label: "Biometric passport photos",
    description: "2 biometric-format photos (35×45 mm, white background, taken within 6 months) required for the Type D visa application.",
    icon: "📸",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["NON_EU"],
    destinations: ["SCHENGEN_EU"],
    minStayDays: 91,
  },
  {
    id: "schengen_insurance",
    type: "insurance",
    label: "Schengen health insurance (min. €30,000)",
    description: "Mandatory for the Type D visa. Must cover medical emergencies and repatriation for a minimum of €30,000 for the entire duration of the stay.",
    icon: "🏥",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["NON_EU"],
    destinations: ["SCHENGEN_EU"],
    link: "https://www.chapkadirect.fr/",
    linkLabel: "Chapka — International student insurance",
    note: "Alternatives: AXA Schengen, MACSF, Allianz Travel. Check that the start date matches your arrival.",
    minStayDays: 91,
    durationNote: "Mandatory for the Type D visa application",
  },
  {
    id: "proof_of_funds_schengen",
    type: "funds",
    label: "Proof of financial resources",
    description: "Bank statements for the last 3 months, scholarship certificate or parental guarantee. Minimum amount: €700–1,000/month depending on the country (e.g. €615/month in France for 2024–25).",
    icon: "💰",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["NON_EU"],
    destinations: ["SCHENGEN_EU"],
    link: "https://www.campusfrance.org/fr/ressources/outils/espace-campus-france",
    linkLabel: "Campus France — Prepare your application",
    minStayDays: 91,
    durationNote: "Required for the Type D visa application",
  },
  {
    id: "residence_permit_schengen",
    type: "residence_permit",
    label: "Residence permit / Titre de séjour",
    description: "In most Schengen countries, the Type D visa must be converted into a residence permit within the first few months after arrival. E.g. carte de séjour in France (via ANEF), Aufenthaltstitel in Germany.",
    icon: "📇",
    daysBeforeDeparture: 60,
    priority: "required",
    tiers: ["NON_EU"],
    destinations: ["SCHENGEN_EU"],
    link: "https://administration-etrangers-en-france.interieur.gouv.fr/",
    linkLabel: "ANEF — Residence permit (France)",
    note: "France: submit within 4 months · Germany: 3 months · Spain: 1 month · Netherlands: upon arrival.",
    minStayDays: 91,
  },
  {
    id: "local_registration_schengen",
    type: "registration",
    label: "Registration with local authorities",
    description: "Legal obligation in most Schengen countries: declare your address at the town hall, prefecture or Einwohnermeldeamt (Germany) within 8 days of moving in.",
    icon: "🏛️",
    daysBeforeDeparture: 8,
    priority: "required",
    tiers: ["NON_EU"],
    destinations: ["SCHENGEN_EU"],
  },
  {
    id: "university_enrollment_schengen",
    type: "enrollment",
    label: "Administrative enrolment at host university",
    description: "Officially enrol to get your student card, often required for the residence permit application.",
    icon: "✏️",
    daysBeforeDeparture: 7,
    priority: "required",
    tiers: ["NON_EU"],
    destinations: ["SCHENGEN_EU"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// USA — F-1 Visa (all passport holders — including EU citizens)
// Source : https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html
// ─────────────────────────────────────────────────────────────────────────────

const USA_ALL: RequirementDef[] = [
  {
    id: "passport_validity_usa",
    type: "passport",
    label: "Passport valid 6 months after end of stay",
    description: "Required by US authorities. Check your country's bilateral agreement (some require only 30 days of post-stay validity).",
    icon: "🛂",
    daysBeforeDeparture: -180,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["USA"],
  },
  {
    id: "usa_sevis_accepted",
    type: "acceptance",
    label: "Admission to a SEVP-certified university",
    description: "The university must be approved by the Student and Exchange Visitor Program (SEVP) of the US government in order to issue an I-20.",
    icon: "🎓",
    daysBeforeDeparture: -120,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["USA"],
    link: "https://studyinthestates.dhs.gov/school-search",
    linkLabel: "Check university SEVP certification",
  },
  {
    id: "form_i20",
    type: "i20",
    label: "Form I-20 (Certificate of Eligibility)",
    description: "Official document issued by the US university. Required to pay the SEVIS fee and obtain the F-1 visa. Sign it before your consular appointment.",
    icon: "📋",
    daysBeforeDeparture: -100,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["USA"],
    link: "https://studyinthestates.dhs.gov/students/prepare/students-and-the-form-i-20",
    linkLabel: "Everything about Form I-20",
  },
  {
    id: "sevis_fee",
    type: "sevis_fee",
    label: "SEVIS fee payment (I-901) — $350",
    description: "Mandatory fee paid online at fmjfee.com before your visa appointment. Keep the receipt — it is required at the consular interview.",
    icon: "💳",
    daysBeforeDeparture: -95,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["USA"],
    link: "https://www.fmjfee.com/",
    linkLabel: "Pay the SEVIS fee (I-901)",
  },
  {
    id: "ds160_form",
    type: "ds160",
    label: "Form DS-160 (online visa application)",
    description: "Non-immigrant visa application form to complete online. Once submitted, print the confirmation page to bring to the consulate.",
    icon: "💻",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["USA"],
    link: "https://ceac.state.gov/genniv/",
    linkLabel: "Complete the DS-160 online",
  },
  {
    id: "usa_consular_appointment",
    type: "appointment",
    label: "Appointment at the US embassy / consulate",
    description: "Book your appointment on the US embassy website in your country. Wait times can be long (sometimes several months). Plan as soon as you receive your I-20.",
    icon: "📅",
    daysBeforeDeparture: -120,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["USA"],
    link: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
    linkLabel: "Official F-1 visa information (State Dept.)",
    note: "Average wait time for an appointment ranges from 2 weeks to 6 months depending on the country. Check current wait times on travel.state.gov before planning.",
  },
  {
    id: "f1_visa",
    type: "visa",
    label: "F-1 Student Visa",
    description: "Mandatory visa for studying in the United States (even for EU citizens). Valid for the duration of studies + 60-day grace period after the programme ends.",
    icon: "📋",
    daysBeforeDeparture: -80,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["USA"],
    link: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
    linkLabel: "Official F-1 visa guide",
  },
  {
    id: "usa_insurance",
    type: "insurance",
    label: "Health insurance (required by university)",
    description: "Most US universities require health insurance. Some offer their own plan (often mandatory); others accept external insurance. Medical costs without insurance can be extremely high.",
    icon: "🏥",
    daysBeforeDeparture: -30,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["USA"],
    link: "https://www.internationalstudentinsurance.com/",
    linkLabel: "Compare insurance plans (ISI)",
    note: "Check whether your university requires its own plan or accepts external insurance before purchasing.",
  },
  {
    id: "usa_ssn",
    type: "ssn",
    label: "Social Security Number application (if working)",
    description: "An SSN is only needed if you work on campus (permitted with an F-1 visa). Apply in person at a Social Security Administration office after arrival.",
    icon: "🪪",
    daysBeforeDeparture: 30,
    priority: "recommended",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["USA"],
    link: "https://www.ssa.gov/ssnumber/",
    linkLabel: "Social Security Administration",
  },
  {
    id: "usa_port_entry",
    type: "enrollment",
    label: "University enrolment + International Student Office",
    description: "Contact the International Student Office (ISO) upon arrival to validate your F-1 status in the SEVIS system and enrol in courses.",
    icon: "✏️",
    daysBeforeDeparture: 3,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["USA"],
    link: "https://studyinthestates.dhs.gov/students/maintaining-status",
    linkLabel: "Maintaining F-1 status",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CANADA — Study permit (all passport holders)
// Source : https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html
// ─────────────────────────────────────────────────────────────────────────────

const CANADA_ALL: RequirementDef[] = [
  {
    id: "passport_validity_canada",
    type: "passport",
    label: "Passport valid for the entire stay",
    description: "The study permit cannot extend beyond your passport's expiry date. Ensure your passport is valid for the full duration of your studies plus a safety margin.",
    icon: "🛂",
    daysBeforeDeparture: -180,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["CANADA"],
  },
  {
    id: "canada_acceptance",
    type: "acceptance",
    label: "Acceptance letter from a Designated Learning Institution (DLI)",
    description: "The institution must be on the list of Designated Learning Institutions (DLI). The acceptance letter is mandatory for the study permit application.",
    icon: "🎓",
    daysBeforeDeparture: -120,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["CANADA"],
    link: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents.html",
    linkLabel: "Check recognised DLIs (Canada.ca)",
  },
  {
    id: "canada_pal",
    type: "pal",
    label: "Provincial Attestation Letter (PAL / CAQ for Quebec)",
    description: "Mandatory since 2024 for most university programmes. The PAL is issued by the province where the university is located. In Quebec, this is the Certificat d'acceptation du Québec (CAQ).",
    icon: "📜",
    daysBeforeDeparture: -120,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["CANADA"],
    link: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents.html",
    linkLabel: "Get the PAL — Canada.ca",
    note: "Quebec: apply for the CAQ on the Quebec Ministry of Immigration (MIFI) website.",
    minStayDays: 181,
    durationNote: "Required for stays > 6 months (study permit)",
  },
  {
    id: "canada_study_permit",
    type: "visa",
    label: "Canadian study permit",
    description: "Mandatory for studies lasting more than 6 months in Canada. Apply online via the IRCC portal. Processing time: 4 to 12 weeks.",
    icon: "📋",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["CANADA"],
    link: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html",
    linkLabel: "Apply for a study permit (IRCC)",
    minStayDays: 181,
    durationNote: "Required for stays > 6 months",
  },
  {
    id: "canada_proof_funds",
    type: "funds",
    label: "Proof of financial resources (min. CAD $20,635/year)",
    description: "Since 2024, the minimum required amount for living expenses is CAD $20,635 per year (excluding tuition). Provide bank statements or a scholarship certificate.",
    icon: "💰",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["CANADA"],
    link: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents.html",
    linkLabel: "Required financial resources — IRCC",
    note: "Amount updated in January 2024. Check the current amount on Canada.ca.",
    minStayDays: 181,
    durationNote: "Required for the study permit application",
  },
  {
    id: "canada_insurance",
    type: "insurance",
    label: "Provincial / supplementary health insurance",
    description: "Health coverage varies by province. Some (Ontario, B.C.) cover international students after a waiting period. Private insurance is essential while waiting for activation.",
    icon: "🏥",
    daysBeforeDeparture: -30,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["CANADA"],
    link: "https://www.etudiantcanada.ca/assurance-sante/",
    linkLabel: "Student health insurance guide — Canada",
    note: "Quebec: the RAMQ covers students from countries with bilateral agreements (including France). Check your eligibility.",
  },
  {
    id: "canada_eta",
    type: "eta",
    label: "Electronic Travel Authorisation (eTA)",
    description: "If you travel to Canada by air and do not need a visa, you must obtain an eTA. Quick and inexpensive (CAD $7). Not required if you hold a Canadian visa.",
    icon: "✈️",
    daysBeforeDeparture: -30,
    priority: "required",
    tiers: ["EU_EEA"],
    destinations: ["CANADA"],
    link: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta/apply.html",
    linkLabel: "Apply for eTA (CAD $7)",
    note: "French, Belgian, Swiss and other EU nationals: the eTA is required to enter Canada by air.",
  },
  {
    id: "canada_sin",
    type: "sin",
    label: "Social Insurance Number (SIN) — if working",
    description: "Required to work legally in Canada (permitted up to 20 hours/week off campus with a valid study permit). Apply in person at a Service Canada centre after arrival.",
    icon: "🪪",
    daysBeforeDeparture: 14,
    priority: "recommended",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["CANADA"],
    link: "https://www.canada.ca/en/employment-social-development/services/sin.html",
    linkLabel: "Get a SIN — Service Canada",
  },
  {
    id: "canada_enrollment",
    type: "enrollment",
    label: "University enrolment + international student office",
    description: "Confirm your enrolment in person at the international office upon arrival. Required to validate your study permit and access university services.",
    icon: "✏️",
    daysBeforeDeparture: 3,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["CANADA"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// UK — all tiers (post-Brexit, EU and non-EU students follow the same route)
// ─────────────────────────────────────────────────────────────────────────────

const UK_ALL: RequirementDef[] = [
  {
    id: "uk_cas",
    type: "acceptance",
    label: "Confirmation of Acceptance for Studies (CAS)",
    description: "Your university must assign you a CAS number before you can apply for your Student Visa (Student Route). This is the foundation of any application.",
    icon: "🎓",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["UK"],
    link: "https://www.gov.uk/student-visa",
    linkLabel: "UK Student Visa (Student Route) – GOV.UK",
    minStayDays: 181,
    durationNote: "Required for stays > 6 months (Student Route)",
  },
  {
    id: "uk_student_visa",
    type: "visa",
    label: "UK Student Visa (Student Route, > 6 months)",
    description: "Since Brexit, all international students (including EU) must obtain a Student Visa to study for more than 6 months in the UK. For ≤ 6 months, a Standard Visitor Visa may suffice.",
    icon: "📋",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["UK"],
    link: "https://www.gov.uk/student-visa/apply",
    linkLabel: "Apply for a Student Visa – GOV.UK",
    minStayDays: 181,
    durationNote: "Required for stays > 6 months. For ≤ 6 months: Standard Visitor Visa",
  },
  {
    id: "uk_eta",
    type: "eta",
    label: "UK Electronic Travel Authorisation (ETA — £10)",
    description: "From 2 April 2025, EU/EEA nationals must obtain an ETA before any trip to the United Kingdom. Cost: £10. Valid for 2 years or until passport expiry. Response typically within 3 working days.",
    icon: "✈️",
    daysBeforeDeparture: -30,
    priority: "required",
    tiers: ["EU_EEA"],
    destinations: ["UK"],
    link: "https://www.gov.uk/get-uk-visa-eta",
    linkLabel: "Apply for UK ETA (£10) — GOV.UK",
    note: "Exception: Irish citizens and holders of a UK visa or residence permit do not need an ETA.",
  },
  {
    id: "uk_short_stay_visa",
    type: "visa",
    label: "Standard Visitor Visa (studies ≤ 6 months)",
    description: "For non-EU nationals wishing to study for less than 6 months in the UK (e.g. exchange semester, intensive courses). EU/EEA citizens do not need this visa.",
    icon: "📋",
    daysBeforeDeparture: -60,
    priority: "required",
    tiers: ["NON_EU"],
    destinations: ["UK"],
    link: "https://www.gov.uk/standard-visitor/apply-standard-visitor-visa",
    linkLabel: "Standard Visitor Visa – GOV.UK",
    maxStayDays: 180,
    durationNote: "For stays ≤ 6 months",
  },
  {
    id: "uk_ihs",
    type: "insurance",
    label: "Immigration Health Surcharge (IHS)",
    description: "Mandatory fee paid when applying for the Student Visa. Approximately £776/year. Gives access to the NHS (National Health Service) during your stay.",
    icon: "🏥",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["UK"],
    link: "https://www.gov.uk/healthcare-immigration-application",
    linkLabel: "Pay the IHS – GOV.UK",
    minStayDays: 181,
    durationNote: "Linked to the Student Visa (stays > 6 months)",
  },
  {
    id: "uk_brp",
    type: "residence_permit",
    label: "Biometric Residence Permit (BRP)",
    description: "Must be collected within 10 days of your arrival in the UK. Essential proof of your resident status.",
    icon: "📇",
    daysBeforeDeparture: 10,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["UK"],
    link: "https://www.gov.uk/biometric-residence-permits",
    linkLabel: "BRP – GOV.UK",
    minStayDays: 181,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// JAPAN — all tiers
// ─────────────────────────────────────────────────────────────────────────────

const JAPAN_ALL: RequirementDef[] = [
  {
    id: "jp_coe",
    type: "acceptance",
    label: "Certificate of Eligibility (COE)",
    description: "Your Japanese university must apply for the COE from the Japanese immigration bureau on your behalf. Essential for obtaining the student visa. Processing time: 1 to 3 months. Ask your university to start the process as soon as possible.",
    icon: "🎓",
    daysBeforeDeparture: -150,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["JAPAN"],
    link: "https://www.moj.go.jp/isa/applications/procedures/zairyu_shikaku20.html",
    linkLabel: "COE – Japan Immigration Bureau",
    minStayDays: 91,
    durationNote: "Required for stays > 90 days",
  },
  {
    id: "jp_student_visa",
    type: "visa",
    label: "Japan Student Visa (College Student Visa)",
    description: "Apply at the Japanese consulate in your country using the COE. Mandatory for study stays exceeding 90 days. For ≤ 90 days, EU nationals may enter without a visa.",
    icon: "📋",
    daysBeforeDeparture: -60,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["JAPAN"],
    link: "https://www.mofa.go.jp/j_info/visit/visa/long/visa6.html",
    linkLabel: "Student Visa – MOFA Japan",
    minStayDays: 91,
    durationNote: "Required for stays > 90 days",
  },
  {
    id: "jp_residence_card",
    type: "residence_permit",
    label: "Residence Card (Zairyu Card)",
    description: "Issued automatically at the airport upon arrival (with student visa). Keep it — required to open a bank account, rent accommodation, etc.",
    icon: "📇",
    daysBeforeDeparture: 1,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["JAPAN"],
    minStayDays: 91,
  },
  {
    id: "jp_national_health",
    type: "insurance",
    label: "National Health Insurance (Kokumin Kenko Hoken)",
    description: "Mandatory enrolment in the Japanese national health insurance within 14 days of registering at the local municipal office.",
    icon: "🏥",
    daysBeforeDeparture: 14,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["JAPAN"],
    link: "https://www.mhlw.go.jp/english/policy/health-medical/health-insurance/index.html",
    linkLabel: "Japanese health insurance – MHLW",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// AUSTRALIA — all tiers
// ─────────────────────────────────────────────────────────────────────────────

const AUSTRALIA_ALL: RequirementDef[] = [
  {
    id: "au_coe",
    type: "acceptance",
    label: "Confirmation of Enrolment (CoE)",
    description: "Document issued by your Australian university after payment of enrolment fees. Required to apply for the Student Visa (Subclass 500).",
    icon: "🎓",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["AUSTRALIA"],
    link: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
    linkLabel: "Student Visa Subclass 500 – DHA Australia",
    minStayDays: 91,
    durationNote: "Required for stays > 3 months",
  },
  {
    id: "au_student_visa",
    type: "visa",
    label: "Australian Student Visa (Subclass 500)",
    description: "Mandatory visa for all international students wishing to study for more than 3 months in Australia. Apply online via ImmiAccount. For ≤ 3 months, a Tourist Visa (Subclass 600) may suffice.",
    icon: "📋",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["AUSTRALIA"],
    link: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500/student",
    linkLabel: "Apply for Subclass 500 (ImmiAccount)",
    minStayDays: 91,
    durationNote: "Required for stays > 3 months",
  },
  {
    id: "au_oshc",
    type: "insurance",
    label: "Overseas Student Health Cover (OSHC)",
    description: "Mandatory health insurance for all international students in Australia. Must be purchased before arrival and cover the entire duration of the visa.",
    icon: "🏥",
    daysBeforeDeparture: -60,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["AUSTRALIA"],
    link: "https://www.privatehealth.gov.au/dynamic/pbsearch?provstatus=C",
    linkLabel: "Compare OSHC plans",
  },
  {
    id: "au_biometrics",
    type: "other",
    label: "Biometric data",
    description: "Collection of fingerprints and photo at a biometric centre or airport. Required for most non-EU nationalities.",
    icon: "🔍",
    daysBeforeDeparture: -60,
    priority: "required",
    tiers: ["NON_EU"],
    destinations: ["AUSTRALIA"],
    link: "https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/biometrics",
    linkLabel: "Biometrics – DHA Australia",
    minStayDays: 91,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_REQUIREMENTS: RequirementDef[] = [
  ...COMMON,
  ...SCHENGEN_EU_EEA,
  ...SCHENGEN_NON_EU,
  ...USA_ALL,
  ...CANADA_ALL,
  ...UK_ALL,
  ...JAPAN_ALL,
  ...AUSTRALIA_ALL,
];
