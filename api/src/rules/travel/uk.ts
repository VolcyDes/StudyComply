import { UK_ETA_ELIGIBLE, UK_VISA_NATIONALS, DATASETS_META } from "./datasets";
import type { TravelRequirementResult } from "./types";

export function resolveUK(passportIso2: string): TravelRequirementResult {
  const p = passportIso2.toUpperCase();

  if (p === "GB") {
    return { destination: "UK", status: "FREE", basedOn: p, message: "No visa or ETA required for UK citizens (short visits).",
      meta: { datasets: { ukEta: (DATASETS_META.ukEta as any).updatedAt, ukVisa: (DATASETS_META.ukVisa as any).updatedAt } } };
  }
  if (p === "IE") {
    return { destination: "UK", status: "FREE", basedOn: p, message: "No visa or ETA required for Irish citizens (CTA).",
      meta: { datasets: { ukEta: (DATASETS_META.ukEta as any).updatedAt, ukVisa: (DATASETS_META.ukVisa as any).updatedAt } } };
  }

  if (UK_VISA_NATIONALS.has(p)) {
    return { destination: "UK", status: "VISA_REQUIRED", basedOn: p, message: "A UK visit visa is required for short stays (visitor).",
      meta: { datasets: { ukVisa: (DATASETS_META.ukVisa as any).updatedAt } } };
  }

  if (UK_ETA_ELIGIBLE.has(p)) {
    const extra = p === "TW" ? " (Taiwan: passport must include the Taiwan ID number to be ETA-eligible.)" : "";
    return { destination: "UK", status: "AUTH_REQUIRED", basedOn: p, message: `An ETA is required before travelling to the UK for short visits.${extra}`,
      meta: { auth: "ETA", datasets: { ukEta: (DATASETS_META.ukEta as any).updatedAt } } };
  }

  return { destination: "UK", status: "FREE", basedOn: p, message: "No ETA listed for this passport; you may be able to enter as a visitor on arrival (short stays).",
    meta: { datasets: { ukEta: (DATASETS_META.ukEta as any).updatedAt, ukVisa: (DATASETS_META.ukVisa as any).updatedAt } } };
}
