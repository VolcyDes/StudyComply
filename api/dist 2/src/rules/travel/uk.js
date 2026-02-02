"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveUK = resolveUK;
const datasets_1 = require("./datasets");
function resolveUK(passportIso2) {
    const p = passportIso2.toUpperCase();
    if (p === "GB") {
        return { destination: "UK", status: "FREE", basedOn: p, message: "No visa or ETA required for UK citizens (short visits).",
            meta: { datasets: { ukEta: datasets_1.DATASETS_META.ukEta.updatedAt, ukVisa: datasets_1.DATASETS_META.ukVisa.updatedAt } } };
    }
    if (p === "IE") {
        return { destination: "UK", status: "FREE", basedOn: p, message: "No visa or ETA required for Irish citizens (CTA).",
            meta: { datasets: { ukEta: datasets_1.DATASETS_META.ukEta.updatedAt, ukVisa: datasets_1.DATASETS_META.ukVisa.updatedAt } } };
    }
    if (datasets_1.UK_VISA_NATIONALS.has(p)) {
        return { destination: "UK", status: "VISA_REQUIRED", basedOn: p, message: "A UK visit visa is required for short stays (visitor).",
            meta: { datasets: { ukVisa: datasets_1.DATASETS_META.ukVisa.updatedAt } } };
    }
    if (datasets_1.UK_ETA_ELIGIBLE.has(p)) {
        const extra = p === "TW" ? " (Taiwan: passport must include the Taiwan ID number to be ETA-eligible.)" : "";
        return { destination: "UK", status: "AUTH_REQUIRED", basedOn: p, message: `An ETA is required before travelling to the UK for short visits.${extra}`,
            meta: { auth: "ETA", datasets: { ukEta: datasets_1.DATASETS_META.ukEta.updatedAt } } };
    }
    return { destination: "UK", status: "FREE", basedOn: p, message: "No ETA listed for this passport; you may be able to enter as a visitor on arrival (short stays).",
        meta: { datasets: { ukEta: datasets_1.DATASETS_META.ukEta.updatedAt, ukVisa: datasets_1.DATASETS_META.ukVisa.updatedAt } } };
}
//# sourceMappingURL=uk.js.map