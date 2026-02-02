"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveCANADA = resolveCANADA;
const datasets_1 = require("./datasets");
function resolveCANADA(passportIso2, arrival = "air") {
    const p = passportIso2.toUpperCase();
    if (p === "US") {
        return { destination: "CANADA", status: "FREE", basedOn: p, message: "No visa or eTA required for US citizens.",
            meta: { datasets: { caEta: datasets_1.DATASETS_META.caEta.updatedAt }, arrival } };
    }
    if (datasets_1.CA_ETA_ELIGIBLE.has(p)) {
        if (arrival === "land_sea") {
            return { destination: "CANADA", status: "FREE", basedOn: p, message: "No eTA needed when arriving by land or sea (passport still required).",
                meta: { datasets: { caEta: datasets_1.DATASETS_META.caEta.updatedAt }, arrival } };
        }
        const extra = p === "RO" ? " (Romania: eTA eligibility applies to electronic passport holders.)"
            : p === "TW" ? " (Taiwan: passport must include the personal identification number.)"
                : "";
        return { destination: "CANADA", status: "AUTH_REQUIRED", basedOn: p, message: `An eTA is required to fly to (or transit through) Canada for short visits.${extra}`,
            meta: { auth: "eTA", datasets: { caEta: datasets_1.DATASETS_META.caEta.updatedAt }, arrival } };
    }
    return { destination: "CANADA", status: "VISA_REQUIRED", basedOn: p, message: "A Canadian visitor visa is required for short stays based on this passport.",
        meta: { datasets: { caEta: datasets_1.DATASETS_META.caEta.updatedAt }, arrival } };
}
//# sourceMappingURL=canada.js.map