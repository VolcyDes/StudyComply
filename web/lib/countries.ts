import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";

countries.registerLocale(en);

export type CountryOption = { code: string; label: string };

/**
 * Returns ISO2 country options (code, label) sorted by label.
 * Uses English names by default.
 */
export function getCountryOptions(): CountryOption[] {
  const names = countries.getNames("en", { select: "official" }) as Record<string, string>;

  return Object.entries(names)
    .map(([code, label]) => ({ code, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
