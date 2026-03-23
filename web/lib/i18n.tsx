"use client";

import { createContext, useContext, useEffect, useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type Lang = "fr" | "en";

// ─── All translations ──────────────────────────────────────────────────────────

export const TRANSLATIONS = {
  fr: {
    // ── Common ──
    common: {
      save:        "Enregistrer",
      cancel:      "Annuler",
      delete:      "Supprimer",
      edit:        "Modifier",
      add:         "Ajouter",
      close:       "Fermer",
      loading:     "Chargement…",
      error:       "Erreur de chargement",
      comingSoon:  "Bientôt",
      soon:        "À venir",
      na:          "—",
      yes:         "Oui",
      no:          "Non",
    },

    // ── TopNav ──
    nav: {
      dashboard:    "Dashboard",
      profile:      "Mon profil",
      logout:       "Se déconnecter",
      login:        "Se connecter",
      register:     "Créer un compte",
      loggedAs:     "Connecté en tant que",
      spaceStudent: "Espace Étudiant",
      spaceUniv:    "Espace Université",
      roleStudent:  "🎓 Étudiant",
      roleUniv:     "🏛 Université",
    },

    // ── Login ──
    login: {
      title:       "Bon retour !",
      subtitle:    "Connecte-toi pour accéder à ton dashboard.",
      email:       "Adresse email",
      password:    "Mot de passe",
      submit:      "Se connecter →",
      submitting:  "Connexion…",
      noAccount:   "Pas encore de compte ?",
      createLink:  "Créer un compte",
      errorFallback: "Échec de connexion",
    },

    // ── Register ──
    register: {
      title:        "Créer un compte",
      subtitle:     "Rejoins StudyComply gratuitement.",
      youAre:       "Tu es…",
      studentTitle: "Étudiant",
      studentDesc:  "Je prépare une mobilité à l'étranger",
      univTitle:    "Université",
      univDesc:     "Je gère des étudiants en mobilité",
      email:        "Adresse email",
      password:     "Mot de passe",
      passwordPlaceholder: "Choisis un mot de passe sécurisé",
      submit:       "Créer mon compte →",
      submitting:   "Création du compte…",
      hasAccount:   "Déjà un compte ?",
      loginLink:    "Se connecter",
      errorFallback: "Échec d'inscription",
    },

    // ── Student dashboard ──
    student: {
      greeting:        "Bonjour",
      editProject:     "✏️ Modifier le projet",
      createProject:   "➕ Créer un projet",
      logout:          "Déconnexion",
      statDest:        "Destination",
      statCompliance:  "Conformité",
      statPassports:   "Passeports",
      noDest:          "Aucun projet",
      noProject:       "Configure un projet",
      noPassports:     "Ajouter dans Profil",
      docsDeposited:   "déposé",
      docsDepositedPl: "déposés",
      nextStep:        "Prochaine étape",
      myDocs:          "Mes documents",
      myChecklist:     "Ma checklist de conformité",
      addDoc:          "+ Ajouter un document",
      noDocsYet:       "Aucun document ajouté.",
      addFirst:        "Ajouter votre premier document",
      checklistEmpty:  "Crée un projet de mobilité pour générer ta checklist personnalisée.",
      noPassportWarn:  "Ajoute ton passeport dans ton profil pour générer la checklist.",
      goProfile:       "→ Aller dans mon profil",
      score:           "Score de conformité",
      done:            "complétés",
      total:           "requis",
      upload:          "Déposer PDF",
      uploading:       "Envoi…",
      viewPdf:         "Voir PDF",
      deleteFile:      "Supprimer le fichier",
      expiry:          "Expire le",
      noExpiry:        "Pas de date",
      urgencyOverdue:  "En retard",
      urgencyCritical: "Critique",
      urgencySoon:     "Bientôt",
      urgencyUpcoming: "À venir",
      urgencyFuture:   "Futur",
      urgencyPostArr:  "Après arrivée",
      officialLink:    "Lien officiel",
      // Project modal
      modalNewProject: "Nouveau projet de mobilité",
      modalEditProject:"Modifier le projet",
      modalProjectSub: "Configure ta destination et ta période.",
      destLabel:       "Pays de destination",
      destHint:        "🌍 Europe (Schengen & UE), États-Unis, Canada",
      destSearch:      "Recherche (ex : France, Allemagne, États-Unis…)",
      destSelected:    "✓",
      destSelectedSuffix: "sélectionné",
      mobilityType:    "Type de mobilité",
      departure:       "Date de départ",
      returnDate:      "Date de retour",
      saveProject:     "Enregistrer le projet",
      saving:          "Sauvegarde…",
      deleteProject:   "Supprimer le projet",
      confirmDelete:   "Supprimer ce projet de mobilité ?",
      // Doc modal
      modalNewDoc:     "Ajouter un document",
      docTitle:        "Titre du document",
      docType:         "Type",
      docExpiry:       "Date d'expiration (optionnel)",
      addDocBtn:       "Ajouter →",
      adding:          "Ajout…",
      deleteDocConfirm:"Supprimer ce document ?",
      deleteFileConfirm:"Supprimer le fichier PDF joint ?",
      // Next step prompts
      nextProjectTitle:"Configure ton projet",
      nextProjectDesc: "Indique ta destination et ton type de mobilité pour démarrer.",
      nextProjectCta:  "Créer un projet",
      nextPassportTitle:"Ajoute ton passeport",
      nextPassportDesc: "Indique ta nationalité pour personnaliser ta checklist.",
      nextPassportCta:  "Aller dans le profil",
      nextDocsTitle:   "Dépose tes premiers docs",
      nextDocsDesc:    "Commence par ton passeport ou ton visa.",
      nextDocsCta:     "Ajouter un document",
      nextCheckTitle:  "Complète ta checklist",
      nextCheckDesc:   "Il te reste des documents obligatoires à fournir.",
      nextCheckCta:    "Voir la checklist",
      nextDoneTitle:   "Tout est en ordre ! 🎉",
      nextDoneDesc:    "Tous tes documents sont déposés.",
      nextDoneCta:     "Voir mes documents",
    },

    // ── University dashboard ──
    university: {
      greeting:     "Bonjour",
      subtitle:     "Votre espace de gestion de mobilité internationale.",
      logout:       "Déconnexion",
      feature1Title:"Gestion des étudiants",
      feature1Desc: "Suivez la conformité documentaire de vos étudiants en mobilité entrante et sortante.",
      feature2Title:"Tableau de bord analytique",
      feature2Desc: "Visualisez en un coup d'œil le taux de conformité et les documents manquants.",
      feature3Title:"Alertes automatiques",
      feature3Desc: "Notifiez automatiquement les étudiants dont les documents expirent bientôt.",
      feature4Title:"Checklists personnalisées",
      feature4Desc: "Créez des checklists spécifiques à vos programmes et destinations partenaires.",
      feature5Title:"Intégration SIS",
      feature5Desc: "Connectez StudyComply à votre système d'information étudiant.",
      feature6Title:"Export & rapports",
      feature6Desc: "Exportez les données de conformité en PDF ou CSV pour vos rapports internes.",
      comingSoon:   "Bientôt",
      laterTitle:   "À venir",
      roadmapTitle: "Fonctionnalités à venir",
      roadmapDesc:  "L'espace université est en cours de développement. Voici ce qui arrive prochainement.",
      contactTitle: "Une question ou une suggestion ?",
      contactDesc:  "Contactez-nous pour en savoir plus sur les fonctionnalités à venir.",
      contactCta:   "Nous contacter",
    },

    // ── Profile ──
    profile: {
      title:         "Mon profil",
      subtitle:      "Gérez vos informations personnelles et vos préférences.",
      // Language section
      langSection:   "Langue de l'interface",
      langDesc:      "Choisissez la langue d'affichage de StudyComply.",
      langFr:        "🇫🇷 Français",
      langEn:        "🇬🇧 English",
      langActive:    "Actif",
      // Passports section
      passSection:   "Mes passeports / nationalités",
      passDesc:      "Renseignez vos nationalités pour personnaliser votre checklist.",
      passAdd:       "Ajouter un passeport",
      passAdding:    "Ajout…",
      passEmpty:     "Aucun passeport enregistré.",
      passAddedOn:   "Ajouté le",
      passDeleteConfirm: "Supprimer ce passeport ?",
      passSelectPlaceholder: "Choisir un pays…",
      // University sections
      univInfoTitle: "Informations de l'établissement",
      univContactTitle:"Contact mobilité internationale",
      univProgsTitle:"Programmes de mobilité",
      univNotifTitle:"Notifications",
      comingSoon:    "Fonctionnalité bientôt disponible.",
      // Account section
      accountTitle:  "Compte",
      email:         "Adresse email",
      role:          "Rôle",
      roleStudent:   "Étudiant",
      roleUniv:      "Université",
      logout:        "Se déconnecter",
    },

    // ── Homepage ── (kept here for reference, page.tsx has full version)
    home: {
      badge:       "🎓 Mobilité internationale · Europe · USA · Canada",
      heroTitle1:  "Partez à l'étranger",
      heroTitle2:  "sans stress administratif.",
    },
  },

  en: {
    // ── Common ──
    common: {
      save:        "Save",
      cancel:      "Cancel",
      delete:      "Delete",
      edit:        "Edit",
      add:         "Add",
      close:       "Close",
      loading:     "Loading…",
      error:       "Failed to load",
      comingSoon:  "Coming soon",
      soon:        "Upcoming",
      na:          "—",
      yes:         "Yes",
      no:          "No",
    },

    // ── TopNav ──
    nav: {
      dashboard:    "Dashboard",
      profile:      "My profile",
      logout:       "Sign out",
      login:        "Sign in",
      register:     "Create account",
      loggedAs:     "Signed in as",
      spaceStudent: "Student Space",
      spaceUniv:    "University Space",
      roleStudent:  "🎓 Student",
      roleUniv:     "🏛 University",
    },

    // ── Login ──
    login: {
      title:       "Welcome back!",
      subtitle:    "Sign in to access your dashboard.",
      email:       "Email address",
      password:    "Password",
      submit:      "Sign in →",
      submitting:  "Signing in…",
      noAccount:   "Don't have an account?",
      createLink:  "Create one",
      errorFallback: "Login failed",
    },

    // ── Register ──
    register: {
      title:        "Create an account",
      subtitle:     "Join StudyComply for free.",
      youAre:       "I am…",
      studentTitle: "Student",
      studentDesc:  "I'm preparing a study abroad experience",
      univTitle:    "University",
      univDesc:     "I manage students' international mobility",
      email:        "Email address",
      password:     "Password",
      passwordPlaceholder: "Choose a secure password",
      submit:       "Create my account →",
      submitting:   "Creating account…",
      hasAccount:   "Already have an account?",
      loginLink:    "Sign in",
      errorFallback: "Registration failed",
    },

    // ── Student dashboard ──
    student: {
      greeting:        "Hello",
      editProject:     "✏️ Edit project",
      createProject:   "➕ Create project",
      logout:          "Sign out",
      statDest:        "Destination",
      statCompliance:  "Compliance",
      statPassports:   "Passports",
      noDest:          "No project",
      noProject:       "Set up a project",
      noPassports:     "Add in Profile",
      docsDeposited:   "uploaded",
      docsDepositedPl: "uploaded",
      nextStep:        "Next step",
      myDocs:          "My documents",
      myChecklist:     "My compliance checklist",
      addDoc:          "+ Add a document",
      noDocsYet:       "No documents added yet.",
      addFirst:        "Add your first document",
      checklistEmpty:  "Create a mobility project to generate your personalised checklist.",
      noPassportWarn:  "Add your passport in your profile to generate the checklist.",
      goProfile:       "→ Go to my profile",
      score:           "Compliance score",
      done:            "completed",
      total:           "required",
      upload:          "Upload PDF",
      uploading:       "Uploading…",
      viewPdf:         "View PDF",
      deleteFile:      "Delete file",
      expiry:          "Expires on",
      noExpiry:        "No date",
      urgencyOverdue:  "Overdue",
      urgencyCritical: "Critical",
      urgencySoon:     "Soon",
      urgencyUpcoming: "Upcoming",
      urgencyFuture:   "Future",
      urgencyPostArr:  "Post-arrival",
      officialLink:    "Official link",
      // Project modal
      modalNewProject: "New mobility project",
      modalEditProject:"Edit project",
      modalProjectSub: "Configure your destination and travel dates.",
      destLabel:       "Destination country",
      destHint:        "🌍 Europe (Schengen & EU), United States, Canada",
      destSearch:      "Search (e.g. France, Germany, United States…)",
      destSelected:    "✓",
      destSelectedSuffix: "selected",
      mobilityType:    "Mobility type",
      departure:       "Departure date",
      returnDate:      "Return date",
      saveProject:     "Save project",
      saving:          "Saving…",
      deleteProject:   "Delete project",
      confirmDelete:   "Delete this mobility project?",
      // Doc modal
      modalNewDoc:     "Add a document",
      docTitle:        "Document title",
      docType:         "Type",
      docExpiry:       "Expiry date (optional)",
      addDocBtn:       "Add →",
      adding:          "Adding…",
      deleteDocConfirm:"Delete this document?",
      deleteFileConfirm:"Delete the attached PDF file?",
      // Next step prompts
      nextProjectTitle:"Set up your project",
      nextProjectDesc: "Enter your destination and mobility type to get started.",
      nextProjectCta:  "Create project",
      nextPassportTitle:"Add your passport",
      nextPassportDesc: "Add your nationality to personalise your checklist.",
      nextPassportCta:  "Go to profile",
      nextDocsTitle:   "Upload your first docs",
      nextDocsDesc:    "Start with your passport or visa.",
      nextDocsCta:     "Add document",
      nextCheckTitle:  "Complete your checklist",
      nextCheckDesc:   "You still have mandatory documents to submit.",
      nextCheckCta:    "View checklist",
      nextDoneTitle:   "Everything is in order! 🎉",
      nextDoneDesc:    "All your documents have been uploaded.",
      nextDoneCta:     "View my documents",
    },

    // ── University dashboard ──
    university: {
      greeting:     "Hello",
      subtitle:     "Your international student mobility management space.",
      logout:       "Sign out",
      feature1Title:"Student management",
      feature1Desc: "Track the document compliance of your incoming and outgoing mobility students.",
      feature2Title:"Analytics dashboard",
      feature2Desc: "Get a quick overview of compliance rates and missing documents.",
      feature3Title:"Automatic alerts",
      feature3Desc: "Automatically notify students whose documents are about to expire.",
      feature4Title:"Custom checklists",
      feature4Desc: "Create checklists tailored to your programmes and partner destinations.",
      feature5Title:"SIS integration",
      feature5Desc: "Connect StudyComply to your student information system.",
      feature6Title:"Export & reports",
      feature6Desc: "Export compliance data as PDF or CSV for your internal reports.",
      comingSoon:   "Coming soon",
      laterTitle:   "Upcoming",
      roadmapTitle: "Features coming soon",
      roadmapDesc:  "The university space is under development. Here's what's on the way.",
      contactTitle: "Questions or suggestions?",
      contactDesc:  "Contact us to learn more about upcoming features.",
      contactCta:   "Contact us",
    },

    // ── Profile ──
    profile: {
      title:         "My profile",
      subtitle:      "Manage your personal information and preferences.",
      // Language section
      langSection:   "Interface language",
      langDesc:      "Choose the display language for StudyComply.",
      langFr:        "🇫🇷 Français",
      langEn:        "🇬🇧 English",
      langActive:    "Active",
      // Passports section
      passSection:   "My passports / nationalities",
      passDesc:      "Enter your nationalities to personalise your checklist.",
      passAdd:       "Add a passport",
      passAdding:    "Adding…",
      passEmpty:     "No passport registered.",
      passAddedOn:   "Added on",
      passDeleteConfirm: "Delete this passport?",
      passSelectPlaceholder: "Choose a country…",
      // University sections
      univInfoTitle: "Institution information",
      univContactTitle:"International mobility contact",
      univProgsTitle:"Mobility programmes",
      univNotifTitle:"Notifications",
      comingSoon:    "Feature coming soon.",
      // Account section
      accountTitle:  "Account",
      email:         "Email address",
      role:          "Role",
      roleStudent:   "Student",
      roleUniv:      "University",
      logout:        "Sign out",
    },

    // ── Homepage ──
    home: {
      badge:       "🎓 International mobility · Europe · USA · Canada",
      heroTitle1:  "Study abroad",
      heroTitle2:  "without the admin headache.",
    },
  },
} as const;

export type Translations = typeof TRANSLATIONS.fr;

// ─── Context ───────────────────────────────────────────────────────────────────

type LangContextType = {
  lang:       Lang;
  t:          Translations;
  toggleLang: () => void;
  setLang:    (l: Lang) => void;
};

const LangContext = createContext<LangContextType>({
  lang:       "fr",
  t:          TRANSLATIONS.fr,
  toggleLang: () => {},
  setLang:    () => {},
});

// ─── Provider ──────────────────────────────────────────────────────────────────

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  // Read from localStorage on mount (client-only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sc_lang");
      if (saved === "fr" || saved === "en") setLangState(saved);
    } catch { /* ignore */ }
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    try { localStorage.setItem("sc_lang", l); } catch { /* ignore */ }
  }

  function toggleLang() {
    setLang(lang === "fr" ? "en" : "fr");
  }

  return (
    <LangContext.Provider value={{ lang, t: TRANSLATIONS[lang] as Translations, toggleLang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useLang(): LangContextType {
  return useContext(LangContext);
}
