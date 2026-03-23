/**
 * Supported destination countries for StudyComply MVP.
 *
 * Phase 1: Schengen/EU + USA + Canada.
 * Other destinations will be added in future phases.
 */

export type DestinationZone = "SCHENGEN_EU" | "USA" | "CANADA";

/** Maps an ISO-2 destination country code to its zone. */
const DESTINATION_ZONES: Record<string, DestinationZone> = {
  // ── Schengen area (full members) ──────────────────────────────────────────
  AT: "SCHENGEN_EU", // Autriche
  BE: "SCHENGEN_EU", // Belgique
  CH: "SCHENGEN_EU", // Suisse
  CZ: "SCHENGEN_EU", // Tchéquie
  DE: "SCHENGEN_EU", // Allemagne
  DK: "SCHENGEN_EU", // Danemark
  EE: "SCHENGEN_EU", // Estonie
  ES: "SCHENGEN_EU", // Espagne
  FI: "SCHENGEN_EU", // Finlande
  FR: "SCHENGEN_EU", // France
  GR: "SCHENGEN_EU", // Grèce
  HR: "SCHENGEN_EU", // Croatie (Schengen depuis jan. 2023)
  HU: "SCHENGEN_EU", // Hongrie
  IS: "SCHENGEN_EU", // Islande
  IT: "SCHENGEN_EU", // Italie
  LI: "SCHENGEN_EU", // Liechtenstein
  LT: "SCHENGEN_EU", // Lituanie
  LU: "SCHENGEN_EU", // Luxembourg
  LV: "SCHENGEN_EU", // Lettonie
  MT: "SCHENGEN_EU", // Malte
  NL: "SCHENGEN_EU", // Pays-Bas
  NO: "SCHENGEN_EU", // Norvège
  PL: "SCHENGEN_EU", // Pologne
  PT: "SCHENGEN_EU", // Portugal
  RO: "SCHENGEN_EU", // Roumanie (Schengen air/mer avr. 2024)
  SE: "SCHENGEN_EU", // Suède
  SI: "SCHENGEN_EU", // Slovénie
  SK: "SCHENGEN_EU", // Slovaquie
  // ── EU hors Schengen (règles similaires pour étudiants) ──────────────────
  BG: "SCHENGEN_EU", // Bulgarie
  CY: "SCHENGEN_EU", // Chypre
  IE: "SCHENGEN_EU", // Irlande
  // ── Amérique du Nord ──────────────────────────────────────────────────────
  US: "USA",
  CA: "CANADA",
};

/** Returns the destination zone for a country code, or null if not supported. */
export function getDestinationZone(countryCode: string): DestinationZone | null {
  return DESTINATION_ZONES[countryCode.toUpperCase()] ?? null;
}

/** All supported destination country codes. */
export const SUPPORTED_DESTINATION_CODES = new Set(Object.keys(DESTINATION_ZONES));

/** Supported destinations grouped for the UI. */
export const DESTINATION_GROUPS = [
  {
    label: "🇪🇺 Europe (Schengen & UE)",
    codes: ["AT","BE","BG","CH","CY","CZ","DE","DK","EE","ES","FI","FR","GR","HR","HU","IE","IS","IT","LI","LT","LU","LV","MT","NL","NO","PL","PT","RO","SE","SI","SK"],
  },
  {
    label: "🌎 Amérique du Nord",
    codes: ["CA","US"],
  },
] as const;
