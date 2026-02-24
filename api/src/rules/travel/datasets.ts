import ukEta from "../datasets/uk_eta_eligible.json";
import ukVisa from "../datasets/uk_visa_nationals.json";
import usVwp from "../datasets/us_vwp.json";
import caEta from "../datasets/ca_eta_eligible.json";

const normalize = (iso2: string) => iso2.trim().toUpperCase();

export const UK_ETA_ELIGIBLE = new Set<string>((ukEta as any).iso2.map(normalize));
export const UK_VISA_NATIONALS = new Set<string>((ukVisa as any).iso2.map(normalize));

export const US_VWP = new Set<string>((usVwp as any).iso2.map(normalize));
export const CA_ETA_ELIGIBLE = new Set<string>((caEta as any).iso2.map(normalize));

export const DATASETS_META = { ukEta, ukVisa, usVwp, caEta };
