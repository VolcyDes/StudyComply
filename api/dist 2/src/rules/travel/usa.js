"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveUSA = resolveUSA;
const datasets_1 = require("./datasets");
function resolveUSA(passportIso2) {
    const p = passportIso2.toUpperCase();
    if (p === "US") {
        return { destination: "USA", status: "FREE", basedOn: p, message: "No visa/ESTA required for US citizens.",
            meta: { datasets: { usVwp: datasets_1.DATASETS_META.usVwp.updatedAt } } };
    }
    if (datasets_1.US_VWP.has(p)) {
        return { destination: "USA", status: "AUTH_REQUIRED", basedOn: p,
            message: "Travel under the Visa Waiver Program requires an approved ESTA (up to 90 days, tourism/business).",
            meta: { auth: "ESTA", datasets: { usVwp: datasets_1.DATASETS_META.usVwp.updatedAt } } };
    }
    return { destination: "USA", status: "VISA_REQUIRED", basedOn: p,
        message: "A US visitor visa is required for short stays (B1/B2), based on this passport.",
        meta: { datasets: { usVwp: datasets_1.DATASETS_META.usVwp.updatedAt } } };
}
//# sourceMappingURL=usa.js.map