"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateEntry = evaluateEntry;
const travel_1 = require("../../rules/travel");
function buildCanadaLongStayDocs(bucket) {
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
function evaluateEntry(destination, passports, stayBucket = "SHORT") {
    const passport = (passports?.[0] ?? "").toUpperCase();
    if (!passport)
        throw new Error("No passport provided");
    switch (destination) {
        case "SCHENGEN": {
            const schengenFree = new Set([
                "AT", "BE", "BG", "CH", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR",
                "HR", "HU", "IS", "IT", "LI", "LT", "LU", "LV", "MT", "NL", "NO", "PL", "PT",
                "RO", "SE", "SI", "SK"
            ]);
            if (schengenFree.has(passport)) {
                return { destination: "SCHENGEN", status: "FREE", basedOn: passport, message: "Free movement within the Schengen Area (short stays)." };
            }
            return { destination: "SCHENGEN", status: "VISA_REQUIRED", basedOn: passport, message: "A Schengen visa is required." };
        }
        case "UK":
            return (0, travel_1.resolveUK)(passport);
        case "USA":
            return (0, travel_1.resolveUSA)(passport);
        case "CANADA":
            if (stayBucket && stayBucket !== "SHORT") {
                return {
                    destination: "CANADA",
                    status: "AUTH_REQUIRED",
                    basedOn: passport,
                    message: "Long stay in Canada: additional documents are required.",
                    meta: { stayBucket, longStay: true, arrival: "air" },
                    requiredDocuments: buildCanadaLongStayDocs(stayBucket),
                };
            }
            return (0, travel_1.resolveCANADA)(passport, "air");
        default:
            throw new Error("Unsupported destination: " + destination);
    }
}
//# sourceMappingURL=engine.js.map