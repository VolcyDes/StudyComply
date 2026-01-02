import { EntryResult } from "../../types";
import { SCHENGEN_COUNTRIES } from "./countries";
import { SCHENGEN_VISA_FREE_MVP } from "./visaFree";
import { SCHENGEN_SHORT_STAY } from "./rules";

export function evaluateSchengen(passports: string[]): EntryResult {
  const cleaned = passports.map((p) => (p ?? "").trim().toUpperCase()).filter(Boolean);

  const schengenPassport = cleaned.find((p) => SCHENGEN_COUNTRIES.has(p));
  if (schengenPassport) {
    return {
      destination: "SCHENGEN",
      status: "FREE",
      basedOn: schengenPassport,
      message: "Free movement within the Schengen Area (short stays).",
    };
  }

  const visaFreePassport = cleaned.find((p) => SCHENGEN_VISA_FREE_MVP.has(p));
  if (visaFreePassport) {
    return {
      destination: "SCHENGEN",
      status: "VISA_FREE",
      basedOn: visaFreePassport,
      maxStayDays: SCHENGEN_SHORT_STAY.maxStayDays,
      periodDays: SCHENGEN_SHORT_STAY.periodDays,
      etiasRequired: SCHENGEN_SHORT_STAY.etiasRequired,
      message: "No visa required for short stays. 90/180 rule applies.",
    };
  }

  return {
    destination: "SCHENGEN",
    status: "VISA_REQUIRED",
    basedOn: cleaned[0] ?? "UNKNOWN",
    message: "A Schengen visa is required before travel for short stays.",
  };
}
