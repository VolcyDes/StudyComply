/**
 * ─────────────────────────────────────────────────────────────────────────────
 * REQUIREMENT DEFINITIONS  — the data layer, easy to update.
 *
 * To add / update a rule: edit this file only. The engine (engine.ts) never
 * needs to change. Deploy → done.
 *
 * daysBeforeDeparture:
 *   Negative  = N days BEFORE departure   (e.g. -90 = "start 90 days before leaving")
 *   0         = on departure day
 *   Positive  = N days AFTER arrival      (e.g. +8 = "within 8 days of arriving")
 *
 * tiers: which passport tiers need this requirement.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { PassportTier } from "./passport-tiers";

export type DocStatus = "todo" | "in_progress" | "done" | "expired";

export type RequirementDef = {
  /** Stable identifier — used to match with user's documents. */
  id: string;

  /** Document type — links to the coffrefort document type field. */
  type: string;

  /** Short label shown in the UI. */
  label: string;

  /** One-line explanation of what this document is / why it's needed. */
  description: string;

  /** Emoji icon. */
  icon: string;

  /**
   * Days relative to departure date.
   * Negative = before departure, positive = after arrival.
   */
  daysBeforeDeparture: number;

  /** "required" shows in red if missing. "recommended" shows in amber. */
  priority: "required" | "recommended";

  /** Which passport tiers need this document. */
  tiers: PassportTier[];

  /** Optional link to more info or where to apply. */
  link?: string;

  /** Optional note shown in the UI (e.g. country-specific exception). */
  note?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED — required for all tiers
// ─────────────────────────────────────────────────────────────────────────────

