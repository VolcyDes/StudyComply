import { CA_ETA_ELIGIBLE, DATASETS_META } from "./datasets";
import type { TravelRequirementResult } from "./types";

type ArrivalMode = "air" | "land_sea";

export function resolveCANADA(passportIso2: string, arrival: ArrivalMode = "air"): TravelRequirementResult {
  const p = passportIso2.toUpperCase();

  if (p === "US") {
    return { destination: "CANADA", status: "FREE", basedOn: p, message: "No visa or eTA required for US citizens.",
      meta: { datasets: { caEta: (DATASETS_META.caEta as any).updatedAt }, arrival } };
  }

  if (CA_ETA_ELIGIBLE.has(p)) {
    if (arrival === "land_sea") {
      return { destination: "CANADA", status: "FREE", basedOn: p, message: "No eTA needed when arriving by land or sea (passport still required).",
        meta: { datasets: { caEta: (DATASETS_META.caEta as any).updatedAt }, arrival } };
    }

    const extra =
      p === "RO" ? " (Romania: eTA eligibility applies to electronic passport holders.)"
      : p === "TW" ? " (Taiwan: passport must include the personal identification number.)"
      : "";

    return { destination: "CANADA", status: "AUTH_REQUIRED", basedOn: p, message: `An eTA is required to fly to (or transit through) Canada for short visits.${extra}`,
      meta: { auth: "eTA", datasets: { caEta: (DATASETS_META.caEta as any).updatedAt }, arrival } };
  }

  return { destination: "CANADA", status: "VISA_REQUIRED", basedOn: p, message: "A Canadian visitor visa is required for short stays based on this passport.",
    meta: { datasets: { caEta: (DATASETS_META.caEta as any).updatedAt }, arrival } };
}
