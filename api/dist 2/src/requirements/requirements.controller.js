"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequirementsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const requirements_service_1 = require("./requirements.service");
const passports_service_1 = require("../passports/passports.service");
const engine_1 = require("./travel/engine");
let RequirementsController = class RequirementsController {
    reqs;
    passportsService;
    constructor(reqs, passportsService) {
        this.reqs = reqs;
        this.passportsService = passportsService;
    }
    compute(req) {
        return this.reqs.compute(req.user.sub);
    }
    async travel(req, destination = "SCHENGEN", passport = "BEST", stayBucket = "SHORT") {
        const zone = destination.toString().toUpperCase();
        const userId = req.user?.sub;
        const passports = await this.passportsService.findAll(userId);
        const codesAll = passports.map((p) => p.countryCode);
        const forced = (passport ?? "BEST").toString().trim().toUpperCase();
        const codes = forced && forced !== "BEST" ? [forced] : codesAll;
        const bucket = (stayBucket ?? "SHORT").toString().trim().toUpperCase();
        return (0, engine_1.evaluateEntry)(zone, codes, bucket);
    }
};
exports.RequirementsController = RequirementsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RequirementsController.prototype, "compute", null);
__decorate([
    (0, common_1.Get)("travel"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)("destination")),
    __param(2, (0, common_1.Query)("passport")),
    __param(3, (0, common_1.Query)("stayBucket")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], RequirementsController.prototype, "travel", null);
exports.RequirementsController = RequirementsController = __decorate([
    (0, common_1.Controller)('api/v1/requirements'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [requirements_service_1.RequirementsService,
        passports_service_1.PassportsService])
], RequirementsController);
//# sourceMappingURL=requirements.controller.js.map