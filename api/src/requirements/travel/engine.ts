import { resolveUK, resolveUSA, resolveCANADA } from "../../rules/travel";



function buildCanadaLongStayDocs(bucket: StayBucket): RequiredDoc[] {
  // Product-oriented checklist. Exact legal requirements depend on program/province/timeline.
  return [
    {
      id: "ca_study_permit",
      title: "Study permit",
      detail: "Required for studies longer than 6 months in Canada. Apply before you travel.",
      renewable: true,
      validityMonths: bucket === "MULTIYEAR" ? 24 : 12,
      whenToRenewMonthsBefore: 3,
      links: [
        { label: "IRCC — Study permit", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html" },
      ],
    },
    {
      id: "ca_eta",
      title: "eTA (if arriving by air)",
      detail: "Needed for visa-exempt foreign nationals flying to Canada (linked to your passport).",
      renewable: true,
      validityMonths: 60,
      whenToRenewMonthsBefore: 1,
      links: [
        { label: "IRCC — eTA", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta.html" },
      ],
    },
    {
      id: "ca_biometrics",
      title: "Biometrics (if required)",
      detail: "You may need to give biometrics as part of your application (validity often multiple years).",
      renewable: false,
      links: [
        { label: "IRCC — Biometrics", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/biometrics.html" },
      ],
    },
    {
      id: "ca_medical_exam",
      title: "Medical exam (if required)",
      detail: "May be required depending on your situation (e.g., program/length/recent residence).",
      renewable: false,
      links: [
        { label: "IRCC — Medical exam", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/medical-exams.html" },
      ],
    },
    {
      id: "ca_letter_acceptance",
      title: "Letter of acceptance / proof of enrollment",
      detail: "School documents required for the study permit application (and may be checked on arrival).",
      renewable: false,
    },
    {
      id: "ca_health_insurance",
      title: "Health insurance / provincial coverage",
      detail: "Requirements vary by province and school. Ensure coverage from day 1 and renew as needed.",
      renewable: true,
      validityMonths: 12,
      whenToRenewMonthsBefore: 1,
    },
  ];
}

export type DestinationZone = "SCHENGEN" | "UK" | "USA" | "CANADA";

export type StayBucket = "SHORT" | "SEMESTER" | "YEAR" | "MULTIYEAR";
export type RequiredDoc = {
  id: string;
  title: string;
  detail: string;
  renewable?: boolean;
  validityMonths?: number;
  whenToRenewMonthsBefore?: number;
  links?: { label: string; url: string }[];
};


export type EntryResult = {
  destination: DestinationZone;
  status: "FREE" | "VISA_REQUIRED" | "AUTH_REQUIRED" | "VISA_FREE";
  basedOn: string;
  message: string;
  meta?: Record<string, any>;
  requiredDocuments?: RequiredDoc[];
};

export function evaluateEntry(destination: DestinationZone, passports: string[], stayBucket: StayBucket = "SHORT"): EntryResult {
  const passportUpper = (passports?.[0] ?? "").toUpperCase();
  // CANADA_LONG_STAY_REQUIRED_DOCS_V1
  // For study stays > 6 months, the key requirement is a Study Permit.
  // eTA is an entry requirement (visa-exempt travellers by air), not a stay document.
  if (destination === "CANADA" && stayBucket && stayBucket !== "SHORT") {
    return {
      destination: "CANADA",
      // keep the same status family used by your frontend; INFO-like but with docs list
      status: "VISA_REQUIRED",
      basedOn: passportUpper,
      message:
        "Long stay in Canada: you will likely need a Study Permit (eTA may be required only to fly to Canada).",
      requiredDocuments: [
        {
          id: "study_permit",
          code: "STUDY_PERMIT",
          title: "Study Permit",
          detail: "Required to study in Canada for more than 6 months.",
        },
        {
          id: "letter_of_acceptance",
          code: "LETTER_OF_ACCEPTANCE",
          title: "Letter of acceptance",
          detail: "Proof of acceptance from a designated learning institution (DLI).",
        },
        {
          id: "biometrics",
          code: "BIOMETRICS",
          title: "Biometrics",
          detail: "You may need to give biometrics as part of your application (unless exempt).",
        },
        {
          id: "medical_exam",
          code: "MEDICAL_EXAM",
          title: "Medical exam",
          detail: "May be required depending on duration, travel history and job/health criteria.",
        },
        {
          id: "eta",
          code: "ETA",
          title: "Canada eTA (if travelling by air)",
          detail: "Entry requirement for visa-exempt travellers flying to Canada. Not a document of stay.",
        },
      ],
      meta: {
        longStay: true,
        primaryStayDoc: "STUDY_PERMIT",
        entryAuthMayApply: "ETA",
      },
    } as any;
  }

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
        return { destination: "SCHENGEN", status: "FREE", basedOn: passportUpper, message: "Free movement within the Schengen Area (short stays)." };
      }
      return { destination: "SCHENGEN", status: "VISA_REQUIRED", basedOn: passportUpper, message: "A Schengen visa is required." };
    }

    case "UK":
      return resolveUK(passport) as unknown as EntryResult;

    case "USA":
      return resolveUSA(passport) as unknown as EntryResult;

    case "CANADA":
      if (stayBucket && stayBucket !== "SHORT") {
        return {
          destination: "CANADA",
          status: "AUTH_REQUIRED",
          basedOn: passportUpper,
          message: "Long stay in Canada: additional documents are required.",
          meta: { stayBucket, longStay: true, arrival: "air" },
          requiredDocuments: buildCanadaLongStayDocs(stayBucket),
        };
      }
      return resolveCANADA(passport, "air") as unknown as EntryResult;

    default:
      throw new Error("Unsupported destination: " + destination);
  }
}
