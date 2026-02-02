"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATASETS_META = exports.CA_ETA_ELIGIBLE = exports.US_VWP = exports.UK_VISA_NATIONALS = exports.UK_ETA_ELIGIBLE = void 0;
const uk_eta_eligible_json_1 = __importDefault(require("../datasets/uk_eta_eligible.json"));
const uk_visa_nationals_json_1 = __importDefault(require("../datasets/uk_visa_nationals.json"));
const us_vwp_json_1 = __importDefault(require("../datasets/us_vwp.json"));
const ca_eta_eligible_json_1 = __importDefault(require("../datasets/ca_eta_eligible.json"));
const normalize = (iso2) => iso2.trim().toUpperCase();
exports.UK_ETA_ELIGIBLE = new Set(uk_eta_eligible_json_1.default.iso2.map(normalize));
exports.UK_VISA_NATIONALS = new Set(uk_visa_nationals_json_1.default.iso2.map(normalize));
exports.US_VWP = new Set(us_vwp_json_1.default.iso2.map(normalize));
exports.CA_ETA_ELIGIBLE = new Set(ca_eta_eligible_json_1.default.iso2.map(normalize));
exports.DATASETS_META = { ukEta: uk_eta_eligible_json_1.default, ukVisa: uk_visa_nationals_json_1.default, usVwp: us_vwp_json_1.default, caEta: ca_eta_eligible_json_1.default };
//# sourceMappingURL=datasets.js.map