const SHARED: RequirementDef[] = [
  {
    id: "university_acceptance",
    type: "acceptance",
    label: "Lettre d'acceptation universitaire",
    description: "Lettre officielle de l'université d'accueil confirmant ton inscription.",
    icon: "🎓",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
  },
  {
    id: "transcripts",
    type: "transcript",
    label: "Relevés de notes officiels",
    description: "Derniers relevés de notes traduits si nécessaire (souvent demandés pour le visa ou l'université).",
    icon: "📄",
    daysBeforeDeparture: -90,
    priority: "recommended",
    tiers: ["EU_EEA", "NON_EU"],
  },
  {
    id: "accommodation_proof",
    type: "accommodation",
    label: "Justificatif de logement",
    description: "Contrat de location, attestation de résidence universitaire ou hébergement chez un tiers.",
    icon: "🏠",
    daysBeforeDeparture: -45,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
  },
  {
    id: "bank_account_local",
    type: "bank",
    label: "Ouverture d'un compte bancaire local",
    description: "Indispensable pour recevoir bourses, loyer, salaire de job étudiant. Prévoir 2-4 semaines.",
    icon: "🏦",
    daysBeforeDeparture: 30,
    priority: "recommended",
    tiers: ["EU_EEA", "NON_EU"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EU / EEA — free movement, no visa
// ─────────────────────────────────────────────────────────────────────────────

const EU_EEA_ONLY: RequirementDef[] = [
  {
    id: "eu_id_passport",
    type: "passport",
    label: "Carte d'identité ou passeport UE valide",
    description: "Document d'identité valide pendant toute la durée du séjour. Une simple CNI suffit dans l'UE.",
    icon: "🛂",
    daysBeforeDeparture: -120,
    priority: "required",
    tiers: ["EU_EEA"],
    note: "La carte d'identité suffit pour les pays UE/EEA. Le passeport est recommandé hors UE.",
  },
  {
    id: "ehic_card",
    type: "insurance",
    label: "Carte Européenne d'Assurance Maladie (CEAM)",
    description: "Donne accès aux soins d'urgence dans tous les pays UE/EEA aux mêmes tarifs que les résidents.",
    icon: "🏥",
    daysBeforeDeparture: -60,
    priority: "required",
    tiers: ["EU_EEA"],
    link: "https://www.ameli.fr/assure/droits-demarches/europe-international/protection-sociale-europe/carte-europeenne-assurance-maladie",
  },
  {
    id: "eu_registration",
    type: "registration",
    label: "Enregistrement comme citoyen UE (si > 3 mois)",
    description: "Dans de nombreux pays, les citoyens UE doivent s'enregistrer auprès des autorités locales pour les séjours > 3 mois.",
    icon: "🏛️",
    daysBeforeDeparture: 30,
    priority: "recommended",
    tiers: ["EU_EEA"],
    note: "Délai variable selon le pays (ex : 8 jours en Belgique, 3 mois en France).",
  },
  {
    id: "university_enrollment",
    type: "enrollment",
    label: "Inscription administrative à l'université d'accueil",
    description: "S'inscrire officiellement dans l'université pour obtenir ta carte étudiante et accéder aux services.",
    icon: "✏️",
    daysBeforeDeparture: 7,
    priority: "required",
    tiers: ["EU_EEA"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// NON-EU — long-stay student visa required
// ─────────────────────────────────────────────────────────────────────────────

const NON_EU_ONLY: RequirementDef[] = [
  {
    id: "passport_validity",
    type: "passport",
    label: "Passeport valide 6 mois après la fin du séjour",
    description: "Le passeport doit rester valide au moins 6 mois après ta date de retour prévue.",
    icon: "🛂",
    daysBeforeDeparture: -180,
    priority: "required",
    tiers: ["NON_EU"],
  },
  {
    id: "visa_student_d",
    type: "visa",
    label: "Visa étudiant long séjour (type D)",
    description: "Obligatoire pour un séjour > 90 jours. À demander au consulat du pays de destination dans ton pays d'origine.",
    icon: "📋",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["NON_EU"],
    note: "Délai de traitement : 2 à 8 semaines selon le consulat. Commencer tôt.",
  },
  {
    id: "visa_photos",
    type: "photos",
    label: "Photos d'identité biométriques",
    description: "Généralement 2 photos aux normes biométriques (35x45mm, fond blanc) requises pour le dossier visa.",
    icon: "📸",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["NON_EU"],
  },
  {
    id: "schengen_insurance",
    type: "insurance",
    label: "Assurance santé Schengen (min. 30 000 €)",
    description: "Obligatoire pour le visa. Couverture médicale d'urgence et rapatriement min. 30 000 € pour toute la durée du séjour.",
    icon: "🏥",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["NON_EU"],
    note: "Certains consulats exigent une assurance valable dès l'arrivée. Vérifier la date de début.",
  },
  {
    id: "proof_of_funds",
    type: "funds",
    label: "Justificatif de ressources financières",
    description: "Preuve que tu peux subvenir à tes besoins : relevés bancaires, attestation de bourse, ou garantie parentale. Montant minimal variable selon le pays (700–1 000 €/mois).",
    icon: "💰",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["NON_EU"],
  },
  {
    id: "consular_appointment",
    type: "appointment",
    label: "Rendez-vous consulaire",
    description: "Prendre rendez-vous au consulat / ambassade du pays de destination dès que possible.",
    icon: "📅",
    daysBeforeDeparture: -100,
    priority: "required",
    tiers: ["NON_EU"],
    note: "Les rendez-vous peuvent être pris des semaines à l'avance. Ne pas attendre.",
  },
  {
    id: "residence_permit",
    type: "residence_permit",
    label: "Titre de séjour / Permis de résidence",
    description: "Dans certains pays, le visa D doit être converti en titre de séjour dans les 3 mois suivant l'arrivée (ex : Certificat de résidence en Espagne, Carte de séjour en France).",
    icon: "📇",
    daysBeforeDeparture: 60,
    priority: "required",
    tiers: ["NON_EU"],
    note: "Délai variable selon le pays : France (4 mois), Espagne (30 jours), Allemagne (3 mois).",
  },
  {
    id: "local_registration_non_eu",
    type: "registration",
    label: "Enregistrement auprès des autorités locales",
    description: "Obligation légale dans la plupart des pays Schengen : s'enregistrer à la mairie, préfecture ou bureau d'immigration local dans les 8 jours suivant l'arrivée.",
    icon: "🏛️",
    daysBeforeDeparture: 8,
    priority: "required",
    tiers: ["NON_EU"],
  },
  {
    id: "university_enrollment_non_eu",
    type: "enrollment",
    label: "Inscription administrative à l'université d'accueil",
    description: "S'inscrire officiellement pour obtenir ta carte étudiante — souvent nécessaire pour le titre de séjour.",
    icon: "✏️",
    daysBeforeDeparture: 7,
    priority: "required",
    tiers: ["NON_EU"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT — full catalogue
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_REQUIREMENTS: RequirementDef[] = [
  ...SHARED,
  ...EU_EEA_ONLY,
  ...NON_EU_ONLY,
];
