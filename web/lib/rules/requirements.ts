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
};

// ─────────────────────────────────────────────────────────────────────────────
// COMMON — all destinations, all tiers
// ─────────────────────────────────────────────────────────────────────────────

const COMMON: RequirementDef[] = [
  {
    id: "university_acceptance",
    type: "acceptance",
    label: "Lettre d'acceptation universitaire",
    description: "Lettre officielle de l'université d'accueil confirmant ton admission. Document clé pour toutes les demandes de visa ou de permis.",
    icon: "🎓",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["SCHENGEN_EU", "USA", "CANADA", "UK", "JAPAN", "AUSTRALIA"],
  },
  {
    id: "transcripts",
    type: "transcript",
    label: "Relevés de notes officiels",
    description: "Derniers relevés de notes, souvent demandés par l'université d'accueil et les consulats. Faire légaliser ou apostiller si nécessaire.",
    icon: "📄",
    daysBeforeDeparture: -90,
    priority: "recommended",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["SCHENGEN_EU", "USA", "CANADA", "UK", "JAPAN", "AUSTRALIA"],
  },
  {
    id: "accommodation_proof",
    type: "accommodation",
    label: "Justificatif de logement",
    description: "Contrat de location, attestation de résidence universitaire (cité-U, dortoir) ou hébergement chez un tiers avec attestation notariée.",
    icon: "🏠",
    daysBeforeDeparture: -45,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["SCHENGEN_EU", "USA", "CANADA", "UK", "JAPAN", "AUSTRALIA"],
  },
  {
    id: "bank_account_local",
    type: "bank",
    label: "Ouverture d'un compte bancaire local",
    description: "Indispensable pour recevoir bourses, payer le loyer et un job étudiant. Prévoir 2–4 semaines après l'arrivée. Certaines banques (N26, Revolut) permettent d'ouvrir avant le départ.",
    icon: "🏦",
    daysBeforeDeparture: 30,
    priority: "recommended",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["SCHENGEN_EU", "USA", "CANADA", "UK", "JAPAN", "AUSTRALIA"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SCHENGEN / EU — EU passport holders (free movement)
// ─────────────────────────────────────────────────────────────────────────────

const SCHENGEN_EU_EEA: RequirementDef[] = [
  {
    id: "eu_id_passport",
    type: "passport",
    label: "Carte d'identité ou passeport UE valide",
    description: "La carte nationale d'identité suffit pour tous les pays UE/EEA. Vérifier la date d'expiration : elle doit être valide pendant tout le séjour.",
    icon: "🛂",
    daysBeforeDeparture: -120,
    priority: "required",
    tiers: ["EU_EEA"],
    destinations: ["SCHENGEN_EU"],
    note: "Le passeport est recommandé si tu prévois de voyager hors de l'espace Schengen.",
  },
  {
    id: "ehic_card",
    type: "insurance",
    label: "Carte Européenne d'Assurance Maladie (CEAM)",
    description: "Donne accès aux soins d'urgence dans tous les pays UE/EEA aux mêmes tarifs que les résidents. Gratuite, demandée auprès de ta caisse d'assurance maladie.",
    icon: "🏥",
    daysBeforeDeparture: -60,
    priority: "required",
    tiers: ["EU_EEA"],
    destinations: ["SCHENGEN_EU"],
    link: "https://www.ameli.fr/assure/droits-demarches/europe-international/protection-sociale-europe/carte-europeenne-assurance-maladie",
    linkLabel: "Demander la CEAM (Ameli.fr)",
    note: "La CEAM ne couvre pas tout. Une assurance complémentaire est recommandée pour les soins non urgents.",
  },
  {
    id: "eu_university_enrollment",
    type: "enrollment",
    label: "Inscription administrative à l'université d'accueil",
    description: "S'inscrire officiellement pour obtenir ta carte étudiante et accéder aux services universitaires (bibliothèque, transports, logement).",
    icon: "✏️",
    daysBeforeDeparture: 7,
    priority: "required",
    tiers: ["EU_EEA"],
    destinations: ["SCHENGEN_EU"],
  },
  {
    id: "eu_registration",
    type: "registration",
    label: "Enregistrement comme citoyen UE (séjour > 3 mois)",
    description: "Dans la plupart des pays UE, les citoyens européens doivent s'enregistrer auprès des autorités locales pour les séjours supérieurs à 3 mois.",
    icon: "🏛️",
    daysBeforeDeparture: 30,
    priority: "recommended",
    tiers: ["EU_EEA"],
    destinations: ["SCHENGEN_EU"],
    note: "Délai variable : 8 jours en Belgique, 3 mois en France, 3 mois en Espagne.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SCHENGEN / EU — Non-EU passport holders (visa type D requis)
// Source : https://education.ec.europa.eu/node/1775
// ─────────────────────────────────────────────────────────────────────────────

const SCHENGEN_NON_EU: RequirementDef[] = [
  {
    id: "passport_validity_schengen",
    type: "passport",
    label: "Passeport valide 6 mois après la fin du séjour",
    description: "Le passeport doit rester valide au moins 6 mois après ta date de retour prévue. Vérifier également qu'il reste des pages vierges pour les tampons.",
    icon: "🛂",
    daysBeforeDeparture: -180,
    priority: "required",
    tiers: ["NON_EU"],
    destinations: ["SCHENGEN_EU"],
  },
  {
    id: "consular_appointment_schengen",
    type: "appointment",
    label: "Rendez-vous consulaire (ambassade / consulat)",
    description: "Prendre rendez-vous au consulat du pays de destination dans ton pays d'origine dès que possible. Les créneaux partent souvent 4–6 semaines à l'avance.",
    icon: "📅",
    daysBeforeDeparture: -100,
    priority: "required",
    tiers: ["NON_EU"],
    destinations: ["SCHENGEN_EU"],
    link: "https://www.schengenvisainfo.com/embassies-consulates/",
    linkLabel: "Trouver le consulat compétent",
    note: "Prendre RDV dans le pays où tu résides légalement, au consulat du pays où tu étudies.",
  },
  {
    id: "visa_student_d",
    type: "visa",
    label: "Visa étudiant long séjour (type D)",
    description: "Obligatoire pour tout séjour d'études > 90 jours dans un pays Schengen. Le visa D est spécifique au pays de destination — il ne donne pas accès à tous les pays Schengen comme un visa C.",
    icon: "📋",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["NON_EU"],
    destinations: ["SCHENGEN_EU"],
    link: "https://education.ec.europa.eu/node/1775",
    linkLabel: "Guide officiel UE — Visa étudiant",
    note: "Délai de traitement : 3 à 8 semaines selon le consulat. Ne pas attendre la dernière minute.",
  },
  {
    id: "visa_photos_schengen",
    type: "photos",
    label: "Photos d'identité biométriques",
    description: "2 photos au format biométrique (35×45 mm, fond blanc, moins de 6 mois) requises pour le dossier de visa.",
    icon: "📸",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["NON_EU"],
    destinations: ["SCHENGEN_EU"],
  },
  {
    id: "schengen_insurance",
    type: "insurance",
    label: "Assurance santé Schengen (min. 30 000 €)",
    description: "Obligatoire pour le visa. Doit couvrir les urgences médicales et le rapatriement pour un minimum de 30 000 € sur toute la durée du séjour.",
    icon: "🏥",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["NON_EU"],
    destinations: ["SCHENGEN_EU"],
    link: "https://www.axa-schengen.com/en",
    linkLabel: "AXA Schengen — Assurance voyage",
    note: "Vérifier que la date de début d'assurance coïncide avec ton arrivée — certains consulats l'exigent.",
  },
  {
    id: "proof_of_funds_schengen",
    type: "funds",
    label: "Justificatif de ressources financières",
    description: "Relevés bancaires des 3 derniers mois, attestation de bourse ou garantie parentale. Montant minimum : 700 à 1 000 €/mois selon le pays (ex. 615 €/mois en France pour 2024–25).",
    icon: "💰",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["NON_EU"],
    destinations: ["SCHENGEN_EU"],
  },
  {
    id: "residence_permit_schengen",
    type: "residence_permit",
    label: "Titre de séjour / Permis de résidence",
    description: "Dans la majorité des pays Schengen, le visa D doit être converti en titre de séjour dans les premiers mois suivant l'arrivée. Exemple : carte de séjour en France, Aufenthaltstitel en Allemagne.",
    icon: "📇",
    daysBeforeDeparture: 60,
    priority: "required",
    tiers: ["NON_EU"],
    destinations: ["SCHENGEN_EU"],
    note: "France : 4 mois max · Allemagne : 3 mois · Espagne : 1 mois · Pays-Bas : dès l'arrivée.",
  },
  {
    id: "local_registration_schengen",
    type: "registration",
    label: "Enregistrement auprès des autorités locales",
    description: "Obligation légale dans la plupart des pays Schengen : déclaration de domicile à la mairie, préfecture ou Einwohnermeldeamt (Allemagne) dans les 8 jours suivant l'installation.",
    icon: "🏛️",
    daysBeforeDeparture: 8,
    priority: "required",
    tiers: ["NON_EU"],
    destinations: ["SCHENGEN_EU"],
  },
  {
    id: "university_enrollment_schengen",
    type: "enrollment",
    label: "Inscription administrative à l'université d'accueil",
    description: "S'inscrire officiellement pour obtenir ta carte étudiante, souvent nécessaire pour le dossier de titre de séjour.",
    icon: "✏️",
    daysBeforeDeparture: 7,
    priority: "required",
    tiers: ["NON_EU"],
    destinations: ["SCHENGEN_EU"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// USA — Visa F-1 (tous passeports — même citoyens EU)
// Source : https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html
// ─────────────────────────────────────────────────────────────────────────────

const USA_ALL: RequirementDef[] = [
  {
    id: "passport_validity_usa",
    type: "passport",
    label: "Passeport valide 6 mois après la fin du séjour",
    description: "Exigé par les autorités américaines. Vérifier l'accord bilatéral de ton pays (certains n'ont que 30 jours de validité post-séjour requise).",
    icon: "🛂",
    daysBeforeDeparture: -180,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["USA"],
  },
  {
    id: "usa_sevis_accepted",
    type: "acceptance",
    label: "Admission dans une université certifiée SEVP",
    description: "L'université doit être agréée par le Student and Exchange Visitor Program (SEVP) du gouvernement américain pour pouvoir émettre un I-20.",
    icon: "🎓",
    daysBeforeDeparture: -120,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["USA"],
    link: "https://studyinthestates.dhs.gov/school-search",
    linkLabel: "Vérifier la certification SEVP de l'université",
  },
  {
    id: "form_i20",
    type: "i20",
    label: "Formulaire I-20 (Certificate of Eligibility)",
    description: "Document officiel émis par l'université américaine. Nécessaire pour payer la taxe SEVIS et obtenir le visa F-1. Le signer avant le rendez-vous au consulat.",
    icon: "📋",
    daysBeforeDeparture: -100,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["USA"],
    link: "https://studyinthestates.dhs.gov/students/prepare/students-and-the-form-i-20",
    linkLabel: "Tout savoir sur le formulaire I-20",
  },
  {
    id: "sevis_fee",
    type: "sevis_fee",
    label: "Paiement de la taxe SEVIS (I-901) — 350 $",
    description: "Frais obligatoires payés en ligne sur fmjfee.com avant le rendez-vous visa. Conserver le reçu — il est demandé lors de l'entretien consulaire.",
    icon: "💳",
    daysBeforeDeparture: -95,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["USA"],
    link: "https://www.fmjfee.com/",
    linkLabel: "Payer la taxe SEVIS (I-901)",
  },
  {
    id: "ds160_form",
    type: "ds160",
    label: "Formulaire DS-160 (demande de visa en ligne)",
    description: "Formulaire de demande de visa non-immigrant à remplir en ligne. Une fois soumis, imprimer la page de confirmation pour l'apporter au consulat.",
    icon: "💻",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["USA"],
    link: "https://ceac.state.gov/genniv/",
    linkLabel: "Remplir le DS-160 en ligne",
  },
  {
    id: "usa_consular_appointment",
    type: "appointment",
    label: "Rendez-vous à l'ambassade / consulat américain",
    description: "Prendre RDV sur le site de l'ambassade américaine dans ton pays. Les délais peuvent être longs (parfois plusieurs mois). À planifier dès la réception du I-20.",
    icon: "📅",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["USA"],
    link: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
    linkLabel: "Informations officielles visa F-1 (State Dept.)",
    note: "Le délai moyen pour un RDV varie de 2 semaines à 6 mois selon le pays.",
  },
  {
    id: "f1_visa",
    type: "visa",
    label: "Visa étudiant F-1",
    description: "Visa obligatoire pour les études aux États-Unis (même pour les citoyens UE). Valable pour la durée des études + 60 jours de grâce après la fin du programme.",
    icon: "📋",
    daysBeforeDeparture: -80,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["USA"],
    link: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
    linkLabel: "Guide officiel visa F-1",
  },
  {
    id: "usa_insurance",
    type: "insurance",
    label: "Assurance santé (obligatoire pour l'université)",
    description: "La plupart des universités américaines exigent une assurance santé. Certaines proposent leur propre plan (souvent obligatoire), d'autres acceptent une assurance externe. Les frais médicaux sans assurance peuvent être extrêmement élevés.",
    icon: "🏥",
    daysBeforeDeparture: -30,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["USA"],
    note: "Vérifier si ton université impose son propre plan ou accepte une assurance externe.",
  },
  {
    id: "usa_ssn",
    type: "ssn",
    label: "Demande de Social Security Number (si travail)",
    description: "Le SSN est nécessaire uniquement si tu travailles sur le campus (autorisé avec un F-1). La demande se fait en personne au bureau Social Security Administration après l'arrivée.",
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
    label: "Enregistrement à l'université + International Student Office",
    description: "Contacter l'International Student Office (ISO) dès l'arrivée pour valider ton statut F-1 dans le système SEVIS et t'inscrire aux cours.",
    icon: "✏️",
    daysBeforeDeparture: 3,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["USA"],
    link: "https://studyinthestates.dhs.gov/students/maintaining-status",
    linkLabel: "Maintenir son statut F-1",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CANADA — Permis d'études (tous passeports)
// Source : https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html
// ─────────────────────────────────────────────────────────────────────────────

const CANADA_ALL: RequirementDef[] = [
  {
    id: "passport_validity_canada",
    type: "passport",
    label: "Passeport valide pendant tout le séjour",
    description: "Le permis d'études ne peut pas dépasser la date d'expiration de ton passeport. S'assurer que le passeport est valide pour toute la durée des études + marge de sécurité.",
    icon: "🛂",
    daysBeforeDeparture: -180,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["CANADA"],
  },
  {
    id: "canada_acceptance",
    type: "acceptance",
    label: "Lettre d'acceptation d'une université désignée (DLI)",
    description: "L'établissement doit figurer sur la liste des établissements d'enseignement désignés (DLI). La lettre d'acceptation est obligatoire pour la demande de permis d'études.",
    icon: "🎓",
    daysBeforeDeparture: -120,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["CANADA"],
    link: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents.html",
    linkLabel: "Vérifier les DLI reconnus (Canada.ca)",
  },
  {
    id: "canada_pal",
    type: "pal",
    label: "Lettre d'attestation provinciale (PAL / CAQ pour Québec)",
    description: "Obligatoire depuis 2024 pour la plupart des programmes universitaires. La PAL est émise par la province où se situe l'université. Au Québec, il s'agit du Certificat d'acceptation du Québec (CAQ).",
    icon: "📜",
    daysBeforeDeparture: -120,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["CANADA"],
    link: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents.html",
    linkLabel: "Obtenir la PAL — Canada.ca",
    note: "Québec : demander le CAQ sur le site du Ministère de l'Immigration du Québec (MIFI).",
  },
  {
    id: "canada_study_permit",
    type: "visa",
    label: "Permis d'études canadien",
    description: "Obligatoire pour les études de plus de 6 mois au Canada (pour la majorité des pays). À demander en ligne sur le portail IRCC. Délai de traitement : 4 à 12 semaines.",
    icon: "📋",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["CANADA"],
    link: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html",
    linkLabel: "Demander le permis d'études (IRCC)",
  },
  {
    id: "canada_proof_funds",
    type: "funds",
    label: "Preuve de ressources financières (min. 20 635 $ CAD/an)",
    description: "Depuis 2024, le montant minimum requis pour les frais de subsistance est de 20 635 $ CAD par an (hors frais de scolarité). Fournir relevés bancaires ou attestation de bourse.",
    icon: "💰",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["CANADA"],
    link: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents.html",
    linkLabel: "Ressources financières requises — IRCC",
    note: "Montant mis à jour en janvier 2024. Vérifier le montant actuel sur Canada.ca.",
  },
  {
    id: "canada_insurance",
    type: "insurance",
    label: "Assurance santé provinciale / complémentaire",
    description: "La couverture santé varie par province. Certaines (Ontario, Colombie-Britannique) couvrent les étudiants internationaux après un délai d'attente. Une assurance privée est indispensable en attendant l'activation.",
    icon: "🏥",
    daysBeforeDeparture: -30,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["CANADA"],
    note: "Québec : la RAMQ couvre les étudiants de pays avec accord bilatéral (France incluse). Vérifier ton éligibilité.",
  },
  {
    id: "canada_eta",
    type: "eta",
    label: "Autorisation de voyage électronique (AVE / eTA)",
    description: "Si tu voyages en avion vers le Canada et que tu n'as pas besoin de visa, tu dois obtenir une AVE (Autorisation de Voyage Électronique). Rapide et peu coûteux (7 $ CAD). Non requise si tu as un visa canadien.",
    icon: "✈️",
    daysBeforeDeparture: -30,
    priority: "required",
    tiers: ["EU_EEA"],
    destinations: ["CANADA"],
    link: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta/apply.html",
    linkLabel: "Demander l'AVE (7 $ CAD)",
    note: "Citoyens français, belges, suisses et autres ressortissants UE : l'AVE est requise pour entrer au Canada en avion.",
  },
  {
    id: "canada_sin",
    type: "sin",
    label: "Numéro d'assurance sociale (NAS) — si travail",
    description: "Nécessaire pour travailler légalement au Canada (autorisé jusqu'à 20h/semaine hors campus avec un permis d'études valide). Demande en personne dans un centre Service Canada après l'arrivée.",
    icon: "🪪",
    daysBeforeDeparture: 14,
    priority: "recommended",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["CANADA"],
    link: "https://www.canada.ca/en/employment-social-development/services/sin.html",
    linkLabel: "Obtenir un NAS — Service Canada",
  },
  {
    id: "canada_enrollment",
    type: "enrollment",
    label: "Inscription à l'université + bureau des étudiants internationaux",
    description: "Confirmer ton inscription en personne au bureau international dès ton arrivée. Nécessaire pour valider le permis d'études et accéder aux services universitaires.",
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
    description: "Ton université doit t'attribuer un numéro CAS avant que tu puisses demander ton visa étudiant. C'est le document de base de toute candidature.",
    icon: "🎓",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["UK"],
    link: "https://www.gov.uk/student-visa",
    linkLabel: "Visa étudiant UK – GOV.UK",
  },
  {
    id: "uk_student_visa",
    type: "visa",
    label: "Visa étudiant UK (Student Visa)",
    description: "Depuis le Brexit, tous les étudiants étrangers (EU inclus) doivent obtenir un Student Visa pour étudier plus de 6 mois au Royaume-Uni. Demande via UKVI.",
    icon: "📋",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["UK"],
    link: "https://www.gov.uk/student-visa/apply",
    linkLabel: "Demander le visa – GOV.UK",
  },
  {
    id: "uk_english_test",
    type: "other",
    label: "Test d'anglais (IELTS / TOEFL / PTE)",
    description: "La plupart des universités britanniques exigent un score IELTS Academic ≥ 6.0 (ou équivalent) pour valider ton admission et ton visa.",
    icon: "📝",
    daysBeforeDeparture: -120,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["UK"],
    link: "https://www.ielts.org/",
    linkLabel: "Passer l'IELTS",
  },
  {
    id: "uk_ihs",
    type: "insurance",
    label: "Surcharge santé (Immigration Health Surcharge)",
    description: "Frais obligatoires à payer lors de la demande de visa. Environ £776/an. Te donne accès au NHS (National Health Service).",
    icon: "🏥",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["UK"],
    link: "https://www.gov.uk/healthcare-immigration-application",
    linkLabel: "Payer l'IHS – GOV.UK",
  },
  {
    id: "uk_brp",
    type: "residence_permit",
    label: "Biometric Residence Permit (BRP)",
    description: "À collecter dans les 10 jours suivant ton arrivée au Royaume-Uni. Indispensable pour justifier de ton statut de résident.",
    icon: "📇",
    daysBeforeDeparture: 10,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["UK"],
    link: "https://www.gov.uk/biometric-residence-permits",
    linkLabel: "BRP – GOV.UK",
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
    description: "L'université japonaise doit demander le COE au bureau d'immigration japonais en ton nom. Ce document est nécessaire pour obtenir le visa étudiant.",
    icon: "🎓",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["JAPAN"],
    link: "https://www.moj.go.jp/isa/applications/procedures/zairyu_shikaku20.html",
    linkLabel: "COE – Bureau de l'immigration JP",
  },
  {
    id: "jp_student_visa",
    type: "visa",
    label: "Visa étudiant Japon (College Student Visa)",
    description: "Visa à demander auprès du consulat japonais de ton pays avec le COE. Obligatoire pour les séjours d'études supérieurs à 90 jours.",
    icon: "📋",
    daysBeforeDeparture: -60,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["JAPAN"],
    link: "https://www.mofa.go.jp/j_info/visit/visa/long/visa6.html",
    linkLabel: "Visa étudiant – MOFA Japon",
  },
  {
    id: "jp_residence_card",
    type: "residence_permit",
    label: "Carte de résidence (Zairyu Card)",
    description: "Délivrée automatiquement à l'aéroport à ton arrivée. Conserve-la, elle est demandée pour l'ouverture de compte bancaire, location, etc.",
    icon: "📇",
    daysBeforeDeparture: 1,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["JAPAN"],
  },
  {
    id: "jp_national_health",
    type: "insurance",
    label: "Assurance maladie nationale (Kokumin Kenko Hoken)",
    description: "Inscription obligatoire à l'assurance maladie nationale japonaise dans les 14 jours suivant l'inscription en mairie.",
    icon: "🏥",
    daysBeforeDeparture: 14,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["JAPAN"],
    link: "https://www.mhlw.go.jp/english/policy/health-medical/health-insurance/index.html",
    linkLabel: "Assurance maladie JP",
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
    description: "Document émis par ton université australienne après paiement des frais d'inscription. Requis pour la demande de visa étudiant.",
    icon: "🎓",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["AUSTRALIA"],
    link: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
    linkLabel: "Visa étudiant Australie (Subclass 500)",
  },
  {
    id: "au_student_visa",
    type: "visa",
    label: "Visa étudiant Australie (Subclass 500)",
    description: "Visa obligatoire pour tous les étudiants étrangers souhaitant étudier plus de 3 mois en Australie. Demande en ligne via ImmiAccount.",
    icon: "📋",
    daysBeforeDeparture: -90,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["AUSTRALIA"],
    link: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500/student",
    linkLabel: "Demander le Subclass 500",
  },
  {
    id: "au_english_test",
    type: "other",
    label: "Test d'anglais (IELTS / TOEFL / PTE Academic)",
    description: "Score minimum requis selon le niveau d'études. IELTS Academic ≥ 5.5 pour la plupart des programmes de premier cycle.",
    icon: "📝",
    daysBeforeDeparture: -120,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["AUSTRALIA"],
    link: "https://www.ielts.org/",
    linkLabel: "Passer l'IELTS",
  },
  {
    id: "au_oshc",
    type: "insurance",
    label: "Overseas Student Health Cover (OSHC)",
    description: "Assurance maladie obligatoire pour tous les étudiants étrangers en Australie. Doit être souscrite avant l'arrivée et couvrir toute la durée du visa.",
    icon: "🏥",
    daysBeforeDeparture: -60,
    priority: "required",
    tiers: ["EU_EEA", "NON_EU"],
    destinations: ["AUSTRALIA"],
    link: "https://www.privatehealth.gov.au/dynamic/pbsearch?provstatus=C",
    linkLabel: "Comparer les OSHC",
  },
  {
    id: "au_biometrics",
    type: "other",
    label: "Données biométriques",
    description: "Collecte d'empreintes digitales et photo au centre biométrique ou à l'aéroport. Requis pour la plupart des nationalités.",
    icon: "🔍",
    daysBeforeDeparture: -60,
    priority: "required",
    tiers: ["NON_EU"],
    destinations: ["AUSTRALIA"],
    link: "https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/biometrics",
    linkLabel: "Biométrie – DHA Australie",
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
