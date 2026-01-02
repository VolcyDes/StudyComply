import type { DestinationZone, EntryResult } from "./types";
import { evaluateSchengen } from "./zones/schengen/evaluator";

export function evaluateEntry(destination: DestinationZone, passports: string[]): EntryResult {
  switch (destination) {
    case "SCHENGEN":
      return evaluateSchengen(passports);
    default:
      throw new Error(`Unsupported destination: ${destination as string}`);
  }
}
