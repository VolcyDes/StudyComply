// Travel entry requirement rules
// Status: FREE | VISA_FREE | AUTH_REQUIRED | VISA_REQUIRED

type EntryResult = {
  destination: string;
  status: "FREE" | "VISA_FREE" | "AUTH_REQUIRED" | "VISA_REQUIRED";
  basedOn: string;
  message: string;
  meta?: Record<string, any>;
};

// Countries that can enter UK visa-free (6 months)
const UK_VISA_FREE = new Set([
  "AT","AU","BE","BG","CA","CH","CY","CZ","DE","DK","EE","ES","FI","FR",
  "GR","HR","HU","IS","IT","JP","KR","LI","LT","LU","LV","MT","NL","NO",
  "NZ","PL","PT","RO","SE","SI","SK","US",
]);

// Countries that need UK ETA (Electronic Travel Authorisation)
const UK_ETA = new Set([
  "BH","JO","KW","OM","QA","SA","AE",
]);

export function resolveUK(passport: string): EntryResult {
  const p = passport.toUpperCase();
  if (UK_VISA_FREE.has(p)) {
    return {
      destination: "UK",
      status: "VISA_FREE",
      basedOn: p,
      message: "Visa-free entry for up to 6 months. An ETA may be required from 2025.",
    };
  }
  if (UK_ETA.has(p)) {
    return {
      destination: "UK",
      status: "AUTH_REQUIRED",
      basedOn: p,
      message: "An Electronic Travel Authorisation (ETA) is required before travelling to the UK.",
    };
  }
  return {
    destination: "UK",
    status: "VISA_REQUIRED",
    basedOn: p,
    message: "A UK visa is required before travel.",
  };
}

// Countries eligible for the US Visa Waiver Program (ESTA)
const USA_VWP = new Set([
  "AT","AU","BE","BG","CH","CZ","DE","DK","EE","ES","FI","FR","GR","HR",
  "HU","IS","IT","JP","KR","LI","LT","LU","LV","MT","NL","NO","NZ","PL",
  "PT","RO","SE","SI","SK","GB","SG","TW",
]);

export function resolveUSA(passport: string): EntryResult {
  const p = passport.toUpperCase();
  if (USA_VWP.has(p)) {
    return {
      destination: "USA",
      status: "AUTH_REQUIRED",
      basedOn: p,
      message: "ESTA authorisation required before travel. Valid for 2 years, multiple entries up to 90 days.",
    };
  }
  return {
    destination: "USA",
    status: "VISA_REQUIRED",
    basedOn: p,
    message: "A US visa (B1/B2) is required before travel.",
  };
}

// Countries eligible for Canada eTA
const CANADA_ETA = new Set([
  "AT","AU","BE","BG","CH","CZ","DE","DK","EE","ES","FI","FR","GR","HR",
  "HU","IS","IT","JP","KR","LI","LT","LU","LV","MT","NL","NO","NZ","PL",
  "PT","RO","SE","SI","SK","GB","SG",
]);

// Countries that can enter Canada visa-free by land/sea but need eTA by air
export function resolveCANADA(passport: string, mode: "air" | "land" = "air"): EntryResult {
  const p = passport.toUpperCase();

  // US citizens are always visa-free
  if (p === "US") {
    return {
      destination: "CANADA",
      status: "VISA_FREE",
      basedOn: p,
      message: "US citizens do not need a visa or eTA to enter Canada.",
    };
  }

  if (CANADA_ETA.has(p)) {
    if (mode === "air") {
      return {
        destination: "CANADA",
        status: "AUTH_REQUIRED",
        basedOn: p,
        message: "An Electronic Travel Authorisation (eTA) is required for air travel to Canada.",
        meta: { mode },
      };
    }
    return {
      destination: "CANADA",
      status: "VISA_FREE",
      basedOn: p,
      message: "Visa-free entry by land or sea. eTA required for air travel.",
      meta: { mode },
    };
  }

  return {
    destination: "CANADA",
    status: "VISA_REQUIRED",
    basedOn: p,
    message: "A Canadian visa is required before travel.",
    meta: { mode },
  };
}
