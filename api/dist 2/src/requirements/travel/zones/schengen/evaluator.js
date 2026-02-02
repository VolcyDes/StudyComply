"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateSchengen = evaluateSchengen;
const countries_1 = require("./countries");
const visaFree_1 = require("./visaFree");
const rules_1 = require("./rules");
function evaluateSchengen(passports) {
    const cleaned = passports.map((p) => (p ?? "").trim().toUpperCase()).filter(Boolean);
    const schengenPassport = cleaned.find((p) => countries_1.SCHENGEN_COUNTRIES.has(p));
    if (schengenPassport) {
        return {
            destination: "SCHENGEN",
            status: "FREE",
            basedOn: schengenPassport,
            message: "Free movement within the Schengen Area (short stays).",
        };
    }
    const visaFreePassport = cleaned.find((p) => visaFree_1.SCHENGEN_VISA_FREE_MVP.has(p));
    if (visaFreePassport) {
        return {
            destination: "SCHENGEN",
            status: "VISA_FREE",
            basedOn: visaFreePassport,
            maxStayDays: rules_1.SCHENGEN_SHORT_STAY.maxStayDays,
            periodDays: rules_1.SCHENGEN_SHORT_STAY.periodDays,
            etiasRequired: rules_1.SCHENGEN_SHORT_STAY.etiasRequired,
            message: "No visa required for short stays. 90/180 rule applies.",
        };
    }
    return {
        destination: "SCHENGEN",
        status: "VISA_REQUIRED",
        basedOn: cleaned[0] ?? "UNKNOWN",
        message: "A Schengen visa is required before travel for short stays.",
    };
}
//# sourceMappingURL=evaluator.js.map