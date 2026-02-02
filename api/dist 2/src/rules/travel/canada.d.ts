import type { TravelRequirementResult } from "./types";
type ArrivalMode = "air" | "land_sea";
export declare function resolveCANADA(passportIso2: string, arrival?: ArrivalMode): TravelRequirementResult;
export {};
