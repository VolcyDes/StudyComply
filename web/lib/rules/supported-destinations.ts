/**
 * Supported destination countries for StudyComply MVP.
 *
 * Phase 1: Schengen/EU + USA + Canada.
 * Other destinations will be added in future phases.
 */

export type DestinationZone = "SCHENGEN_EU" | "USA" | "CANADA" | "UK" | "JAPAN" | "AUSTRALIA";

/** Maps an ISO-2 destination country code to its zone. */
const DESTINATION_ZONES: Record<string, DestinationZone> = {
  // ── Schengen area (full members) ──────────────────────────────────────────
  AT: "SCHENGEN_EU", // Austria
  BE: "SCHENGEN_EU", // Belgium
  CH: "SCHENGEN_EU", // Switzerland
  CZ: "SCHENGEN_EU", // Czech Republic
  DE: "SCHENGEN_EU", // Germany
  DK: "SCHENGEN_EU", // Denmark
  EE: "SCHENGEN_EU", // Estonia
  ES: "SCHENGEN_EU", // Spain
  FI: "SCHENGEN_EU", // Finland
  FR: "SCHENGEN_EU", // France
  GR: "SCHENGEN_EU", // Greece
  HR: "SCHENGEN_EU", // Croatia (Schengen since Jan 2023)
  HU: "SCHENGEN_EU", // Hungary
  IS: "SCHENGEN_EU", // Iceland
  IT: "SCHENGEN_EU", // Italy
  LI: "SCHENGEN_EU", // Liechtenstein
  LT: "SCHENGEN_EU", // Lithuania
  LU: "SCHENGEN_EU", // Luxembourg
  LV: "SCHENGEN_EU", // Latvia
  MT: "SCHENGEN_EU", // Malta
  NL: "SCHENGEN_EU", // Netherlands
  NO: "SCHENGEN_EU", // Norway
  PL: "SCHENGEN_EU", // Poland
  PT: "SCHENGEN_EU", // Portugal
  RO: "SCHENGEN_EU", // Romania (Schengen air/sea Apr 2024)
  SE: "SCHENGEN_EU", // Sweden
  SI: "SCHENGEN_EU", // Slovenia
  SK: "SCHENGEN_EU", // Slovakia
  // ── EU outside Schengen (similar rules for students) ─────────────────────
  BG: "SCHENGEN_EU", // Bulgaria
  CY: "SCHENGEN_EU", // Cyprus
  IE: "SCHENGEN_EU", // Ireland
  // ── North America ─────────────────────────────────────────────────────────
  US: "USA",
  CA: "CANADA",
  // ── Other destinations ────────────────────────────────────────────────────
  GB: "UK",
  JP: "JAPAN",
  AU: "AUSTRALIA",
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
    label: "🇪🇺 Europe (Schengen & EU)",
    codes: ["AT","BE","BG","CH","CY","CZ","DE","DK","EE","ES","FI","FR","GR","HR","HU","IE","IS","IT","LI","LT","LU","LV","MT","NL","NO","PL","PT","RO","SE","SI","SK"],
  },
  {
    label: "🌎 North America",
    codes: ["CA","US"],
  },
  {
    label: "🇬🇧 United Kingdom",
    codes: ["GB"] as const,
  },
  {
    label: "🌏 Asia-Pacific",
    codes: ["JP","AU"] as const,
  },
] as const;
