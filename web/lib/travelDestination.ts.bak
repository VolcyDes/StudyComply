export const SCHENGEN_SET = new Set<string>([
  "AT","BE","BG","CH","CY","CZ","DE","DK","EE","ES","FI","FR","GR","HR","HU","IS","IT","LI","LT","LU","LV","MT","NL","NO","PL","PT","RO","SE","SI","SK"
]);
export const EXTRA_DESTS = new Set<string>(["US","CA","GB"]);
export function isSupportedDestinationIso2(iso2?: string) {
  const v = (iso2 ?? "").toString().toUpperCase();
  return SCHENGEN_SET.has(v) || EXTRA_DESTS.has(v);
}


// ISO2 (country) -> Travel API destination zone
// - US -> "USA", CA -> "CANADA", GB -> "UK", Schengen country -> "SCHENGEN"
export function iso2ToTravelDestination(iso2: string): "SCHENGEN" | "UK" | "USA" | "CANADA" {
  const code = (iso2 ?? "").toString().toUpperCase();
  if (code === "US") return "USA";
  if (code === "CA") return "CANADA";
  if (code === "GB") return "UK";
  return "SCHENGEN";
}
