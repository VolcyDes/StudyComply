import { US_VWP, DATASETS_META } from "./datasets";
import type { TravelRequirementResult } from "./types";

export function resolveUSA(passportIso2: string): TravelRequirementResult {
  const p = passportIso2.toUpperCase();

  if (p === "US") {
    return { destination: "USA", status: "FREE", basedOn: p, message: "No visa/ESTA required for US citizens.",
      meta: { datasets: { usVwp: (DATASETS_META.usVwp as any).updatedAt } } };
  }

  if (US_VWP.has(p)) {
    return { destination: "USA", status: "AUTH_REQUIRED", basedOn: p,
      message: "Travel under the Visa Waiver Program requires an approved ESTA (up to 90 days, tourism/business).",
      meta: { auth: "ESTA", datasets: { usVwp: (DATASETS_META.usVwp as any).updatedAt } } };
  }

  return { destination: "USA", status: "VISA_REQUIRED", basedOn: p,
    message: "A US visitor visa is required for short stays (B1/B2), based on this passport.",
    meta: { datasets: { usVwp: (DATASETS_META.usVwp as any).updatedAt } } };
}
