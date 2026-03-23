/**
 * Passport tier classification for Schengen student mobility.
 *
 * EU_EEA   → EU members + Norway, Iceland, Liechtenstein, Switzerland
 *            Free movement, no visa needed.
 *
 * NON_EU   → Everyone else → long-stay student visa required for stays > 90 days.
 *            (Even "visa-exempt" nationalities for short stays need a D visa for studies.)
 *
 * Easy to extend: just move a code between tiers if rules change.
 */

export type PassportTier = "EU_EEA" | "NON_EU";

/** ISO 3166-1 alpha-2 codes that enjoy EU/EEA/CH free movement. */
const EU_EEA_CODES = new Set([
  // EU 27
  "AT","BE","BG","CY","CZ","DE","DK","EE","ES","FI","FR","GR",
  "HR","HU","IE","IT","LT","LU","LV","MT","NL","PL","PT","RO",
  "SE","SI","SK",
  // EEA non-EU + Switzerland
  "NO","IS","LI","CH",
]);

/**
 * Returns the tier for a given ISO-2 passport code.
 * If the student holds multiple passports, use getBestTier().
 */
export function getTier(passportCode: string): PassportTier {
  return EU_EEA_CODES.has(passportCode.toUpperCase()) ? "EU_EEA" : "NON_EU";
}

/**
 * Given a list of passport codes, returns the most privileged tier.
 * (EU passport beats NON_EU — one EU passport = EU rights.)
 */
export function getBestTier(passportCodes: string[]): PassportTier {
  if (passportCodes.some((c) => getTier(c) === "EU_EEA")) return "EU_EEA";
  return "NON_EU";
}
