export type PublicUniversityRequirementDTO = {
  id: string;
  title: string;
  description?: string | null;
  kind: "REQUIRED" | "INFO";
  priority: "LOW" | "MEDIUM" | "HIGH";
  stayMode: "SHORT" | "LONG" | "ANY";
  dueDate?: string | null;
  dueDaysBefore?: number | null;
  computedDueDate?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
};
