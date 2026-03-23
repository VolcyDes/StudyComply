/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CHECKLIST ENGINE  — the logic layer. Never needs to change.
 *
 * Takes context (passports, destination, dates) and returns a sorted,
 * personalised checklist. Updates to rules only touch requirements.ts.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { getBestTier } from "./passport-tiers";
import { getDestinationZone } from "./supported-destinations";
import { ALL_REQUIREMENTS, type RequirementDef, type DocStatus } from "./requirements";

// ── Input ────────────────────────────────────────────────────────────────────

export type ChecklistInput = {
  /** ISO-2 codes of all passports the student holds. */
  passportCodes: string[];
  /** ISO-2 destination country code. */
  destinationCountry: string;
  /** Departure date (ISO string or Date). */
  startDate: string | Date;
  /** Return date (ISO string or Date). */
  endDate: string | Date;
};

// ── Output ───────────────────────────────────────────────────────────────────

export type ChecklistItem = RequirementDef & {
  /** Absolute deadline date for this item. */
  deadlineDate: Date;
  /** Human-readable deadline label (e.g. "Dans 12 jours", "Dépassé de 3 jours"). */
  deadlineLabel: string;
  /** Urgency level computed from deadline proximity. */
  urgency: "overdue" | "critical" | "soon" | "upcoming" | "future" | "post_arrival";
  /** Current status — default "todo", updated from user's documents. */
  status: DocStatus;
  /**
   * Days until deadline (negative = already passed for pre-departure,
   * or days after arrival for post-arrival items).
   */
  daysUntil: number;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function toDate(d: string | Date): Date {
  return d instanceof Date ? d : new Date(d);
}

function deadlineDate(departure: Date, daysBeforeDeparture: number): Date {
  const d = new Date(departure);
  d.setDate(d.getDate() + daysBeforeDeparture); // negative = before, positive = after
  return d;
}

function deadlineLabel(deadline: Date, now: Date, daysBeforeDeparture: number): string {
  const diffMs   = deadline.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (daysBeforeDeparture > 0) {
    // Post-arrival item
    if (diffDays < 0) return `Après l'arrivée (${Math.abs(daysBeforeDeparture)}j)`;
    return `${daysBeforeDeparture} jours après l'arrivée`;
  }

  if (diffDays < 0) return `Dépassé de ${Math.abs(diffDays)} jour${Math.abs(diffDays) > 1 ? "s" : ""}`;
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Demain";
  if (diffDays <= 7)  return `Dans ${diffDays} jours`;
  if (diffDays <= 30) return `Dans ${Math.round(diffDays / 7)} semaine${Math.round(diffDays / 7) > 1 ? "s" : ""}`;
  return `Dans ${Math.round(diffDays / 30)} mois`;
}

function urgency(deadline: Date, now: Date, daysBeforeDeparture: number): ChecklistItem["urgency"] {
  if (daysBeforeDeparture > 0) return "post_arrival";

  const diffDays = Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0)   return "overdue";
  if (diffDays <= 14) return "critical";
  if (diffDays <= 30) return "soon";
  if (diffDays <= 60) return "upcoming";
  return "future";
}

// ── Engine ───────────────────────────────────────────────────────────────────

/**
 * Generates a personalised, sorted checklist for the student.
 *
 * @param input       Student context.
 * @param doneDocTypes  Set of document types the student has already uploaded / completed.
 *                    (e.g. new Set(["passport", "insurance"])).
 */
export function buildChecklist(
  input: ChecklistInput,
  doneDocTypes: Set<string> = new Set(),
): ChecklistItem[] {
  if (!input.passportCodes.length || !input.destinationCountry || !input.startDate) {
    return [];
  }

  const tier = getBestTier(input.passportCodes);
  const zone = getDestinationZone(input.destinationCountry);

  // Unsupported destination → no checklist
  if (!zone) return [];

  const departure = toDate(input.startDate);
  const now       = new Date();

  const items: ChecklistItem[] = ALL_REQUIREMENTS
    // 1. Filter by tier and destination zone
    .filter((req) => req.tiers.includes(tier) && req.destinations.includes(zone))
    // 2. Build full item
    .map((req): ChecklistItem => {
      const dl    = deadlineDate(departure, req.daysBeforeDeparture);
      const label = deadlineLabel(dl, now, req.daysBeforeDeparture);
      const urg   = urgency(dl, now, req.daysBeforeDeparture);
      const done  = doneDocTypes.has(req.type);

      return {
        ...req,
        deadlineDate:  dl,
        deadlineLabel: label,
        urgency:       urg,
        daysUntil:     Math.round((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        status:        done ? "done" : "todo",
      };
    })
    // 3. Sort chronologically (most urgent first; post-arrival at the end)
    .sort((a, b) => {
      // Post-arrival items always come after pre-departure
      if (a.urgency === "post_arrival" && b.urgency !== "post_arrival") return 1;
      if (a.urgency !== "post_arrival" && b.urgency === "post_arrival") return -1;
      // Both post-arrival: sort by daysBeforeDeparture ascending
      return a.daysBeforeDeparture - b.daysBeforeDeparture;
    });

  return items;
}

// ── Summary ──────────────────────────────────────────────────────────────────

export type ChecklistSummary = {
  total:     number;
  done:      number;
  overdue:   number;
  critical:  number;
  score:     number; // 0–100
};

export function summarise(items: ChecklistItem[]): ChecklistSummary {
  const required = items.filter((i) => i.priority === "required");
  const done     = required.filter((i) => i.status === "done").length;
  const overdue  = required.filter((i) => i.urgency === "overdue" && i.status !== "done").length;
  const critical = required.filter((i) => i.urgency === "critical" && i.status !== "done").length;
  const score    = required.length ? Math.round((done / required.length) * 100) : 0;

  return { total: required.length, done, overdue, critical, score };
}
