import { resolveUK, resolveUSA, resolveCANADA } from "../../rules/travel";

export type DestinationZone = "SCHENGEN" | "UK" | "USA" | "CANADA";

export type EntryResult = {
  destination: DestinationZone;
  status: "FREE" | "VISA_REQUIRED" | "AUTH_REQUIRED" | "VISA_FREE";
  basedOn: string;
  message: string;
  meta?: Record<string, any>;
};

export function evaluateEntry(destination: DestinationZone, passports: string[]): EntryResult {
  const passport = (passports?.[0] ?? "").toUpperCase();
  if (!passport) throw new Error("No passport provided");

  switch (destination) {
    case "SCHENGEN": {
      const schengenFree = new Set([
        "AT","BE","BG","CH","CY","CZ","DE","DK","EE","ES","FI","FR","GR",
        "HR","HU","IS","IT","LI","LT","LU","LV","MT","NL","NO","PL","PT",
        "RO","SE","SI","SK"
      ]);

      if (schengenFree.has(passport)) {
        return { destination: "SCHENGEN", status: "FREE", basedOn: passport, message: "Free movement within the Schengen Area (short stays)." };
      }
      return { destination: "SCHENGEN", status: "VISA_REQUIRED", basedOn: passport, message: "A Schengen visa is required." };
    }

    case "UK":
      return resolveUK(passport) as unknown as EntryResult;

    case "USA":
      return resolveUSA(passport) as unknown as EntryResult;

    case "CANADA":
      return resolveCANADA(passport, "air") as unknown as EntryResult;

    default:
      throw new Error("Unsupported destination: " + destination);
  }
}
