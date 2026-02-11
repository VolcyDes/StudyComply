function isoToDateInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function readProjectDates() {
  let start = "";
  let end = "";
  try { start = isoToDateInput(localStorage.getItem("activeProjectStartDate")); } catch {}
  try { end = isoToDateInput(localStorage.getItem("activeProjectEndDate")); } catch {}
  return { start, end };
}

function addYearsISO(base: Date, years: number): string {
  const d = new Date(base);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

function addDaysISO(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export type EntryResult =
  | { destination: "SCHENGEN"; status: "FREE"; basedOn: string; message: string }
  | {
      destination: "SCHENGEN";
      status: "VISA_FREE";
      basedOn: string;
      maxStayDays: number;
      periodDays: number;
      etiasRequired: boolean;
      message: string;
    }
  | { destination: "SCHENGEN"; status: "VISA_REQUIRED"; basedOn: string; message: string }
  | {
      destination: "UK" | "USA" | "CANADA";
      status: "AUTH_REQUIRED" | "VISA_REQUIRED" | "FREE" | "VISA_FREE";
      basedOn: string;
      message: string;
      meta?: Record<string, any>;
      requiredDocuments?: any[];
    };

export type NextStep = {
  title: string;
  detail: string;
  urgency: "LOW" | "MEDIUM" | "HIGH";
  createDoc?: { title: string; type: "eta" | "esta" | "visa" | "study_permit" };
  ctaLabel?: string;
};

export function computeNextStep(res: EntryResult, stayBucket?: string): NextStep {
  const auth = (res as any)?.meta?.auth as string | undefined;

  if ((res as any)?.destination === "CANADA" && (res as any)?.meta?.longStay) {
    return {
      title: "Apply for a Study Permit",
      detail:
        "For long stays in Canada, the main requirement is typically a Study Permit. An eTA may be needed only to board a flight (entry by air).",
      urgency: "HIGH",
      createDoc: { title: "Study Permit", type: "study_permit" },
      ctaLabel: "Create Study Permit document",
    };
  }

  if ((res as any)?.destination === "CANADA" && stayBucket && stayBucket !== "SHORT") {
    return {
      title: "Apply for a Study Permit",
      detail:
        "For studies longer than 6 months, you typically need a Canadian Study Permit. An eTA may only be needed to fly to Canada (entry requirement), not as a document of stay.",
      urgency: "HIGH",
      createDoc: { title: "Study Permit", type: "study_permit" },
      ctaLabel: "Create Study Permit document",
    };
  }

  if (auth === "ETA") {
    return {
      title: "Apply for a UK ETA",
      detail: "You must obtain an ETA before travelling to the UK for short visits.",
      urgency: "HIGH",
      createDoc: { title: "UK ETA", type: "eta" },
      ctaLabel: "Create ETA document",
    };
  }

  if (auth === "ESTA") {
    return {
      title: "Apply for a US ESTA",
      detail: "For short stays under the Visa Waiver Program, you need an approved ESTA before departure.",
      urgency: "HIGH",
      createDoc: { title: "US ESTA", type: "esta" },
      ctaLabel: "Create ESTA document",
    };
  }

  if (auth === "eTA") {
    return {
      title: "Apply for a Canada eTA",
      detail: "To fly to (or transit through) Canada, you need an eTA before travelling.",
      urgency: "HIGH",
      createDoc: { title: "Canada eTA", type: "eta" },
      ctaLabel: "Create eTA document",
    };
  }

  if (res.status === "FREE") {
    return {
      title: "Nothing urgent",
      detail:
        (res as any).destination === "SCHENGEN"
          ? "You have free movement for short stays in Schengen."
          : "You can travel for short visits without extra authorization.",
      urgency: "LOW",
    };
  }

  if (res.status === "VISA_REQUIRED") {
    return {
      title: "Start your visa application",
      detail: "A visa appears to be required for your passport. Begin the application process as soon as possible.",
      urgency: "HIGH",
      createDoc: { title: (res as any).destination === "SCHENGEN" ? "Schengen visa" : "Visa", type: "visa" },
      ctaLabel: "Create visa document",
    };
  }

  if ((res as any).destination === "SCHENGEN" && (res as any).status === "VISA_FREE") {
    if ((res as any).etiasRequired) {
      return {
        title: "Apply for ETIAS",
        detail: "You can travel visa-free for short stays, but ETIAS will be required before travel.",
        urgency: "MEDIUM",
        createDoc: { title: "ETIAS", type: "visa" },
        ctaLabel: "Create ETIAS document",
      };
    }
    return {
      title: "No additional authorization needed",
      detail: "You can travel visa-free for short stays in Schengen.",
      urgency: "LOW",
    };
  }

  return {
    title: "Check requirements",
    detail: "We couldn’t infer a single next step. Verify your travel requirements.",
    urgency: "MEDIUM",
  };
}

export function suggestedDateForCreate(docType: "eta" | "esta" | "visa" | "study_permit" | string | undefined): string {
  const now = new Date();
  const t = (docType || "").toLowerCase();
  const { start, end } = readProjectDates();

  if (t === "eta") return addYearsISO(now, 5);
  if (t === "esta") return addYearsISO(now, 2);

  if (t === "visa") {
    if (end) return end;
    if (start) return start;
    return addDaysISO(now, 90);
  }

  if (start) return start;
  return now.toISOString().slice(0, 10);
}

export function mapCreateDocTypeToBackend(type: "eta" | "esta" | "visa" | "study_permit" | string): string {
  if (type === "eta") return "ETA";
  if (type === "esta") return "ESTA";
  if (type === "visa") return "VISA";
  if (type === "study_permit") return "STUDY_PERMIT";
  return String(type).toUpperCase();
}
